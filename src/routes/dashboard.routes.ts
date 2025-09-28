import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const dashboardController = new DashboardController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes RESTful pour le dashboard d'une entreprise
// GET /entreprises/:entrepriseId/dashboards/kpis - KPIs (RESTful)
router.get('/entreprises/:entrepriseId/dashboards/kpis',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirKPIs(req, res, next)
);

// GET /entreprises/:entrepriseId/dashboards/salary-evolution - Évolution masse salariale (RESTful)
router.get('/entreprises/:entrepriseId/dashboards/salary-evolution',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirEvolutionMasseSalariale(req, res, next)
);

// GET /entreprises/:entrepriseId/dashboards/upcoming-payments - Prochains paiements (RESTful)
router.get('/entreprises/:entrepriseId/dashboards/upcoming-payments',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => dashboardController.obtenirProchainsPaiements(req, res, next)
);

// Routes legacy pour compatibilité
router.get('/entreprises/:entrepriseId/dashboard/kpis', autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"), verifierEntreprise, (req, res, next) => dashboardController.obtenirKPIs(req, res, next));
router.get('/entreprises/:entrepriseId/dashboard/evolution-masse-salariale', autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"), verifierEntreprise, (req, res, next) => dashboardController.obtenirEvolutionMasseSalariale(req, res, next));
router.get('/entreprises/:entrepriseId/dashboard/prochains-paiements', autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"), verifierEntreprise, (req, res, next) => dashboardController.obtenirProchainsPaiements(req, res, next));

export default router;