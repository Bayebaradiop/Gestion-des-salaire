import { PrismaClient } from '@prisma/client';
import { EmployeRepository } from '../repositories/employe.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { CyclePaieRepository } from '../repositories/cyclePaie.repository.js';
import { PaiementRepository } from '../repositories/paiement.repository.js';

const prisma = new PrismaClient();

export interface CalculPaiementJournalier {
  employeId: number;
  nom: string;
  prenom: string;
  codeEmploye: string;
  typeContrat: string;
  tauxJournalier: number;
  
  // Calculs basés sur pointages
  joursPointes: number;
  heuresPointes: number;
  heuresSupplementaires: number;
  
  // Calculs financiers
  salaireBrutJours: number;
  salaireBrutHeuresSup: number;
  salaireBrutTotal: number;
  deductions: number;
  salaireNet: number;
  
  // Historique paiements
  totalDejaPaye: number;
  resteAPayer: number;
  
  // Métadonnées
  periodeDebut: Date;
  periodeFin: Date;
  bulletinId?: number;
}

export class PaiementJournalierService {
  private employeRepository: EmployeRepository;
  private bulletinPaieRepository: BulletinPaieRepository;
  private cyclePaieRepository: CyclePaieRepository;
  private paiementRepository: PaiementRepository;

  constructor() {
    this.employeRepository = new EmployeRepository();
    this.bulletinPaieRepository = new BulletinPaieRepository();
    this.cyclePaieRepository = new CyclePaieRepository();
    this.paiementRepository = new PaiementRepository();
  }

