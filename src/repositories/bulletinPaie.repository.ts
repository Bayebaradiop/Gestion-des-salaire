import { BaseRepository } from './base.repository.js';
import type { BulletinPaie, StatutBulletinPaie } from '@prisma/client';

export interface CreerBulletinPaieData {
  numeroBulletin: string;
  joursTravailes?: number | null;
  salaireBrut: number;
  deductions: number;
  salaireNet: number;
  employeId: number;
  cyclePaieId: number;
}

export interface ModifierBulletinPaieData {
  joursTravailes?: number | null;
  salaireBrut?: number;
  deductions?: number;
  salaireNet?: number;
  statut?: StatutBulletinPaie;
}

export class BulletinPaieRepository extends BaseRepository {
  async listerParCycle(cyclePaieId: number): Promise<BulletinPaie[]> {
    return await this.prisma.bulletinPaie.findMany({
      where: { cyclePaieId },
      include: {
        employe: true,
        paiements: true
      },
      orderBy: { creeLe: 'desc' }
    });
  }

  async listerParEmploye(employeId: number, filtres?: { statut?: string[] }): Promise<BulletinPaie[]> {
    const where: any = { employeId };
    
    if (filtres?.statut && filtres.statut.length > 0) {
      where.statut = { in: filtres.statut };
    }

    return await this.prisma.bulletinPaie.findMany({
      where,
      include: {
        employe: true,
        cyclePaie: {
          include: {
            entreprise: true
          }
        },
        paiements: true
      },
      orderBy: { creeLe: 'desc' }
    });
  }

  async trouverParId(id: number): Promise<BulletinPaie | null> {
    return await this.prisma.bulletinPaie.findUnique({
      where: { id },
      include: {
        employe: true,
        cyclePaie: {
          include: {
            entreprise: true
          }
        },
        paiements: true
      }
    });
  }

  async creer(donnees: CreerBulletinPaieData): Promise<BulletinPaie> {
    return await this.prisma.bulletinPaie.create({
      data: {
        numeroBulletin: donnees.numeroBulletin,
        joursTravailes: donnees.joursTravailes ?? null,
        salaireBrut: donnees.salaireBrut,
        deductions: donnees.deductions,
        salaireNet: donnees.salaireNet,
        employeId: donnees.employeId,
        cyclePaieId: donnees.cyclePaieId
      }
    });
  }

  async modifier(id: number, donnees: ModifierBulletinPaieData): Promise<BulletinPaie> {
    return await this.prisma.bulletinPaie.update({
      where: { id },
      data: donnees
    });
  }

  async supprimer(id: number): Promise<void> {
    await this.prisma.bulletinPaie.delete({
      where: { id }
    });
  }

  async mettreAJourMontantPaye(id: number): Promise<void> {
    const paiements = await this.prisma.paiement.findMany({
      where: { bulletinPaieId: id },
      select: { montant: true }
    });

    const montantPaye = paiements.reduce((sum, p) => sum + p.montant, 0);

    // Récupérer le salaire net pour calculer le statut
    const bulletin = await this.prisma.bulletinPaie.findUnique({
      where: { id },
      select: { salaireNet: true }
    });

    const salaireNet = bulletin?.salaireNet ?? 0;
    let statut: 'EN_ATTENTE' | 'PARTIEL' | 'PAYE' = 'EN_ATTENTE';
    if (montantPaye <= 0) {
      statut = 'EN_ATTENTE';
    } else if (montantPaye < salaireNet) {
      statut = 'PARTIEL';
    } else {
      statut = 'PAYE';
    }

    await this.prisma.bulletinPaie.update({
      where: { id },
      data: { montantPaye, statut }
    });
  }

  async compterParCycle(cyclePaieId: number): Promise<number> {
    return await this.prisma.bulletinPaie.count({
      where: { cyclePaieId }
    });
  }

