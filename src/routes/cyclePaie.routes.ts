import { Router } from 'express';
import { CyclePaieController } from '../controllers/cyclePaie.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const cyclePaieController = new CyclePaieController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes avec vérification d'entreprise pour Admin et Caissier
// GET /entreprises/:entrepriseId/cycles-paie - Lister les cycles de paie d'une entreprise
router.get('/entreprises/:entrepriseId/cycles-paie',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => cyclePaieController.listerParEntreprise(req, res, next)
);

// POST /entreprises/:entrepriseId/cycles-paie - Créer un cycle de paie
router.post('/entreprises/:entrepriseId/cycles-paie',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  verifierEntreprise,
  (req, res, next) => cyclePaieController.creer(req, res, next)
);

// Routes pour un cycle spécifique
// GET /cycles-paie/:id - Obtenir un cycle par ID
router.get('/cycles-paie/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => cyclePaieController.obtenirParId(req, res, next)
);

// PUT /cycles-paie/:id - Modifier un cycle
router.put('/cycles-paie/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.modifier(req, res, next)
);

// DELETE /cycles-paie/:id - Supprimer un cycle
router.delete('/cycles-paie/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.supprimer(req, res, next)
);

// POST /cycles-paie/:id/approuver - Approuver un cycle
router.post('/cycles-paie/:id/approuver',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.approuver(req, res, next)
);

// POST /cycles-paie/:id/cloturer - Clôturer un cycle
router.post('/cycles-paie/:id/cloturer',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.cloturer(req, res, next)
);

// POST /cycles-paie/:id/generer-bulletins - Générer les bulletins
router.post('/cycles-paie/:id/generer-bulletins',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.genererBulletins(req, res, next)
);

// GET /cycles-paie/:id/statistiques - Obtenir les statistiques d'un cycle
router.get('/cycles-paie/:id/statistiques',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => cyclePaieController.obtenirStatistiques(req, res, next)
);

// PUT /cycles-paie/:id/jours-travailes - Mettre à jour les jours travaillés en lot
router.put('/cycles-paie/:id/jours-travailes',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.mettreAJourJoursTravailes(req, res, next)
);

export default router;