  /**
   * Calcule le paiement dû pour un employé journalier basé sur ses pointages
   */
  async calculerPaiementJournalier(
    employeId: number, 
    mois: number, 
    annee: number
  ): Promise<CalculPaiementJournalier> {
    
    // 1. Récupérer l'employé
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    if (employe.typeContrat !== 'JOURNALIER') {
      throw new Error('Cet employé n\'est pas un journalier');
    }

    if (!employe.tauxJournalier) {
      throw new Error('Taux journalier non défini pour cet employé');
    }

    // 2. Définir la période
    const periodeDebut = new Date(annee, mois - 1, 1);
    const periodeFin = new Date(annee, mois, 0, 23, 59, 59);

    // 3. Récupérer les pointages validés de la période
    const pointages = await prisma.pointage.findMany({
      where: {
        employeId: employeId,
        date: {
          gte: periodeDebut,
          lte: periodeFin
        },
        estValide: true // Uniquement les pointages validés
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 4. Calculer les totaux
    let joursPointes = 0;
    let heuresPointes = 0;
    let heuresSupplementaires = 0;

    pointages.forEach(pointage => {
      if (pointage.heureArrivee && pointage.heureDepart) {
        joursPointes++;
        
        // Calculer les heures travaillées dans la journée
        const heuresTravaillees = pointage.dureeMinutes ? pointage.dureeMinutes / 60 : 0;
        
        heuresPointes += heuresTravaillees;
        
        // Considérer les heures sup après 8h/jour
        if (heuresTravaillees > 8) {
          heuresSupplementaires += (heuresTravaillees - 8);
        }
      }
    });

    // 5. Calculs financiers
    const tauxHoraire = employe.tauxJournalier / 8; // Supposons 8h par jour
    const tauxHeureSup = tauxHoraire * 1.5; // Majoration 50%

    const salaireBrutJours = joursPointes * employe.tauxJournalier;
    const salaireBrutHeuresSup = heuresSupplementaires * tauxHeureSup;
    const salaireBrutTotal = salaireBrutJours + salaireBrutHeuresSup;

    // Déductions (CSS, etc.) - Calcul simple : 5% du brut
    const deductions = salaireBrutTotal * 0.05;
    const salaireNet = salaireBrutTotal - deductions;

    // 6. Vérifier les paiements déjà effectués
    const bulletin = await this.obtenirOuCreerBulletinJournalier(employeId, mois, annee);
    const paiementsExistants = await this.paiementRepository.listerParBulletin(bulletin.id);
    const totalDejaPaye = paiementsExistants.reduce((total, p) => total + p.montant, 0);
    const resteAPayer = Math.max(0, salaireNet - totalDejaPaye);

    return {
      employeId: employe.id,
      nom: employe.nom,
      prenom: employe.prenom,
      codeEmploye: employe.codeEmploye,
      typeContrat: employe.typeContrat,
      tauxJournalier: employe.tauxJournalier,
      
      joursPointes,
      heuresPointes: Math.round(heuresPointes * 100) / 100,
      heuresSupplementaires: Math.round(heuresSupplementaires * 100) / 100,
      
      salaireBrutJours: Math.round(salaireBrutJours),
      salaireBrutHeuresSup: Math.round(salaireBrutHeuresSup),
      salaireBrutTotal: Math.round(salaireBrutTotal),
      deductions: Math.round(deductions),
      salaireNet: Math.round(salaireNet),
      
      totalDejaPaye: Math.round(totalDejaPaye),
      resteAPayer: Math.round(resteAPayer),
      
      periodeDebut,
      periodeFin,
      bulletinId: bulletin.id
    };
  }

  /**
   * Obtient ou crée un bulletin pour un employé journalier
   */
  private async obtenirOuCreerBulletinJournalier(employeId: number, mois: number, annee: number) {
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // Chercher le cycle de paie du mois
    const periodeStr = `${annee}-${mois.toString().padStart(2, '0')}`;
    let cycle = await prisma.cyclePaie.findFirst({
      where: {
        entrepriseId: employe.entrepriseId,
        periode: periodeStr
      }
    });

    // Si pas de cycle, le créer
    if (!cycle) {
      const dateDebut = new Date(annee, mois - 1, 1);
      const dateFin = new Date(annee, mois, 0);

      cycle = await prisma.cyclePaie.create({
        data: {
          titre: `Cycle ${mois}/${annee}`,
          periode: periodeStr,
          dateDebut: dateDebut,
          dateFin: dateFin,
          statut: 'BROUILLON',
          entrepriseId: employe.entrepriseId
        }
      });
    }

    // Chercher ou créer le bulletin pour cet employé
    let bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        employeId: employeId,
        cyclePaieId: cycle.id
      }
    });

    if (!bulletin) {
      const numeroBulletin = `BUL-${employe.codeEmploye}-${periodeStr}`;
      bulletin = await prisma.bulletinPaie.create({
        data: {
          employeId: employeId,
          cyclePaieId: cycle.id,
          numeroBulletin: numeroBulletin,
          
          // Pour les journaliers, les valeurs seront calculées dynamiquement
          salaireBrut: 0,
          deductions: 0,
          salaireNet: 0,
          joursTravailes: 0,
          montantPaye: 0
        }
      });
    }

    return bulletin;
  }

  /**
   * Enregistre un paiement manuel pour un employé journalier  
   */
  async enregistrerPaiementJournalier(
    employeId: number,
    mois: number,
    annee: number,
    montantPaye: number,
    methodePaiement: 'ESPECES' | 'VIREMENT_BANCAIRE' | 'ORANGE_MONEY' | 'WAVE' | 'AUTRE',
    traiteParId: number,
    reference?: string,
    notes?: string
  ) {
    // 1. Vérifier le calcul actuel
    const calcul = await this.calculerPaiementJournalier(employeId, mois, annee);
    
    // 2. Validations
    if (montantPaye <= 0) {
      throw new Error('Le montant du paiement doit être supérieur à 0');
    }

    if (montantPaye > calcul.resteAPayer) {
      throw new Error(`Le montant ne peut pas dépasser le reste à payer (${calcul.resteAPayer} XOF)`);
    }

    if (calcul.joursPointes === 0) {
      throw new Error('Impossible d\'enregistrer un paiement pour un employé sans pointages validés');
    }

    // 3. Générer le numéro de reçu
    const numeroRecu = await this.paiementRepository.genererNumeroRecu();

    // 4. Créer le paiement
    const paiement = await prisma.paiement.create({
      data: {
        bulletinPaieId: calcul.bulletinId!,
        montant: montantPaye,
        methodePaiement: methodePaiement,
        numeroRecu: numeroRecu,
        reference: reference,
        notes: `Paiement Journalier (manuel) - ${calcul.joursPointes} jours pointés${notes ? ` - ${notes}` : ''}`,
        traiteParId: traiteParId
      }
    });

    // 5. Mettre à jour le bulletin avec les informations calculées
    await prisma.bulletinPaie.update({
      where: { id: calcul.bulletinId! },
      data: {
        joursTravailes: calcul.joursPointes,
        salaireBrut: calcul.salaireBrutTotal,
        deductions: calcul.deductions,
        salaireNet: calcul.salaireNet,
        montantPaye: calcul.totalDejaPaye + montantPaye
      }
    });

    return {
      paiement,
      calcul: await this.calculerPaiementJournalier(employeId, mois, annee) // Recalculer après paiement
    };
  }