  async trouverAvecDetails(id: number): Promise<BulletinPaie | null> {
    return await this.prisma.bulletinPaie.findUnique({
      where: { id },
      include: {
        employe: {
          include: {
            entreprise: true
          }
        },
        cyclePaie: {
          include: {
            entreprise: true
          }
        },
        paiements: {
          include: {
            traitePar: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async trouverParCycleEtEmploye(cyclePaieId: number, employeId: number): Promise<BulletinPaie | null> {
    return await this.prisma.bulletinPaie.findUnique({
      where: {
        cyclePaieId_employeId: {
          cyclePaieId,
          employeId
        }
      },
      include: {
        employe: true,
        cyclePaie: true,
        paiements: true
      }
    });
  }

  async mettreAJour(id: number, donnees: ModifierBulletinPaieData): Promise<BulletinPaie> {
    return this.modifier(id, donnees);
  }

  async obtenirParId(id: number) {
    return await this.prisma.bulletinPaie.findUnique({
      where: { id },
      include: {
        employe: true,
        cyclePaie: true,
        paiements: true
      }
    });
  }

  async obtenirCyclePaie(cyclePaieId: number) {
    return await this.prisma.cyclePaie.findUnique({
      where: { id: cyclePaieId },
      include: {
        entreprise: true
      }
    });
  }

  async listerParCycleEtTypeContrat(cyclePaieId: number, typeContrat: string) {
    return await this.prisma.bulletinPaie.findMany({
      where: {
        cyclePaieId,
        employe: {
          typeContrat: typeContrat as any
        }
      },
      include: {
        employe: true,
        cyclePaie: true
      }
    });
  }

  async mettreAJourAbsences(
    id: number, 
    donnees: {
      nombreAbsences: number;
      joursAbsences: string;
      montantDeduction: number;
      salaireNet: number;
    }
  ) {
    return await this.prisma.bulletinPaie.update({
      where: { id },
      data: {
        nombreAbsences: donnees.nombreAbsences,
        joursAbsences: donnees.joursAbsences,
        montantDeduction: donnees.montantDeduction,
        salaireNet: donnees.salaireNet,
        misAJourLe: new Date()
      } as any,
      include: {
        employe: true,
        cyclePaie: true
      }
    });
  }

  async mettreAJourJournalier(
    id: number, 
    donnees: {
      joursTravailes: number;
      tauxJournalier: number;
      salaireBrut: number;
      salaireNet: number;
      joursAbsences: string;
    }
  ) {
    console.log('💾 Mise à jour du bulletin journalier en base:', { id, donnees });
    
    const bulletin = await this.prisma.bulletinPaie.update({
      where: { id },
      data: {
        joursTravailes: Math.max(0, donnees.joursTravailes), // S'assurer que c'est >= 0
        tauxJournalier: Math.max(0, donnees.tauxJournalier), // Stocker le taux utilisé
        salaireBrut: Math.max(0, donnees.salaireBrut), // S'assurer que c'est >= 0
        salaireNet: Math.max(0, donnees.salaireNet), // S'assurer que c'est >= 0
        deductions: 0, // Pas de déductions pour les journaliers par défaut
        joursAbsences: donnees.joursAbsences,
        misAJourLe: new Date()
      } as any,
      include: {
        employe: true,
        cyclePaie: true
      }
    });

    console.log('✅ Bulletin journalier mis à jour:', {
      id: bulletin.id,
      joursTravailes: bulletin.joursTravailes,
      salaireBrut: bulletin.salaireBrut,
      salaireNet: bulletin.salaireNet
    });

    return bulletin;
  }

  async mettreAJourHonoraire(
    id: number, 
    donnees: {
      salaireBrut: number;
      salaireNet: number;
      totalHeuresTravaillees: number;
      tauxHoraire: number;
    }
  ) {
    console.log('💾 Mise à jour du bulletin honoraire en base:', { id, donnees });
    
    const bulletin = await this.prisma.bulletinPaie.update({
      where: { id },
      data: {
        salaireBrut: Math.max(0, donnees.salaireBrut), // S'assurer que c'est >= 0
        salaireNet: Math.max(0, donnees.salaireNet), // S'assurer que c'est >= 0
        totalHeuresTravaillees: Math.max(0, donnees.totalHeuresTravaillees),
        tauxHoraire: Math.max(0, donnees.tauxHoraire),
        deductions: 0, // Pas de déductions pour les honoraires par défaut
        joursTravailes: null, // Pas de jours travaillés pour les honoraires
        misAJourLe: new Date()
      } as any,
      include: {
        employe: true,
        cyclePaie: true
      }
    });

    console.log('✅ Bulletin honoraire mis à jour:', {
      id: bulletin.id,
      salaireBrut: bulletin.salaireBrut,
      salaireNet: bulletin.salaireNet
    });

    return bulletin;
  }
}