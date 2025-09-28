import { Router } from 'express';
import { EntrepriseController } from '../controllers/entreprise.controller.js';
import { authentifier, autoriserRoles } from '../middleware/auth.middleware.js';

const router = Router();
const entrepriseController = new EntrepriseController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes pour super admin uniquement
router.get('/',
  autoriserRoles("SUPER_ADMIN"),
  entrepriseController.listerTout
);

router.post('/',
  autoriserRoles("SUPER_ADMIN"),
  entrepriseController.creer
);

router.delete('/:id',
  autoriserRoles("SUPER_ADMIN"),
  entrepriseController.supprimer
);

// Routes pour admin et super admin
router.get('/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  entrepriseController.obtenirParId
);

router.put('/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  entrepriseController.modifier
);

// GET /:id/stats - Obtenir les statistiques d'une entreprise (RESTful)
router.get('/:id/stats',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  entrepriseController.obtenirStatistiques
);

// Route legacy pour compatibilité
router.get('/:id/statistiques', autoriserRoles("SUPER_ADMIN", "ADMIN"), entrepriseController.obtenirStatistiques);

export default router;