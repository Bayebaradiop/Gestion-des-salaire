import { PrismaClient } from '@prisma/client';
import { EmployeRepository } from '../repositories/employe.repository';
import { BaseRepository } from '../repositories/base.repository';

const prisma = new PrismaClient();

export interface DetailCalculJournalier {
  type: 'JOURNALIER';
  tauxJournalier: number;
  joursTravailes: number;
  joursAbsents: number;
  totalJours: number;
  montantBrut: number;
}

export interface DetailCalculHonoraire {
  type: 'HONORAIRE';
  tauxHoraire: number;
  heuresTravailes: number;
  montantBrut: number;
}

export interface DetailCalculFixe {
  type: 'FIXE';
  salaireFixe: number;
  joursOuvrables: number;
  joursAbsents: number;
  deductionAbsences: number;
  montantNet: number;
}

export type DetailCalcul = DetailCalculJournalier | DetailCalculHonoraire | DetailCalculFixe;

export interface ValidationInfo {
  estValide: boolean;
  pointagesNonValides: number;
  totalPointages: number;
  adminValidateur?: string;
}

/**
 * Service pour calculer les paiements automatisés basés sur les pointages validés
 * Respecte la séparation des rôles : ADMIN valide les pointages, CAISSIER effectue les paiements
 */
export class PaiementAutomatiseService extends BaseRepository {
  private employeRepository: EmployeRepository;

  constructor() {
    super();
    this.employeRepository = new EmployeRepository();
  }

