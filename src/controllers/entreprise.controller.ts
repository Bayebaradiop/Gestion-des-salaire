import type { Request, Response, NextFunction } from 'express';
import { EntrepriseService } from '../services/entreprise.service.js';
import { creerEntrepriseSchema, modifierEntrepriseSchema, entrepriseParamsSchema } from '../validator/entreprise.validator.js';

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
      const verifParams = entrepriseParamsSchema.safeParse(req.params);
      if (!verifParams.success) {
        return res.status(400).json({
          errors: verifParams.error.format()
        });
      }

      const entreprise = await this.service.obtenirParId(verifParams.data.id);
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
      const verif = creerEntrepriseSchema.safeParse(req.body);
      if (!verif.success) {
        return res.status(400).json({
          errors: verif.error.format()
        });
      }

      const entreprise = await this.service.creer(verif.data);
      res.status(201).json(entreprise);
    } catch (error) {
      next(error);
    }
  };

  public modifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verifParams = entrepriseParamsSchema.safeParse(req.params);
      if (!verifParams.success) {
        return res.status(400).json({
          errors: verifParams.error.format()
        });
      }

      const verifBody = modifierEntrepriseSchema.safeParse(req.body);
      if (!verifBody.success) {
        return res.status(400).json({
          errors: verifBody.error.format()
        });
      }

      const entreprise = await this.service.modifier(verifParams.data.id, verifBody.data);
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
