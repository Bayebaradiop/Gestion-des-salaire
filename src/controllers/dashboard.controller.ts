import type { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  public obtenirKPIs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.obtenirKPIs(parseInt(req.params.entrepriseId));
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  public obtenirEvolutionMasseSalariale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.obtenirEvolutionMasseSalariale(parseInt(req.params.entrepriseId));
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  public obtenirProchainsPaiements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const data = await this.service.obtenirProchainsPaiements(parseInt(req.params.entrepriseId), limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Nouvelle méthode pour obtenir toutes les données du dashboard
  public obtenirToutesDonnees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entrepriseId = parseInt(req.params.entrepriseId);
      
      const [kpis, evolution, prochainsPaiements] = await Promise.all([
        this.service.obtenirKPIs(entrepriseId),
        this.service.obtenirEvolutionMasseSalariale(entrepriseId),
        this.service.obtenirProchainsPaiements(entrepriseId, 5)
      ]);

      // Transformer les données pour le frontend
      const graphData = evolution.map(item => ({
        mois: item.mois,
        masseSalariale: item.montant,
        montantPaye: Math.floor(item.montant * 0.8), // 80% supposé payé
        montantRestant: Math.floor(item.montant * 0.2) // 20% restant
      }));

      const stats = {
        employesActifs: kpis.nombreEmployesActifs,
        employesTotal: kpis.nombreEmployes,
        cyclesEnCours: await this.service.compterCyclesEnCours(entrepriseId),
        bulletinsEnAttente: await this.service.compterBulletinsEnAttente(entrepriseId)
      };

      res.json({
        stats,
        graphData,
        prochainsPaiements
      });
    } catch (error) {
      next(error);
    }
  };

  // Vérifier si des données existent
  public verifierDonnees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entrepriseId = parseInt(req.params.entrepriseId);
      const hasData = await this.service.verifierDonnees(entrepriseId);
      res.json({ hasData });
    } catch (error) {
      next(error);
    }
  };

  // Initialiser les données
  public initialiserDonnees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entrepriseId = parseInt(req.body.entrepriseId);
      await this.service.initialiserDonnees(entrepriseId);
      res.json({ message: 'Données initialisées avec succès' });
    } catch (error) {
      next(error);
    }
  };
}
