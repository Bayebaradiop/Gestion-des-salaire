import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const dashboardController = new DashboardController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes pour le dashboard d'une entreprise
// GET /entreprises/:entrepriseId/dashboard/kpis - KPIs
router.get('/entreprises/:entrepriseId/dashboard/kpis',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirKPIs(req, res, next)
);

// GET /entreprises/:entrepriseId/dashboard/evolution-masse-salariale - Évolution masse salariale
router.get('/entreprises/:entrepriseId/dashboard/evolution-masse-salariale',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirEvolutionMasseSalariale(req, res, next)
);

// GET /entreprises/:entrepriseId/dashboard/prochains-paiements - Prochains paiements
router.get('/entreprises/:entrepriseId/dashboard/prochains-paiements',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirProchainsPaiements(req, res, next)
);

export default router;