  /**
   * Liste tous les employés journaliers d'une entreprise avec leur statut de paiement
   */
  async listerEmployesJournaliers(entrepriseId: number, mois: number, annee: number) {
    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId: entrepriseId,
        typeContrat: 'JOURNALIER',
        estActif: true
      },
      orderBy: [
        { nom: 'asc' },
        { prenom: 'asc' }
      ]
    });

    const resultats = [];

    for (const employe of employes) {
      try {
        const calcul = await this.calculerPaiementJournalier(employe.id, mois, annee);
        resultats.push({
          ...calcul,
          hasPointages: calcul.joursPointes > 0,
          needsPayment: calcul.resteAPayer > 0
        });
      } catch (error) {
        // Si l'employé n'a pas de pointages ou taux non défini
        resultats.push({
          employeId: employe.id,
          nom: employe.nom,
          prenom: employe.prenom,
          codeEmploye: employe.codeEmploye,
          typeContrat: employe.typeContrat,
          tauxJournalier: employe.tauxJournalier || 0,
          joursPointes: 0,
          resteAPayer: 0,
          hasPointages: false,
          needsPayment: false,
          error: error instanceof Error ? error.message : 'Erreur de calcul'
        });
      }
    }

    return resultats;
  }

  /**
   * Obtient l'historique des paiements journaliers avec détails
   */
  async obtenirHistoriquePaiementsJournaliers(
    entrepriseId: number,
    filtres: {
      employeId?: number;
      mois?: number;
      annee?: number;
      dateDebut?: Date;
      dateFin?: Date;
    } = {}
  ) {
    const whereClause: any = {
      bulletinPaie: {
        employe: {
          entrepriseId: entrepriseId,
          typeContrat: 'JOURNALIER'
        }
      }
    };

    if (filtres.employeId) {
      whereClause.bulletinPaie.employeId = filtres.employeId;
    }

    if (filtres.mois && filtres.annee) {
      const periodeStr = `${filtres.annee}-${filtres.mois.toString().padStart(2, '0')}`;
      whereClause.bulletinPaie.cyclePaie = {
        periode: periodeStr
      };
    }

    if (filtres.dateDebut || filtres.dateFin) {
      whereClause.datePaiement = {};
      if (filtres.dateDebut) {
        whereClause.datePaiement.gte = filtres.dateDebut;
      }
      if (filtres.dateFin) {
        whereClause.datePaiement.lte = filtres.dateFin;
      }
    }

    const paiements = await prisma.paiement.findMany({
      where: whereClause,
      include: {
        bulletinPaie: {
          include: {
            employe: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                codeEmploye: true,
                typeContrat: true,
                tauxJournalier: true
              }
            },
            cyclePaie: {
              select: {
                id: true,
                titre: true,
                periode: true,
                dateDebut: true,
                dateFin: true
              }
            }
          }
        }
      },
      orderBy: {
        creeLe: 'desc'
      }
    });

    return paiements.map(paiement => ({
      ...paiement,
      typePaiement: 'JOURNALIER_MANUEL',
      employe: (paiement as any).bulletinPaie.employe,
      cycle: (paiement as any).bulletinPaie.cyclePaie
    }));
  }
}
