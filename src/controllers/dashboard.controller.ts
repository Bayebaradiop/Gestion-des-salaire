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
}
