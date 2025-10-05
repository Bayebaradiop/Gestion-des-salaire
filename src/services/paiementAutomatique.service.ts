import { PointageRepository } from '../repositories/pointage.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { CyclePaieRepository } from '../repositories/cyclePaie.repository.js';
import type { CreerBulletinPaieData } from '../repositories/bulletinPaie.repository.js';
import type { TypeContrat, StatutPointage } from '@prisma/client';

interface CalculResultat {
  employeId: number;
  typeContrat: TypeContrat;
  salaireBase: number;
  salaireBrut: number;
  salaireNet: number;
  joursTravailes?: number;
  heuresTravailes?: number;
  joursAbsents?: number;
  details: {
    joursOuvres: number;
    joursPresents: number;
    joursAbsents: number;
    heuresTravaileesTotales: number;
    tauxJournalier?: number;
    tauxHoraire?: number;
  };
}

export class PaiementAutomatiqueService {
  private pointageRepo: PointageRepository;
  private employeRepo: EmployeRepository;
  private bulletinRepo: BulletinPaieRepository;
  private cycleRepo: CyclePaieRepository;

  constructor() {
    this.pointageRepo = new PointageRepository();
    this.employeRepo = new EmployeRepository();
    this.bulletinRepo = new BulletinPaieRepository();
    this.cycleRepo = new CyclePaieRepository();
  }

