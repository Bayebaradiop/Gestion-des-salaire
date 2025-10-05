import { Request, Response, NextFunction } from 'express';
import { AutorisationService } from '../services/autorisation.service.js';

export class AutorisationController {
  private service: AutorisationService;

  constructor() {
    this.service = new AutorisationService();
  }

  /**
   * Récupérer l'état de l'accès Super-Admin pour une entreprise
   */
  async obtenirEtatAcces(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const etat = await this.service.obtenirEtatAcces(Number(entrepriseId));
      res.json(etat);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour l'autorisation d'accès Super-Admin
   */
  async mettreAJourAutorisation(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const { accesSuperAdminAutorise } = req.body;

      // Validation
      if (typeof accesSuperAdminAutorise !== 'boolean') {
        return res.status(400).json({ 
          message: 'Le champ accesSuperAdminAutorise doit être un booléen' 
        });
      }

      const resultat = await this.service.mettreAJourAutorisation(
        Number(entrepriseId), 
        accesSuperAdminAutorise
      );

      res.json({
        message: accesSuperAdminAutorise 
          ? 'Accès Super-Admin autorisé avec succès' 
          : 'Accès Super-Admin bloqué avec succès',
        entreprise: resultat
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vérifier si un Super-Admin peut accéder à une entreprise
   */
  async verifierAccesAutorise(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const accesAutorise = await this.service.verifierAccesAutorise(Number(entrepriseId));
      
      if (!accesAutorise) {
        return res.status(403).json({ 
          accesAutorise: false,
          message: 'Accès refusé : l\'Admin a bloqué l\'accès à cette entreprise.'
        });
      }
      
      res.json({ 
        accesAutorise: true,
        message: 'Accès autorisé'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vérifier l'accès avant navigation (pour le frontend)
   */
  async verifierAccesNavigation(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const accesAutorise = await this.service.verifierAccesAutorise(Number(entrepriseId));
      
      if (!accesAutorise) {
        return res.status(403).json({ 
          accesAutorise: false,
          message: 'Vous n\'avez pas accès à cette entreprise.',
          entrepriseId: Number(entrepriseId),
          raison: 'L\'administrateur de cette entreprise a bloqué l\'accès aux Super-Admins.'
        });
      }
      
      res.json({ 
        accesAutorise: true,
        message: 'Accès autorisé',
        entrepriseId: Number(entrepriseId)
      });
    } catch (error) {
      next(error);
    }
  }
}