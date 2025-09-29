import { BaseRepository } from '../repositories/base.repository.js';

interface KPIs {
  nombreEmployes: number;
  nombreEmployesActifs: number;
  masseSalarialeMensuelle: number;
  montantPaye: number;
  montantRestant: number;
}

interface EvolutionMasseSalariale {
  mois: string;
  montant: number;
}

interface ProchainPaiement {
  id: number;
  employeNom: string;
  montantRestant: number;
  dateEcheance?: Date;
}

export class DashboardService extends BaseRepository {
  async obtenirKPIs(entrepriseId: number): Promise<KPIs> {
    const nombreEmployes = await this.prisma.employe.count({
      where: { entrepriseId }
    });

    const nombreEmployesActifs = await this.prisma.employe.count({
      where: { entrepriseId, estActif: true }
    });

    // Masse salariale mensuelle (somme des salaires nets des bulletins actifs)
    const bulletinsActifs = await this.prisma.bulletinPaie.findMany({
      where: {
        cyclePaie: {
          entrepriseId,
          statut: { in: ['BROUILLON', 'APPROUVE'] }
        }
      },
      select: { salaireNet: true }
    });

    const masseSalarialeMensuelle = bulletinsActifs.reduce((sum, b) => sum + b.salaireNet, 0);

    // Montant payé total
    const montantPaye = await this.prisma.bulletinPaie.aggregate({
      where: {
        cyclePaie: { entrepriseId }
      },
      _sum: { montantPaye: true }
    });

    // Montant restant total
    const montantRestant = await this.prisma.bulletinPaie.aggregate({
      where: {
        cyclePaie: { entrepriseId }
      },
      _sum: {
        salaireNet: true,
        montantPaye: true
      }
    });

    const restant = (montantRestant._sum.salaireNet || 0) - (montantRestant._sum.montantPaye || 0);

    return {
      nombreEmployes,
      nombreEmployesActifs,
      masseSalarialeMensuelle,
      montantPaye: montantPaye._sum.montantPaye || 0,
      montantRestant: restant
    };
  }

  async obtenirEvolutionMasseSalariale(entrepriseId: number): Promise<EvolutionMasseSalariale[]> {
    // Récupérer les 6 derniers mois
    const maintenant = new Date();
    const resultats: EvolutionMasseSalariale[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const debutMois = new Date(date.getFullYear(), date.getMonth(), 1);
      const finMois = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const montant = await this.prisma.bulletinPaie.aggregate({
        where: {
          cyclePaie: { entrepriseId },
          creeLe: {
            gte: debutMois,
            lte: finMois
          }
        },
        _sum: { salaireNet: true }
      });

      resultats.push({
        mois: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }),
        montant: montant._sum.salaireNet || 0
      });
    }

    return resultats;
  }

  async obtenirProchainsPaiements(entrepriseId: number, limit = 10): Promise<ProchainPaiement[]> {
    const bulletins = await this.prisma.bulletinPaie.findMany({
      where: {
        cyclePaie: { entrepriseId },
        salaireNet: {
          gt: this.prisma.bulletinPaie.fields.montantPaye
        }
      },
      include: {
        employe: {
          select: { prenom: true, nom: true }
        },
        cyclePaie: {
          select: { dateFin: true }
        }
      },
      orderBy: [
        { cyclePaie: { dateFin: 'asc' } },
        { creeLe: 'asc' }
      ],
      take: limit
    });

    return bulletins.map(b => ({
      id: b.id,
      employeNom: `${b.employe.prenom} ${b.employe.nom}`,
      montantRestant: b.salaireNet - b.montantPaye,
      dateEcheance: b.cyclePaie.dateFin
    }));
  }

  async compterCyclesEnCours(entrepriseId: number): Promise<number> {
    return await this.prisma.cyclePaie.count({
      where: {
        entrepriseId,
        statut: { in: ['BROUILLON', 'APPROUVE'] }
      }
    });
  }

  async compterBulletinsEnAttente(entrepriseId: number): Promise<number> {
    return await this.prisma.bulletinPaie.count({
      where: {
        cyclePaie: { entrepriseId },
        salaireNet: {
          gt: this.prisma.bulletinPaie.fields.montantPaye
        }
      }
    });
  }

  async verifierDonnees(entrepriseId: number): Promise<boolean> {
    const [employesCount, cyclesCount, bulletinsCount] = await Promise.all([
      this.prisma.employe.count({ where: { entrepriseId } }),
      this.prisma.cyclePaie.count({ where: { entrepriseId } }),
      this.prisma.bulletinPaie.count({
        where: { cyclePaie: { entrepriseId } }
      })
    ]);

    // Considérer qu'il y a des données s'il y a au moins des employés ET des cycles
    return employesCount > 0 && cyclesCount > 0;
  }

  async initialiserDonnees(entrepriseId: number): Promise<void> {
    // Vérifier si l'entreprise existe
    const entreprise = await this.prisma.entreprise.findUnique({
      where: { id: entrepriseId }
    });

    if (!entreprise) {
      throw new Error(`Entreprise avec l'ID ${entrepriseId} non trouvée`);
    }

    // Créer des employés exemples s'il n'y en a pas
    const employesCount = await this.prisma.employe.count({
      where: { entrepriseId }
    });

    if (employesCount === 0) {
      await this.prisma.employe.createMany({
        data: [
          {
            codeEmploye: 'EMP001',
            prenom: 'Amadou',
            nom: 'Diallo',
            email: 'amadou.diallo@example.com',
            telephone: '+221701234567',
            poste: 'Développeur Senior',
            typeContrat: 'FIXE',
            salaireBase: 850000,
            dateEmbauche: new Date(),
            entrepriseId,
            estActif: true
          },
          {
            codeEmploye: 'EMP002',
            prenom: 'Fatou',
            nom: 'Sow',
            email: 'fatou.sow@example.com',
            telephone: '+221701234568',
            poste: 'Chef de Projet',
            typeContrat: 'FIXE',
            salaireBase: 750000,
            dateEmbauche: new Date(),
            entrepriseId,
            estActif: true
          },
          {
            codeEmploye: 'EMP003',
            prenom: 'Moussa',
            nom: 'Kane',
            email: 'moussa.kane@example.com',
            telephone: '+221701234569',
            poste: 'Comptable',
            typeContrat: 'FIXE',
            salaireBase: 650000,
            dateEmbauche: new Date(),
            entrepriseId,
            estActif: true
          }
        ]
      });
    }

    // Créer un cycle de paie exemple s'il n'y en a pas
    const cyclesCount = await this.prisma.cyclePaie.count({
      where: { entrepriseId }
    });

    if (cyclesCount === 0) {
      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);

      await this.prisma.cyclePaie.create({
        data: {
          titre: `Cycle ${maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          periode: `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}`,
          dateDebut: debutMois,
          dateFin: finMois,
          statut: 'BROUILLON',
          entrepriseId
        }
      });
    }
  }
}