import type { Request, Response, NextFunction } from 'express';
import { EmployeService } from '../services/employe.service.js';

export class EmployeController {
  private service: EmployeService;

  constructor() {
    this.service = new EmployeService();
  }

  public listerParEntreprise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Récupérer les filtres depuis query params
      const filtres = {
        recherche: req.query.nom as string || req.query.recherche as string, // nom -> recherche
        estActif: req.query.actif === 'true' ? true : req.query.actif === 'false' ? false : undefined,
        poste: req.query.poste as string,
        typeContrat: req.query.typeContrat as any
      };

      // Nettoyer les filtres undefined
      const filtresCleans = Object.fromEntries(
        Object.entries(filtres).filter(([_, value]) => value !== undefined)
      );

      const employes = await this.service.listerParEntreprise(
        parseInt(req.params.entrepriseId), 
        Object.keys(filtresCleans).length > 0 ? filtresCleans : undefined
      );
      res.json(employes);
    } catch (error) {
      next(error);
    }
  };

  public obtenirParId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.obtenirParId(parseInt(req.params.id));
      if (!employe) {
        res.status(404).json({ message: 'Employé non trouvé' });
        return;
      }
      res.json(employe);
    } catch (error) {
      next(error);
    }
  };

  public creer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.creer(req.body, parseInt(req.params.entrepriseId));
      res.status(201).json(employe);
    } catch (error) {
      next(error);
    }
  };

  public modifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.modifier(parseInt(req.params.id), req.body);
      res.json(employe);
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
      const stats = await this.service.obtenirStatistiques(parseInt(req.params.entrepriseId));
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  public activer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.activer(parseInt(req.params.id));
      res.json(employe);
    } catch (error) {
      next(error);
    }
  };

  public desactiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.desactiver(parseInt(req.params.id));
      res.json(employe);
    } catch (error) {
      next(error);
    }
  };

  public toggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employe = await this.service.toggle(parseInt(req.params.id));
      res.json(employe);
    } catch (error) {
      next(error);
    }
  };
}