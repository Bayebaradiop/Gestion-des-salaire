import { Router } from 'express';
import { AutorisationController } from '../controllers/autorisation.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new AutorisationController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes pour les Admins d'entreprise
// GET /entreprises/:entrepriseId/autorisation - Obtenir l'état d'autorisation
router.get('/entreprises/:entrepriseId/autorisation',
  autoriserRoles('ADMIN'),
  verifierEntreprise,
  (req, res, next) => controller.obtenirEtatAcces(req, res, next)
);

// PUT /entreprises/:entrepriseId/autorisation - Mettre à jour l'autorisation
router.put('/entreprises/:entrepriseId/autorisation',
  autoriserRoles('ADMIN'),
  verifierEntreprise,
  (req, res, next) => controller.mettreAJourAutorisation(req, res, next)
);

// Routes pour les Super-Admins
// GET /entreprises/:entrepriseId/autorisation/verifier - Vérifier l'accès autorisé
router.get('/entreprises/:entrepriseId/autorisation/verifier',
  autoriserRoles('SUPER_ADMIN'),
  (req, res, next) => controller.verifierAccesAutorise(req, res, next)
);

// GET /entreprises/:entrepriseId/autorisation/navigation - Vérifier l'accès avant navigation
router.get('/entreprises/:entrepriseId/autorisation/navigation',
  autoriserRoles('SUPER_ADMIN'),
  (req, res, next) => controller.verifierAccesNavigation(req, res, next)
);

export default router;