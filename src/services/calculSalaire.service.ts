import { PointageRepository } from '../repositories/pointage.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CalculSalaireResult {
  typeContrat: string;
  heuresTravaillees: number;
  tauxHoraire: number;
  salaireBrut: number;
  deductions: number;
  salaireNet: number;
  montantAPayer: number;
  details: {
    nombreJoursTravailles?: number;
    joursPresents: string[];
    pointagesDetailles: Array<{
      date: string;
      heureArrivee?: string;
      heureDepart?: string;
      dureeMinutes?: number;
      heuresCalculees: number;
    }>;
  };
}

export class CalculSalaireService {
  private pointageRepo: PointageRepository;
  private bulletinRepo: BulletinPaieRepository;
  private employeRepo: EmployeRepository;
  
  constructor() {
    this.pointageRepo = new PointageRepository();
    this.bulletinRepo = new BulletinPaieRepository();
    this.employeRepo = new EmployeRepository();
  }

  /**
   * Calcule les heures travaillées basées sur les pointages réels
   * @param employeId ID de l'employé
   * @param cyclePaieId ID du cycle de paie
   * @returns Heures travaillées avec détails
   */
  private async calculerHeuresTravailleesDepuisPointages(
    employeId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<{
    totalHeures: number;
    pointagesDetailles: Array<{
      date: string;
      heureArrivee?: string;
      heureDepart?: string;
      dureeMinutes?: number;
      heuresCalculees: number;
    }>;
    joursPresents: string[];
  }> {
    // Récupérer tous les pointages de la période avec heures complètes
    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        },
        // Inclure seulement les pointages avec départ (session terminée)
        heureDepart: { not: null },
        statut: 'PRESENT'
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`📊 ${pointages.length} pointages valides trouvés pour l'employé ${employeId}`);

    let totalHeures = 0;
    const pointagesDetailles = [];
    const joursPresents = [];

    for (const pointage of pointages) {
      let heuresCalculees = 0;
      
      // Priorité 1: Utiliser dureeMinutes si disponible et valide
      if (pointage.dureeMinutes && pointage.dureeMinutes > 0) {
        heuresCalculees = pointage.dureeMinutes / 60;
        console.log(`📍 ${new Date(pointage.date).toLocaleDateString()} - Durée stockée: ${pointage.dureeMinutes} min = ${heuresCalculees.toFixed(2)}h`);
      }
      // Priorité 2: Calculer à partir des heures d'arrivée/départ
      else if (pointage.heureArrivee && pointage.heureDepart) {
        const arrivee = new Date(pointage.heureArrivee);
        const depart = new Date(pointage.heureDepart);
        
        if (depart > arrivee) {
          const diffMs = depart.getTime() - arrivee.getTime();
          const diffMinutes = diffMs / (1000 * 60);
          heuresCalculees = diffMinutes / 60;
          
          console.log(`📍 ${new Date(pointage.date).toLocaleDateString()} - Calculé: ${arrivee.toLocaleTimeString()} à ${depart.toLocaleTimeString()} = ${heuresCalculees.toFixed(2)}h`);
        }
      }

      if (heuresCalculees > 0) {
        totalHeures += heuresCalculees;
        joursPresents.push(new Date(pointage.date).toLocaleDateString('fr-FR'));
        
        pointagesDetailles.push({
          date: new Date(pointage.date).toLocaleDateString('fr-FR'),
          heureArrivee: pointage.heureArrivee ? new Date(pointage.heureArrivee).toLocaleTimeString('fr-FR') : undefined,
          heureDepart: pointage.heureDepart ? new Date(pointage.heureDepart).toLocaleTimeString('fr-FR') : undefined,
          dureeMinutes: pointage.dureeMinutes || undefined,
          heuresCalculees: Number(heuresCalculees.toFixed(2))
        });
      }
    }

    console.log(`⏰ Total heures calculées: ${totalHeures.toFixed(2)}h sur ${joursPresents.length} jours`);

