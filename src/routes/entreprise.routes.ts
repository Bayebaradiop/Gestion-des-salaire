import { Router } from 'express';
import { EntrepriseController } from '../controllers/entreprise.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authentifier, autoriserRoles } from '../middleware/auth.middleware.js';

const router = Router();
const entrepriseController = new EntrepriseController();
const adminController = new AdminController();

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

router.get('/:id/statistiques',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  entrepriseController.obtenirStatistiques
);

// Route pour que les SUPER_ADMIN créent des utilisateurs d'entreprise
router.post('/:id/utilisateurs',
  autoriserRoles("SUPER_ADMIN"),
  adminController.creerUtilisateurPourEntreprise
);

export default router;