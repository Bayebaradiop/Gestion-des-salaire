
import type { Request, Response, NextFunction } from 'express';
import { AuthService, authService as singletonAuthService } from '../services/auth.service.js';

export class AuthController {
  private service: AuthService;

  constructor() {
    // Use the singleton to keep cookie/token behavior consistent
    this.service = singletonAuthService;
  }

  public connexion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, motDePasse } = req.body as { email: string; motDePasse: string };
      const resultat = await this.service.seConnecter(email, motDePasse);

      if (!resultat) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
      }

      this.service.setCookieToken(res, resultat.token);
      res.json(resultat);
    } catch (error) {
      next(error);
    }
  };

  public inscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultat = await this.service.sInscrire(req.body);
      this.service.setCookieToken(res, resultat.token);
      res.status(201).json(resultat);
    } catch (error) {
      next(error);
    }
  };

  public profil = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.utilisateur) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }
      const profil = await this.service.obtenirProfil(req.utilisateur.id);
      if (!profil) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      res.json(profil);
    } catch (error) {
      next(error);
    }
  };

  public deconnexion = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.service.clearCookieToken(res);
      res.json({ message: 'Déconnecté avec succès' });
    } catch (error) {
      next(error);
    }
  };
}
