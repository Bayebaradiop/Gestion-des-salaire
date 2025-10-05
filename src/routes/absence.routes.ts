import { Router } from 'express';
import { AbsenceController } from '../controllers/absence.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new AbsenceController();

// Auth obligatoire
router.use(authentifier);

// Calculer et mettre à jour les absences pour un bulletin (ADMIN, CAISSIER)
router.post('/bulletins/:bulletinId/calculer-absences', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.calculerAbsencesBulletin(req, res, next)
);

// Calculer et mettre à jour les absences pour tout un cycle (ADMIN)
router.post('/cycles/:cycleId/calculer-absences', 
  autoriserRoles('ADMIN'), 
  (req, res, next) => controller.calculerAbsencesCycle(req, res, next)
);

// Obtenir les absences calculées pour un bulletin
router.get('/bulletins/:bulletinId/absences', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.obtenirAbsencesBulletin(req, res, next)
);

export default router;