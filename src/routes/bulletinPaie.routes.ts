import { Router } from 'express';
import { BulletinPaieController } from '../controllers/bulletinPaie.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const bulletinPaieController = new BulletinPaieController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes pour les bulletins d'un cycle
// GET /cycles-paie/:cycleId/bulletins - Lister les bulletins d'un cycle
router.get('/cycles-paie/:cycleId/bulletins',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => bulletinPaieController.listerParCycle(req, res, next)
);

// Routes pour un bulletin spécifique
// GET /bulletins/:id - Obtenir un bulletin par ID
router.get('/bulletins/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => bulletinPaieController.obtenirParId(req, res, next)
);

// PUT /bulletins/:id - Modifier un bulletin
router.put('/bulletins/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => bulletinPaieController.modifier(req, res, next)
);

// DELETE /bulletins/:id - Supprimer un bulletin
router.delete('/bulletins/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => bulletinPaieController.supprimer(req, res, next)
);

// PATCH /bulletins/:id/recalculate - Recalculer un bulletin (RESTful)
router.patch('/bulletins/:id/recalculate',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => bulletinPaieController.recalculer(req, res, next)
);

// Route legacy pour compatibilité
router.post('/bulletins/:id/recalculer', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => bulletinPaieController.recalculer(req, res, next));

// GET /bulletins/:id/pdf - Générer le bulletin de paie PDF
router.get('/bulletins/:id/pdf',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => bulletinPaieController.genererPDF(req, res, next)
);

export default router;