  /**
   * Calcule automatiquement les salaires basés sur les pointages pour une période donnée
   */
  async calculerSalairesAutomatiques(
    entrepriseId: number,
    cyclePaieId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<CalculResultat[]> {
    // Récupérer tous les employés actifs
    const employes = await this.employeRepo.listerActifsParEntreprise(entrepriseId);
    
    // Récupérer tous les pointages pour la période
    const pointages = await this.pointageRepo.listerParEntreprise(entrepriseId, {
      du: dateDebut,
      au: dateFin
    });

    const resultats: CalculResultat[] = [];

    for (const employe of employes) {
      // Filtrer les pointages de cet employé
      const pointagesEmploye = pointages.filter(p => p.employeId === employe.id);
      
      // Calculer selon le type de contrat
      const resultat = await this.calculerSalaireEmploye(
        employe,
        pointagesEmploye,
        dateDebut,
        dateFin
      );

      resultats.push(resultat);
    }

    return resultats;
  }

  /**
   * Calcule le salaire d'un employé basé sur ses pointages
   */
  private async calculerSalaireEmploye(
    employe: any,
    pointages: any[],
    dateDebut: Date,
    dateFin: Date
  ): Promise<CalculResultat> {
    const joursOuvres = this.calculerJoursOuvres(dateDebut, dateFin);
    const joursPresents = pointages.filter(p => 
      p.statut === 'PRESENT' || p.statut === 'RETARD'
    ).length;
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;
    
    // Calculer les heures travaillées totales
    const heuresTravaileesTotales = pointages.reduce((total, p) => {
      return total + (p.dureeMinutes ? p.dureeMinutes / 60 : 0);
    }, 0);

    let salaireBrut = 0;
    let salaireNet = 0;
    let joursTravailes = 0;
    let heuresTravailes = 0;

    switch (employe.typeContrat) {
      case 'FIXE':
        // Employé fixe : salaire de base moins les déductions pour absences
        salaireBrut = employe.salaireBase || 0;
        
        // Déduction proportionnelle pour les absences
        const tauxAbsence = joursAbsents / joursOuvres;
        const deductionAbsence = salaireBrut * tauxAbsence;
        salaireNet = salaireBrut - deductionAbsence;
        joursTravailes = joursPresents;
        break;

      case 'JOURNALIER':
        // Employé journalier : taux journalier × jours travaillés
        const tauxJournalier = employe.tauxJournalier || 0;
        joursTravailes = joursPresents;
        salaireBrut = tauxJournalier * joursTravailes;
        salaireNet = salaireBrut;
        break;

      case 'HORAIRE':
        // Employé horaire : taux horaire × heures travaillées
        // Si pas de taux horaire défini, on calcule à partir du salaire de base
        let tauxHoraire = 0;
        if ((employe as any).tauxHoraire) {
          tauxHoraire = (employe as any).tauxHoraire;
        } else if (employe.salaireBase) {
          // Calculer le taux horaire : salaire mensuel / (22 jours × 8 heures)
          tauxHoraire = employe.salaireBase / (22 * 8);
        }
        
        heuresTravailes = Math.round(heuresTravaileesTotales * 100) / 100;
        salaireBrut = tauxHoraire * heuresTravailes;
        salaireNet = salaireBrut;
        break;

      default:
        // Par défaut, utiliser le salaire de base
        salaireBrut = employe.salaireBase || 0;
        salaireNet = salaireBrut;
        joursTravailes = joursPresents;
    }

    // Appliquer les déductions standard (peut être personnalisé)
    const deductions = this.calculerDeductions(salaireBrut);
    salaireNet = Math.max(0, salaireNet - deductions);

    return {
      employeId: employe.id,
      typeContrat: employe.typeContrat,
      salaireBase: employe.salaireBase || 0,
      salaireBrut: Math.round(salaireBrut * 100) / 100,
      salaireNet: Math.round(salaireNet * 100) / 100,
      joursTravailes: employe.typeContrat === 'JOURNALIER' ? joursTravailes : undefined,
      heuresTravailes: employe.typeContrat === 'HORAIRE' ? heuresTravailes : undefined,
      joursAbsents,
      details: {
        joursOuvres,
        joursPresents,
        joursAbsents,
        heuresTravaileesTotales: Math.round(heuresTravaileesTotales * 100) / 100,
        tauxJournalier: employe.tauxJournalier,
        tauxHoraire: (employe as any).tauxHoraire || (employe.salaireBase ? employe.salaireBase / (22 * 8) : undefined)
      }
    };
  }

  /**
   * Génère automatiquement les bulletins de paie basés sur les pointages
   */
  async genererBulletinsAutomatiques(
    entrepriseId: number,
    cyclePaieId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<any[]> {
    // Calculer les salaires automatiquement
    const calculs = await this.calculerSalairesAutomatiques(
      entrepriseId,
      cyclePaieId,
      dateDebut,
      dateFin
    );

    const bulletins = [];

    for (const calcul of calculs) {
      // Vérifier si un bulletin existe déjà pour cet employé dans ce cycle
      const bulletinExistant = await this.bulletinRepo.trouverParCycleEtEmploye(
        cyclePaieId,
        calcul.employeId
      );

      if (bulletinExistant) {
        // Mettre à jour le bulletin existant
        const bulletinMisAJour = await this.bulletinRepo.mettreAJour(bulletinExistant.id, {
          joursTravailes: calcul.joursTravailes,
          salaireBrut: calcul.salaireBrut,
          deductions: calcul.salaireBrut - calcul.salaireNet,
          salaireNet: calcul.salaireNet
        });
        bulletins.push(bulletinMisAJour);
      } else {
        // Créer un nouveau bulletin
        const numeroBulletin = `BP-${cyclePaieId.toString().padStart(8, '0')}-${calcul.employeId.toString().padStart(8, '0')}`;
        
        const bulletinData: CreerBulletinPaieData = {
          numeroBulletin,
          joursTravailes: calcul.joursTravailes,
          salaireBrut: calcul.salaireBrut,
          deductions: calcul.salaireBrut - calcul.salaireNet,
          salaireNet: calcul.salaireNet,
          employeId: calcul.employeId,
          cyclePaieId
        };

        const nouveauBulletin = await this.bulletinRepo.creer(bulletinData);
        bulletins.push(nouveauBulletin);
      }
    }

    // Mettre à jour les totaux du cycle
    await this.cycleRepo.mettreAJourTotaux(cyclePaieId);

    return bulletins;
  }

  /**
   * Obtient un aperçu des calculs sans les sauvegarder
   */
  async obtenirApercuCalculs(
    entrepriseId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<{
    employes: any[];
    calculs: CalculResultat[];
    resume: {
      totalEmployes: number;
      totalSalaireBrut: number;
      totalSalaireNet: number;
      totalJoursTravailes: number;
      totalHeuresTravailes: number;
    };
  }> {
    const employes = await this.employeRepo.listerActifsParEntreprise(entrepriseId);
    const calculs = await this.calculerSalairesAutomatiques(entrepriseId, 0, dateDebut, dateFin);

    const resume = {
      totalEmployes: calculs.length,
      totalSalaireBrut: calculs.reduce((sum, c) => sum + c.salaireBrut, 0),
      totalSalaireNet: calculs.reduce((sum, c) => sum + c.salaireNet, 0),
      totalJoursTravailes: calculs.reduce((sum, c) => sum + (c.joursTravailes || 0), 0),
      totalHeuresTravailes: calculs.reduce((sum, c) => sum + (c.heuresTravailes || 0), 0)
    };

    return { employes, calculs, resume };
  }

  /**
   * Calcule le nombre de jours ouvrés entre deux dates (exclut weekends)
   */
  private calculerJoursOuvres(dateDebut: Date, dateFin: Date): number {
    let count = 0;
    const current = new Date(dateDebut);

    while (current <= dateFin) {
      const dayOfWeek = current.getDay();
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Calcule les déductions standard (CNSS, impôts, etc.)
   */
  private calculerDeductions(salaireBrut: number): number {
    // Exemple de calcul de déductions (à adapter selon les règles locales)
    let deductions = 0;

    // CNSS employé (exemple : 3.5% du salaire brut)
    const cnss = salaireBrut * 0.035;
    deductions += cnss;

    // Impôt sur le revenu progressif (exemple simplifié)
    if (salaireBrut > 500000) {
      const imposable = salaireBrut - 500000;
      const impot = imposable * 0.1; // 10% sur la tranche supérieure à 500k
      deductions += impot;
    }

    return Math.round(deductions * 100) / 100;
  }

  /**
   * Valide les pointages avant le calcul automatique
   */
  async validerPointagesPourCalcul(
    entrepriseId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<{
    valide: boolean;
    erreurs: string[];
    avertissements: string[];
  }> {
    const erreurs: string[] = [];
    const avertissements: string[] = [];

    // Récupérer les employés et pointages
    const employes = await this.employeRepo.listerActifsParEntreprise(entrepriseId);
    const pointages = await this.pointageRepo.listerParEntreprise(entrepriseId, {
      du: dateDebut,
      au: dateFin
    });

    const joursOuvres = this.calculerJoursOuvres(dateDebut, dateFin);

    for (const employe of employes) {
      const pointagesEmploye = pointages.filter(p => p.employeId === employe.id);
      
      // Vérifier qu'il y a des pointages pour cet employé
      if (pointagesEmploye.length === 0) {
        avertissements.push(`Aucun pointage trouvé pour ${employe.prenom} ${employe.nom}`);
        continue;
      }

      // Vérifier la cohérence selon le type de contrat
      switch (employe.typeContrat) {
        case 'FIXE':
          if (!employe.salaireBase || employe.salaireBase <= 0) {
            erreurs.push(`Salaire de base manquant pour ${employe.prenom} ${employe.nom} (employé fixe)`);
          }
          break;

        case 'JOURNALIER':
          if (!employe.tauxJournalier || employe.tauxJournalier <= 0) {
            erreurs.push(`Taux journalier manquant pour ${employe.prenom} ${employe.nom} (employé journalier)`);
          }
          break;

        case 'HORAIRE':
          if (!(employe as any).tauxHoraire && (!employe.salaireBase || employe.salaireBase <= 0)) {
            erreurs.push(`Taux horaire ou salaire de base manquant pour ${employe.prenom} ${employe.nom} (employé horaire)`);
          }
          break;
      }

      // Vérifier les pointages incohérents
      const pointagesIncohents = pointagesEmploye.filter(p => 
        p.heureArrivee && p.heureDepart && 
        new Date(p.heureDepart) < new Date(p.heureArrivee)
      );

      if (pointagesIncohents.length > 0) {
        erreurs.push(`Pointages incohérents (départ avant arrivée) pour ${employe.prenom} ${employe.nom}`);
      }

      // Avertir si trop d'absences
      const joursAbsents = pointagesEmploye.filter(p => p.statut === 'ABSENT').length;
      if (joursAbsents > joursOuvres * 0.5) {
        avertissements.push(`${employe.prenom} ${employe.nom} a plus de 50% d'absences`);
      }
    }

    return {
      valide: erreurs.length === 0,
      erreurs,
      avertissements
    };
  }
}