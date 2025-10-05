import { PointageRepository } from '../repositories/pointage.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';

interface CalculMensuelResult {
  nombreAbsences: number;
  joursAbsences: string[];
  montantDeduction: number;
  salaireBrut: number;
  salaireNet: number;
  typeCalcul: string;
}

interface CalculJournalierResult {
  nombreJoursTravailles: number;
  joursPresents: string[];
  tauxJournalier: number;
  salaireBrut: number;
  salaireNet: number;
  typeCalcul: string;
}

interface CalculHonoraireResult {
  totalHeuresTravaillees: number;
  tauxHoraire: number;
  salaireBrut: number;
  salaireNet: number;
  typeCalcul: string;
  joursPresents: string[];
}

export class AbsenceService {
  private pointageRepo: PointageRepository;
  private bulletinRepo: BulletinPaieRepository;
  private employeRepo: EmployeRepository;
  
  constructor() {
    this.pointageRepo = new PointageRepository();
    this.bulletinRepo = new BulletinPaieRepository();
    this.employeRepo = new EmployeRepository();
  }

  /**
   * Calculer les absences/présences pour le mois du cycle de paie
   */
  async calculerPointagesMoisCycle(
    employeId: number, 
    cyclePaieId: number
  ): Promise<CalculMensuelResult & { nombrePresences: number, joursPresents: string[], salaireCalcule: number }> {
    // Récupérer le cycle de paie pour obtenir ses dates
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    // Récupérer l'employé pour connaître son type de contrat et son taux
    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    // Calculer le mois du cycle de paie (début et fin du cycle)
    const dateDebutCycle = new Date(cyclePaie.dateDebut);
    const dateFinCycle = new Date(cyclePaie.dateFin);

    // Récupérer tous les pointages du mois du cycle
    const tousPointages = await this.pointageRepo.listerParEmployeEtPeriode(
      employeId,
      dateDebutCycle,
      dateFinCycle
    );

    // Séparer absences et présences
    const absences = tousPointages.filter((p: any) => p.statut === 'ABSENT');
    const presences = tousPointages.filter((p: any) => p.statut === 'PRESENT');

    // Formater les dates
    const joursAbsences = absences.map((absence: any) => 
      new Date(absence.date).toISOString().split('T')[0]
    );
    
    const joursPresents = presences.map((presence: any) => 
      new Date(presence.date).toISOString().split('T')[0]
    );

    let montantDeduction = 0;
    let salaireCalcule = 0;

    if (employe.typeContrat === 'FIXE') {
      // Pour les employés fixes : déduction de 15 000 F CFA par absence
      const DEDUCTION_PAR_ABSENCE = 15000;
      montantDeduction = absences.length * DEDUCTION_PAR_ABSENCE;
      salaireCalcule = (employe.salaireBase || 0) - montantDeduction;
    } else if (employe.typeContrat === 'JOURNALIER') {
      // Pour les employés journaliers : nombre de jours présents × taux journalier
      const tauxJournalier = employe.tauxJournalier || 0;
      salaireCalcule = presences.length * tauxJournalier;
      montantDeduction = 0; // Pas de déduction, on paie selon les présences
    }

    const moisCycleStr = `${dateDebutCycle.getFullYear()}-${String(dateDebutCycle.getMonth() + 1).padStart(2, '0')}`;

    return {
      nombreAbsences: absences.length,
      joursAbsences,
      montantDeduction,
      salaireBrut: employe.salaireBase || 0,
      salaireNet: Math.max(0, salaireCalcule),
      typeCalcul: 'MENSUEL',
      nombrePresences: presences.length,
      joursPresents,
      salaireCalcule
    };
  }

    /**
   * Calculer le salaire pour un employé honoraire
   */
  async calculerSalaireHonoraire(
    employeId: number, 
    cyclePaieId: number
  ): Promise<CalculHonoraireResult> {
    // Récupérer le cycle de paie pour obtenir ses dates
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    // Récupérer l'employé pour connaître son salaire de base (honoraire)
    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat !== 'HONORAIRE') {
      throw new Error('Cette méthode ne s\'applique qu\'aux employés honoraires');
    }

    // Vérifier que l'employé a un taux horaire défini
    if (!employe.tauxHoraire || employe.tauxHoraire <= 0) {
      throw new Error('Taux horaire manquant pour cet employé. Veuillez configurer le taux horaire dans la fiche employé.');
    }

    console.log(`💼 Calcul honoraire pour l'employé ${employeId} du ${cyclePaie.dateDebut} au ${cyclePaie.dateFin}`);

    // Récupérer tous les pointages du mois du cycle de paie
    const pointages = await this.pointageRepo.listerPresencesParPeriode(
      employeId,
      cyclePaie.dateDebut,
      cyclePaie.dateFin
    );

    console.log(`📊 ${pointages.length} pointages trouvés pour l'employé ${employeId}`);