    return {
      totalHeures: Number(totalHeures.toFixed(2)),
      pointagesDetailles,
      joursPresents
    };
  }

  /**
   * Calcule le salaire pour un employé FIXE/MENSUEL
   */
  async calculerSalaireMensuel(
    employeId: number,
    cyclePaieId: number
  ): Promise<CalculSalaireResult> {
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat !== 'FIXE') {
      throw new Error('Cette méthode ne s\'applique qu\'aux employés à salaire fixe');
    }

    const salaireBase = Number(employe.salaireBase) || 0;
    if (salaireBase <= 0) {
      throw new Error('Salaire de base manquant pour cet employé');
    }

    // Calculer les heures travaillées réelles
    const { totalHeures, pointagesDetailles, joursPresents } = await this.calculerHeuresTravailleesDepuisPointages(
      employeId,
      new Date(cyclePaie.dateDebut),
      new Date(cyclePaie.dateFin)
    );

    // Pour un mensuel : taux horaire = salaire base / heures prévues (ex: 173h/mois)
    const heuresPreevuesMensuel = 173; // Heures standard pour un temps plein
    const tauxHoraireCalcule = salaireBase / heuresPreevuesMensuel;

    // Calculer les absences et déductions
    const absences = await this.pointageRepo.listerAbsencesParPeriode(
      employeId,
      new Date(cyclePaie.dateDebut),
      new Date(cyclePaie.dateFin)
    );

    const montantDeductionParAbsence = 15000; // 15,000 F CFA par jour d'absence
    const deductions = absences.length * montantDeductionParAbsence;
    const salaireNet = Math.max(0, salaireBase - deductions);

    return {
      typeContrat: 'FIXE',
      heuresTravaillees: totalHeures,
      tauxHoraire: Number(tauxHoraireCalcule.toFixed(2)),
      salaireBrut: salaireBase,
      deductions,
      salaireNet,
      montantAPayer: salaireNet,
      details: {
        nombreJoursTravailles: joursPresents.length,
        joursPresents,
        pointagesDetailles
      }
    };
  }

  /**
   * Calcule le salaire pour un employé JOURNALIER
   */
  async calculerSalaireJournalier(
    employeId: number,
    cyclePaieId: number
  ): Promise<CalculSalaireResult> {
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat !== 'JOURNALIER') {
      throw new Error('Cette méthode ne s\'applique qu\'aux employés journaliers');
    }

    const tauxJournalier = Number(employe.tauxJournalier) || 0;
    if (tauxJournalier <= 0) {
      throw new Error('Taux journalier manquant pour cet employé');
    }

    // Calculer les heures travaillées réelles
    const { totalHeures, pointagesDetailles, joursPresents } = await this.calculerHeuresTravailleesDepuisPointages(
      employeId,
      new Date(cyclePaie.dateDebut),
      new Date(cyclePaie.dateFin)
    );

    // Pour un journalier : calcul basé sur les jours travaillés
    const nombreJoursTravailles = joursPresents.length;
    const salaireBrut = nombreJoursTravailles * tauxJournalier;

    // Taux horaire moyen = taux journalier / 8h (journée standard)
    const heuresParJour = 8;
    const tauxHoraireEquivalent = tauxJournalier / heuresParJour;

    return {
      typeContrat: 'JOURNALIER',
      heuresTravaillees: totalHeures,
      tauxHoraire: Number(tauxHoraireEquivalent.toFixed(2)),
      salaireBrut,
      deductions: 0, // Pas de déductions pour les journaliers
      salaireNet: salaireBrut,
      montantAPayer: salaireBrut,
      details: {
        nombreJoursTravailles,
        joursPresents,
        pointagesDetailles
      }
    };
  }

  /**
   * Calcule le salaire pour un employé HONORAIRE
   */
  async calculerSalaireHonoraire(
    employeId: number,
    cyclePaieId: number
  ): Promise<CalculSalaireResult> {
    const cyclePaie = await this.bulletinRepo.obtenirCyclePaie(cyclePaieId);
    if (!cyclePaie) {
      throw new Error('Cycle de paie introuvable');
    }

    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    if (employe.typeContrat !== 'HONORAIRE') {
      throw new Error('Cette méthode ne s\'applique qu\'aux employés honoraires');
    }

    const tauxHoraire = Number(employe.tauxHoraire) || 0;
    if (tauxHoraire <= 0) {
      throw new Error('Taux horaire manquant pour cet employé');
    }

    // Calculer les heures travaillées réelles
    const { totalHeures, pointagesDetailles, joursPresents } = await this.calculerHeuresTravailleesDepuisPointages(
      employeId,
      new Date(cyclePaie.dateDebut),
      new Date(cyclePaie.dateFin)
    );

    // Pour un honoraire : salaire = heures travaillées × taux horaire
    const salaireBrut = totalHeures * tauxHoraire;

    return {
      typeContrat: 'HONORAIRE',
      heuresTravaillees: totalHeures,
      tauxHoraire,
      salaireBrut,
      deductions: 0, // Pas de déductions standard pour les honoraires
      salaireNet: salaireBrut,
      montantAPayer: salaireBrut,
      details: {
        nombreJoursTravailles: joursPresents.length,
        joursPresents,
        pointagesDetailles
      }
    };
  }

  /**
   * Calcule le salaire selon le type de contrat
   */
  async calculerSalaire(
    employeId: number,
    cyclePaieId: number
  ): Promise<CalculSalaireResult> {
    const employe = await this.employeRepo.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé introuvable');
    }

    console.log(`💼 Calcul salaire pour ${employe.prenom} ${employe.nom} (${employe.typeContrat})`);

    switch (employe.typeContrat) {
      case 'FIXE':
        return this.calculerSalaireMensuel(employeId, cyclePaieId);
      case 'JOURNALIER':
        return this.calculerSalaireJournalier(employeId, cyclePaieId);
      case 'HONORAIRE':
        return this.calculerSalaireHonoraire(employeId, cyclePaieId);
      default:
        throw new Error(`Type de contrat non supporté: ${employe.typeContrat}`);
    }
  }

  /**
   * Met à jour le bulletin de paie avec les calculs
   */
  async mettreAJourBulletinAvecCalculs(
    bulletinId: number,
    calculs: CalculSalaireResult
  ) {
    const updateData: any = {
      salaireBrut: calculs.salaireBrut,
      salaireNet: calculs.salaireNet,
      deductions: calculs.deductions,
      misAJourLe: new Date()
    };

    // Ajouter les champs spécifiques selon le type
    switch (calculs.typeContrat) {
      case 'JOURNALIER':
        updateData.joursTravailes = calculs.details.nombreJoursTravailles;
        updateData.tauxJournalier = calculs.tauxHoraire * 8; // Reconvertir en taux journalier
        break;
      case 'HONORAIRE':
        updateData.totalHeuresTravaillees = calculs.heuresTravaillees;
        updateData.tauxHoraire = calculs.tauxHoraire;
        break;
      case 'FIXE':
        updateData.nombreAbsences = calculs.details.joursPresents.length > 0 ? 0 : 1; // Simplification
        updateData.montantDeduction = calculs.deductions;
        break;
    }

    return await prisma.bulletinPaie.update({
      where: { id: bulletinId },
      data: updateData,
      include: {
        employe: true,
        cyclePaie: true
      }
    });
  }
}

export const calculSalaireService = new CalculSalaireService();