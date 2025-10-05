import { Router } from 'express';
import { CalculSalaireController } from '../controllers/calculSalaire.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new CalculSalaireController();

// Auth obligatoire
router.use(authentifier);

// Calcul de salaire pour un employé dans un cycle
router.get('/employes/:employeId/cycles/:cyclePaieId/calculer-salaire', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.calculerSalaire(req, res, next)
);

// Calcul et mise à jour d'un bulletin de paie
router.post('/bulletins/:bulletinId/calculer-et-mettre-a-jour', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.calculerEtMettreAJour(req, res, next)
);

// Obtenir les détails de calcul d'un bulletin
router.get('/bulletins/:bulletinId/details-calcul', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.obtenirDetailsCalcul(req, res, next)
);

// Recalculer tous les bulletins d'un cycle
router.post('/cycles/:cyclePaieId/recalculer-bulletins', 
  autoriserRoles('ADMIN'), 
  (req, res, next) => controller.recalculerTousLesBulletins(req, res, next)
);

// Résumé des heures travaillées pour un employé
router.get('/employes/:employeId/resume-heures', 
  autoriserRoles('ADMIN', 'CAISSIER'), 
  (req, res, next) => controller.obtenirResumeHeures(req, res, next)
);

export default router;