    let totalHeuresTravaillees = 0;
    const joursPresents: string[] = [];

    // Calculer les heures travaillées pour chaque pointage
    for (const pointage of pointages) {
      let heures = 0;
      
      // Priorité 1: Utiliser dureeMinutes s'il est disponible
      if (pointage.dureeMinutes && pointage.dureeMinutes > 0) {
        heures = pointage.dureeMinutes / 60; // Convertir minutes en heures
        console.log(`📍 Pointage ${new Date(pointage.date).toLocaleDateString()}: ${pointage.dureeMinutes} min = ${heures.toFixed(2)}h`);
      }
      // Priorité 2: Calculer à partir des heures d'arrivée/départ
      else if (pointage.heureArrivee && pointage.heureDepart) {
        const arrivee = new Date(pointage.heureArrivee);
        const depart = new Date(pointage.heureDepart);
        
        // Calculer la différence en minutes puis convertir en heures
        const diffMs = depart.getTime() - arrivee.getTime();
        const diffMinutes = diffMs / (1000 * 60); // Convertir ms en minutes
        heures = diffMinutes / 60; // Convertir minutes en heures
        
        console.log(`📍 Pointage ${new Date(pointage.date).toLocaleDateString()}: ${arrivee.toLocaleTimeString()} - ${depart.toLocaleTimeString()} = ${heures.toFixed(2)}h`);
      }
      
      if (heures > 0) {
        totalHeuresTravaillees += heures;
        joursPresents.push(new Date(pointage.date).toLocaleDateString('fr-FR'));
      }
    }

    console.log(`⏰ Total heures travaillées: ${totalHeuresTravaillees.toFixed(2)}h, Taux: ${employe.tauxHoraire} F CFA/h`);

    const tauxHoraire = Number(employe.tauxHoraire) || 0;
    const salaireBrut = totalHeuresTravaillees * tauxHoraire;

