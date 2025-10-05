import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { TokenPayload, RoleUtilisateur } from '../interfaces/auth.interface.js';

// Étendre l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      utilisateur?: TokenPayload;
    }
  }
}

const authService = new AuthService();

export const authentifier = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Essayer de lire le token depuis les cookies d'abord (HTTP-only)
    let token = req.cookies?.authToken;
    
    // Si pas de cookie, essayer l'en-tête Authorization en fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      res.status(401).json({ message: 'Token d\'authentification manquant' });
      return;
    }

    const payload = authService.verifierToken(token);
    req.utilisateur = payload;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Token invalide', 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
  }
};

export const autoriserRoles = (...rolesAutorises: RoleUtilisateur[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.utilisateur) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      res.status(403).json({ 
        message: 'Accès refusé - Permissions insuffisantes',
        roleRequis: rolesAutorises,
        roleActuel: req.utilisateur.role
      });
      return;
    }

    next();
  };
};

export const verifierEntreprise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.utilisateur) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  // Super admin doit vérifier les autorisations d'accès
  if (req.utilisateur.role === 'SUPER_ADMIN') {
    // Déléguer la vérification au middleware spécialisé
    await verifierAccesSuperAdminAutorise(req, res, next);
    return;
  }

  // Pour les autres rôles, vérifier l'entreprise
  const entrepriseId = req.params.entrepriseId || req.body.entrepriseId;
  
  if (!entrepriseId) {
    res.status(400).json({ message: 'ID entreprise manquant' });
    return;
  }

  // Convertir en number pour la comparaison
  const entrepriseIdNumber = parseInt(entrepriseId);
  
  if (req.utilisateur.entrepriseId !== entrepriseIdNumber) {
    res.status(403).json({ message: 'Accès refusé - Entreprise non autorisée' });
    return;
  }

  next();
};

/**
 * Middleware pour vérifier l'accès Super-Admin avec autorisation de l'entreprise
 */
export const verifierAccesSuperAdminAutorise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.utilisateur) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  // Seuls les Super-Admins peuvent utiliser ce middleware
  if (req.utilisateur.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Accès réservé aux Super-Admins' });
    return;
  }

  const entrepriseId = req.params.entrepriseId || req.body.entrepriseId;
  
  if (!entrepriseId) {
    res.status(400).json({ message: 'ID entreprise manquant' });
    return;
  }

  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { AutorisationService } = await import('../services/autorisation.service.js');
    const autorisationService = new AutorisationService();
    
    const accesAutorise = await autorisationService.verifierAccesAutorise(parseInt(entrepriseId));
    
    if (!accesAutorise) {
      res.status(403).json({ 
        message: 'Accès bloqué par l\'administrateur de l\'entreprise',
        entrepriseId: parseInt(entrepriseId)
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la vérification des autorisations',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};