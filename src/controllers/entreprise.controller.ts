import type { Request, Response, NextFunction } from 'express';
import { EntrepriseService } from '../services/entreprise.service.js';

export class EntrepriseController {
  private service: EntrepriseService;

  constructor() {
    this.service = new EntrepriseService();
  }

  public listerTout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listerTout();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  public obtenirParId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entreprise = await this.service.obtenirParId(parseInt(req.params.id));
      if (!entreprise) {
        res.status(404).json({ message: 'Entreprise non trouvée' });
        return;
      }
      res.json(entreprise);
    } catch (error) {
      next(error);
    }
  };

  public creer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entreprise = await this.service.creer(req.body);
      res.status(201).json(entreprise);
    } catch (error) {
      next(error);
    }
  };

  public modifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entreprise = await this.service.modifier(parseInt(req.params.id), req.body);
      res.json(entreprise);
    } catch (error) {
      next(error);
    }
  };

  public supprimer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.supprimer(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public obtenirStatistiques = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.obtenirStatistiques(parseInt(req.params.id));
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}
