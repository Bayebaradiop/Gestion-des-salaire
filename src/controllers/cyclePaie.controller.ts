import type { Request, Response, NextFunction } from 'express';
import { CyclePaieService } from '../services/cyclePaie.service.js';

export class CyclePaieController {
  private service: CyclePaieService;

  constructor() {
    this.service = new CyclePaieService();
  }

  public listerParEntreprise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entrepriseId } = req.params;
      const cycles = await this.service.listerParEntreprise(parseInt(entrepriseId));
      res.json(cycles);
    } catch (error) {
      next(error);
    }
  };

  public obtenirParId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycle = await this.service.obtenirParId(parseInt(req.params.id));
      if (!cycle) {
        res.status(404).json({ message: 'Cycle de paie non trouvé' });
        return;
      }
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  };

  public creer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const donnees = {
        ...req.body,
        dateDebut: new Date(req.body.dateDebut),
        dateFin: new Date(req.body.dateFin),
        entrepriseId: parseInt(req.params.entrepriseId),
      };
      const cycle = await this.service.creer(donnees);
      res.status(201).json(cycle);
    } catch (error) {
      next(error);
    }
  };

  public modifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const donnees = { ...req.body };
      if (donnees.dateDebut) donnees.dateDebut = new Date(donnees.dateDebut);
      if (donnees.dateFin) donnees.dateFin = new Date(donnees.dateFin);
      const cycle = await this.service.modifier(parseInt(req.params.id), donnees);
      res.json(cycle);
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

  public approuver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycle = await this.service.approuver(parseInt(req.params.id));
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  };

  public cloturer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycle = await this.service.cloturer(parseInt(req.params.id));
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  };

  public genererBulletins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bulletins = await this.service.genererBulletins(parseInt(req.params.id));
      res.status(201).json(bulletins);
    } catch (error) {
      next(error);
    }
  };
}