  /**
   * Vérifier si les pointages d'une période sont validés par un admin
   */
  async verifierValidationPointages(employeId: number, periode: string): Promise<ValidationInfo> {
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        }
      },
      include: {
        validePar: {
          select: {
            prenom: true,
            nom: true,
            role: true
          }
        }
      }
    });

    const totalPointages = pointages.length;
    const pointagesValides = pointages.filter(p => p.estValide);
    const pointagesNonValides = totalPointages - pointagesValides.length;

    // Récupérer le nom de l'admin validateur (le premier trouvé)
    const adminValidateur = pointagesValides.length > 0 && pointagesValides[0].validePar 
      ? `${pointagesValides[0].validePar.prenom} ${pointagesValides[0].validePar.nom}`
      : undefined;

    return {
      estValide: pointagesNonValides === 0 && totalPointages > 0,
      pointagesNonValides,
      totalPointages,
      adminValidateur
    };
  }

  /**
   * Calculer le paiement pour un employé sur une période donnée
   * RESTRICTION : Nécessite que tous les pointages soient validés par un admin
   */
  async calculerPaiement(employeId: number, periode: string, caissierInfo?: { id: number, nom: string }): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalcul;
    validationInfo: ValidationInfo;
  }> {
    // 1. Vérifier d'abord la validation des pointages
    const validationInfo = await this.verifierValidationPointages(employeId, periode);
    
    if (!validationInfo.estValide) {
      throw new Error(
        `❌ PAIEMENT BLOQUÉ : ${validationInfo.pointagesNonValides} pointage(s) non validé(s) par un ADMIN sur ${validationInfo.totalPointages} pointage(s) de la période ${periode}. Tous les pointages doivent être validés avant le calcul du paiement.`
      );
    }

    // 2. Récupérer l'employé
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // 3. Récupérer les pointages validés de la période
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        },
        estValide: true // Seuls les pointages validés par un admin
      },
      orderBy: { date: 'asc' }
    });

    // 4. Calculer selon le type de contrat
    let calculResult;
    switch (employe.typeContrat) {
      case 'JOURNALIER':
        calculResult = await this.calculerPaiementJournalier(employe, pointages, periode);
        break;
      
      case 'HONORAIRE':
        calculResult = await this.calculerPaiementHonoraire(employe, pointages, periode);
        break;
      
      case 'FIXE':
        calculResult = await this.calculerPaiementFixe(employe, pointages, periode);
        break;
      
      default:
        throw new Error(`Type de contrat non supporté: ${employe.typeContrat}`);
    }

    return {
      montantDu: calculResult.montantDu,
      detailsCalcul: calculResult.detailsCalcul,
      validationInfo
    };
  }

  /**
   * Calculer le paiement pour un employé journalier
   * LOGIQUE : tauxJournalier × joursPresents
   */
  private async calculerPaiementJournalier(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculJournalier;
  }> {
    if (!employe.tauxJournalier) {
      throw new Error('Taux journalier non défini pour cet employé');
    }

    // Compter les jours travaillés (présents ou en retard)
    const joursTravailes = pointages.filter(p => 
      p.statut === 'PRESENT' || p.statut === 'RETARD'
    ).length;

    // Compter les jours d'absence
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;

    const montantBrut = employe.tauxJournalier * joursTravailes;

    const detailsCalcul: DetailCalculJournalier = {
      type: 'JOURNALIER',
      tauxJournalier: employe.tauxJournalier,
      joursTravailes,
      joursAbsents,
      totalJours: pointages.length,
      montantBrut
    };

    return {
      montantDu: montantBrut,
      detailsCalcul
    };
  }

  /**
   * Calculer le paiement pour un employé honoraire (basé sur les heures)
   * LOGIQUE : tauxHoraire × heuresTravaillées (basées sur heures d'arrivée/départ pointées)
   */
  private async calculerPaiementHonoraire(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculHonoraire;
  }> {
    if (!employe.salaireBase) {
      throw new Error('Taux horaire (salaireBase) non défini pour cet employé honoraire');
    }

    // Calculer les heures travaillées basées sur les pointages
    let heuresTravailes = 0;

    for (const pointage of pointages) {
      if (pointage.statut === 'PRESENT' || pointage.statut === 'RETARD') {
        if (pointage.heureArrivee && pointage.heureDepart) {
          const heureArrivee = new Date(pointage.heureArrivee);
          const heureDepart = new Date(pointage.heureDepart);
          const dureeMs = heureDepart.getTime() - heureArrivee.getTime();
          const dureeHeures = dureeMs / (1000 * 60 * 60); // Convertir en heures
          heuresTravailes += Math.max(0, dureeHeures); // Éviter les valeurs négatives
        } else {
          // Si pas d'heure de départ, compter 8h par défaut pour les présents
          heuresTravailes += 8;
        }
      }
    }

    // Le salaireBase pour les honoraires est considéré comme un taux horaire
    const tauxHoraire = employe.salaireBase;
    const montantBrut = tauxHoraire * heuresTravailes;

    const detailsCalcul: DetailCalculHonoraire = {
      type: 'HONORAIRE',
      tauxHoraire,
      heuresTravailes: Math.round(heuresTravailes * 100) / 100, // Arrondir à 2 décimales
      montantBrut
    };

    return {
      montantDu: montantBrut,
      detailsCalcul
    };
  }

  /**
   * Calculer le paiement pour un employé fixe (avec déduction des absences)
   * LOGIQUE : salaireFixe - (salaireFixe / joursOuvrables × joursAbsents)
   */
  private async calculerPaiementFixe(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculFixe;
  }> {
    if (!employe.salaireBase) {
      throw new Error('Salaire de base non défini pour cet employé');
    }

    // Calculer le nombre de jours ouvrables dans le mois
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const joursOuvrables = this.calculerJoursOuvrables(annee, mois);

    // Compter les jours d'absence
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;

    // Calculer la déduction pour les absences
    const salaireJournalier = employe.salaireBase / joursOuvrables;
    const deductionAbsences = salaireJournalier * joursAbsents;
    const montantNet = employe.salaireBase - deductionAbsences;

    const detailsCalcul: DetailCalculFixe = {
      type: 'FIXE',
      salaireFixe: employe.salaireBase,
      joursOuvrables,
      joursAbsents,
      deductionAbsences: Math.round(deductionAbsences),
      montantNet: Math.round(montantNet)
    };

    return {
      montantDu: montantNet,
      detailsCalcul
    };
  }

  /**
   * Calculer le nombre de jours ouvrables dans un mois (exclut weekends)
   */
  private calculerJoursOuvrables(annee: number, mois: number): number {
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);
    
    let joursOuvrables = 0;
    const currentDate = new Date(dateDebut);

    while (currentDate <= dateFin) {
      const jourSemaine = currentDate.getDay();
      // 0 = Dimanche, 6 = Samedi
      if (jourSemaine !== 0 && jourSemaine !== 6) {
        joursOuvrables++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return joursOuvrables;
  }

  /**
   * Enregistrer un paiement automatisé
   * RESTRICTION : Seuls les CAISSIER peuvent enregistrer un paiement
   */
  async enregistrerPaiement(
    employeId: number, 
    periode: string, 
    caissierInfo: { id: number, nom: string }
  ): Promise<any> {
    // Vérifier si un paiement existe déjà pour cette période
    const paiementExistant = await prisma.paiementAutomatise.findUnique({
      where: {
        employeId_periode: {
          employeId,
          periode
        }
      }
    });

    if (paiementExistant) {
      throw new Error(`Un paiement existe déjà pour l'employé ${employeId} pour la période ${periode}`);
    }

    // Calculer le montant avec vérification des pointages validés
    const { montantDu, detailsCalcul, validationInfo } = await this.calculerPaiement(employeId, periode, caissierInfo);

    // Récupérer l'employé pour l'entrepriseId
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // Créer le paiement automatisé avec traçabilité
    const paiement = await prisma.paiementAutomatise.create({
      data: {
        employeId,
        entrepriseId: employe.entrepriseId,
        periode,
        montantDu,
        typeContrat: employe.typeContrat as any,
        detailsCalcul: detailsCalcul as any,
        statut: 'CALCULE',
        calculeParId: caissierInfo.id
      },
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            poste: true,
            typeContrat: true
          }
        },
        calculePar: {
          select: {
            prenom: true,
            nom: true,
            role: true
          }
        }
      }
    });

    return {
      ...paiement,
      validationInfo
    };
  }

  /**
   * Récupérer les paiements d'une entreprise pour une période
   */
  async obtenirPaiementsEntreprise(entrepriseId: number, periode?: string) {
    const where: any = { entrepriseId };
    if (periode) {
      where.periode = periode;
    }

    return await prisma.paiementAutomatise.findMany({
      where,
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            poste: true,
            typeContrat: true
          }
        },
        calculePar: {
          select: {
            prenom: true,
            nom: true,
            role: true
          }
        },
        payePar: {
          select: {
            prenom: true,
            nom: true,
            role: true
          }
        }
      },
      orderBy: [
        { periode: 'desc' },
        { employe: { nom: 'asc' } }
      ]
    });
  }

  /**
   * Marquer un paiement comme payé
   * RESTRICTION : Seuls les CAISSIER peuvent marquer comme payé
   */
  async marquerCommePaye(
    paiementId: number, 
    montantPaye: number, 
    methodePaiement: string,
    caissierInfo: { id: number, nom: string },
    notes?: string
  ) {
    const paiement = await prisma.paiementAutomatise.findUnique({
      where: { id: paiementId }
    });

    if (!paiement) {
      throw new Error('Paiement non trouvé');
    }

    let nouveauStatut: 'PARTIEL' | 'PAYE';
    if (montantPaye >= paiement.montantDu) {
      nouveauStatut = 'PAYE';
    } else {
      nouveauStatut = 'PARTIEL';
    }

    return await prisma.paiementAutomatise.update({
      where: { id: paiementId },
      data: {
        montantPaye: paiement.montantPaye + montantPaye,
        statut: nouveauStatut,
        methodePaiement: methodePaiement as any,
        datePaiement: nouveauStatut === 'PAYE' ? new Date() : paiement.datePaiement,
        payeParId: caissierInfo.id,
        notes
      }
    });
  }

  /**
   * Valider les pointages d'une période par un admin
   * RESTRICTION : Seuls les ADMIN peuvent valider les pointages
   */
  async validerPointagesPeriode(
    employeId: number,
    periode: string,
    adminInfo: { id: number, nom: string }
  ): Promise<{
    pointagesValides: number;
    message: string;
  }> {
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    // Récupérer tous les pointages non validés de la période
    const pointagesNonValides = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        },
        estValide: false
      }
    });

    if (pointagesNonValides.length === 0) {
      return {
        pointagesValides: 0,
        message: 'Tous les pointages de cette période sont déjà validés'
      };
    }

    // Valider tous les pointages de la période
    await prisma.pointage.updateMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        },
        estValide: false
      },
      data: {
        estValide: true,
        valideParId: adminInfo.id,
        dateValidation: new Date()
      }
    });

    return {
      pointagesValides: pointagesNonValides.length,
      message: `${pointagesNonValides.length} pointage(s) validé(s) par ${adminInfo.nom} pour la période ${periode}`
    };
  }
}