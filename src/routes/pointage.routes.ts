import { Router } from 'express';
import { PointageController } from '../controllers/pointage.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new PointageController();

// Auth obligatoire
router.use(authentifier);

// Arrivée / Départ (ADMIN, CAISSIER)
router.post('/pointages/arrivee', autoriserRoles('ADMIN', 'CAISSIER'), (req, res, next) => controller.arriver(req, res, next));
router.post('/pointages/depart', autoriserRoles('ADMIN', 'CAISSIER'), (req, res, next) => controller.depart(req, res, next));

// Créer une absence (marquage automatique)
router.post('/pointages/absence', autoriserRoles('ADMIN', 'CAISSIER'), (req, res, next) => controller.creerAbsence(req, res, next));

// Listing et export par entreprise (ADMIN, SUPER_ADMIN)
router.get('/entreprises/:entrepriseId/pointages', autoriserRoles('ADMIN', 'SUPER_ADMIN'), verifierEntreprise, (req, res, next) => controller.lister(req, res, next));
router.get('/entreprises/:entrepriseId/pointages/export', autoriserRoles('ADMIN', 'SUPER_ADMIN'), verifierEntreprise, (req, res, next) => controller.exporter(req, res, next));

export default router;
