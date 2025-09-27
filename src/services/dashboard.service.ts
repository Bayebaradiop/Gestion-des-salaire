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
    // Nombre d'employés
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
}