    return {
      totalHeuresTravaillees: Number(totalHeuresTravaillees.toFixed(2)),
      tauxHoraire,
      salaireBrut,
      salaireNet: salaireBrut, // Pour les honoraires, pas de déductions par défaut
      typeCalcul: 'HONORAIRE',
      joursPresents
    };
  }

  /**
   * Calculer le salaire pour un employé journalier
   */
  async calculerSalaireJournalier(
    employeId: number, 
    cyclePaieId: number
  ): Promise<CalculJournalierResult> {
    // Récupérer le cycle de paie pour obtenir ses dates
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    // Récupérer l'employé pour connaître son taux journalier
    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat !== 'JOURNALIER') {
      throw new Error('Cette méthode ne s\'applique qu\'aux employés journaliers');
    }

    // Vérifier que l'employé a un taux journalier défini
    if (!employe.tauxJournalier || employe.tauxJournalier <= 0) {
      throw new Error('Taux journalier manquant pour cet employé. Veuillez configurer le taux journalier dans la fiche employé.');
    }

    // Calculer le mois du cycle de paie (début et fin du cycle)
    const dateDebutCycle = new Date(cyclePaie.dateDebut);
    const dateFinCycle = new Date(cyclePaie.dateFin);

    console.log(`🔍 Recherche des présences pour l'employé ${employeId} du ${dateDebutCycle.toISOString().split('T')[0]} au ${dateFinCycle.toISOString().split('T')[0]}`);

    // Récupérer tous les pointages de présence du mois du cycle
    const presences = await this.pointageRepo.listerPresencesParPeriode(
      employeId,
      dateDebutCycle,
      dateFinCycle
    );

    console.log(`✅ Nombre de présences trouvées: ${presences.length}`);

    // Formater les dates de présences
    const joursPresents = presences.map((presence: any) => {
      const dateStr = new Date(presence.date).toISOString().split('T')[0];
      console.log(`📅 Jour présent: ${dateStr}`);
      return dateStr;
    });

    const tauxJournalier = Number(employe.tauxJournalier) || 0;
    const nombreJoursTravailles = presences.length;
    const salaireBrut = nombreJoursTravailles * tauxJournalier;

    console.log(`💰 Calcul: ${nombreJoursTravailles} jours × ${tauxJournalier} F CFA = ${salaireBrut} F CFA`);

    return {
      nombreJoursTravailles,
      joursPresents,
      tauxJournalier,
      salaireBrut,
      salaireNet: salaireBrut, // Pour les journaliers, pas de déductions par défaut
      typeCalcul: 'JOURNALIER'
    };
  }

  /**
   * Calculer le salaire pour un employé mensuel (FIXE)
   */
  async calculerSalaireMensuel(
    employeId: number, 
    cyclePaieId: number
  ): Promise<CalculMensuelResult> {
    // Utiliser la méthode existante mais retourner le bon format
    const resultat = await this.calculerPointagesMoisCycle(employeId, cyclePaieId);
    
    return {
      nombreAbsences: resultat.nombreAbsences,
      joursAbsences: resultat.joursAbsences,
      montantDeduction: resultat.montantDeduction,
      salaireBrut: resultat.salaireBrut,
      salaireNet: resultat.salaireNet,
      typeCalcul: resultat.typeCalcul
    };
  }

  /**
   * Mettre à jour un bulletin de paie avec les calculs automatiques selon le type d'employé
   */
  async mettreAJourBulletinAvecAbsences(
    bulletinId: number
  ): Promise<{ bulletin: any, calculData: any }> {
    // Récupérer le bulletin
    const bulletin = await this.bulletinRepo.obtenirParId(bulletinId);
    if (!bulletin) {
      throw new Error('Bulletin introuvable');
    }

    // Récupérer l'employé pour connaître son type de contrat
    const employe = await this.employeRepo.trouverParId(bulletin.employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat === 'JOURNALIER') {
      // Pour les journaliers : calculer selon les jours travaillés
      const journalierInfo = await this.calculerSalaireJournalier(
        bulletin.employeId,
        bulletin.cyclePaieId
      );

      console.log('🔄 Mise à jour du bulletin journalier:', {
        bulletinId,
        joursTravailes: journalierInfo.nombreJoursTravailles,
        salaireBrut: journalierInfo.salaireBrut,
        salaireNet: journalierInfo.salaireNet
      });

      // Mettre à jour le bulletin avec les informations journalières
      await this.bulletinRepo.mettreAJourJournalier(bulletinId, {
        joursTravailes: journalierInfo.nombreJoursTravailles,
        tauxJournalier: journalierInfo.tauxJournalier,
        salaireBrut: journalierInfo.salaireBrut,
        salaireNet: journalierInfo.salaireNet,
        joursAbsences: JSON.stringify(journalierInfo.joursPresents) // Stocker les jours présents
      });
    } else if (employe.typeContrat === 'HONORAIRE') {
      // Pour les honoraires : montant fixe
      const honoraireInfo = await this.calculerSalaireHonoraire(
        bulletin.employeId,
        bulletin.cyclePaieId
      );

      console.log('🔄 Mise à jour du bulletin honoraire:', {
        bulletinId,
        salaireBrut: honoraireInfo.salaireBrut,
        salaireNet: honoraireInfo.salaireNet
      });

      // Mettre à jour le bulletin avec les informations d'honoraire
      await this.bulletinRepo.mettreAJourHonoraire(bulletinId, {
        salaireBrut: honoraireInfo.salaireBrut,
        salaireNet: honoraireInfo.salaireNet,
        totalHeuresTravaillees: honoraireInfo.totalHeuresTravaillees,
        tauxHoraire: honoraireInfo.tauxHoraire
      });
    } else {
      // Pour les autres types : calculer les absences
      const absencesInfo = await this.calculerPointagesMoisCycle(
        bulletin.employeId,
        bulletin.cyclePaieId
      );

      // Recalculer le salaire net
      const nouveauSalaireNet = Math.max(0, absencesInfo.salaireCalcule);

      // Mettre à jour le bulletin en base
      await this.bulletinRepo.mettreAJourAbsences(bulletinId, {
        nombreAbsences: absencesInfo.nombreAbsences,
        joursAbsences: JSON.stringify(absencesInfo.joursAbsences),
        montantDeduction: absencesInfo.montantDeduction,
        salaireNet: nouveauSalaireNet
      });

      return {
        bulletin: await this.bulletinRepo.obtenirParId(bulletinId),
        calculData: absencesInfo
      };
    }

    // Par défaut, retourner les données mises à jour
    const bulletinMisAJour = await this.bulletinRepo.obtenirParId(bulletinId);
    
    // Récupérer les données selon le type d'employé
    let calculData;
    if (employe.typeContrat === 'JOURNALIER') {
      calculData = await this.calculerSalaireJournalier(bulletin.employeId, bulletin.cyclePaieId);
    } else if (employe.typeContrat === 'HONORAIRE') {
      calculData = await this.calculerSalaireHonoraire(bulletin.employeId, bulletin.cyclePaieId);
    } else {
      calculData = await this.calculerSalaireMensuel(bulletin.employeId, bulletin.cyclePaieId);
    }

    return {
      bulletin: bulletinMisAJour,
      calculData
    };
  }

  /**
   * Calculer et mettre à jour tous les bulletins d'un cycle avec les absences
   */
  async mettreAJourCycleAvecAbsences(cyclePaieId: number): Promise<void> {
    // Récupérer tous les bulletins du cycle pour les employés fixes
    const bulletins = await this.bulletinRepo.listerParCycleEtTypeContrat(cyclePaieId, 'FIXE');

    // Traiter chaque bulletin
    for (const bulletin of bulletins) {
      await this.mettreAJourBulletinAvecAbsences(bulletin.id);
    }
  }
}