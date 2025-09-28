import { Router } from 'express';
import { EmployeController } from '../controllers/employe.controller.js';
import { authentifier, autoriserRoles, verifierEntreprise } from '../middleware/auth.middleware.js';

const router = Router();
const employeController = new EmployeController();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

// Routes avec vérification d'entreprise pour Admin et Caissier
// GET /entreprises/:entrepriseId/employes - Lister les employés d'une entreprise
router.get('/entreprises/:entrepriseId/employes',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => employeController.listerParEntreprise(req, res, next)
);

// POST /entreprises/:entrepriseId/employes - Créer un employé
router.post('/entreprises/:entrepriseId/employes',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  verifierEntreprise,
  (req, res, next) => employeController.creer(req, res, next)
);

// GET /entreprises/:entrepriseId/employes/stats - Statistiques des employés (RESTful)
router.get('/entreprises/:entrepriseId/employes/stats',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  verifierEntreprise,
  (req, res, next) => employeController.obtenirStatistiques(req, res, next)
);

// Route legacy pour compatibilité
router.get('/entreprises/:entrepriseId/employes/statistiques', autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"), verifierEntreprise, (req, res, next) => employeController.obtenirStatistiques(req, res, next));

// Routes pour un employé spécifique
// GET /employes/:id - Obtenir un employé par ID
router.get('/employes/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => employeController.obtenirParId(req, res, next)
);

// PUT /employes/:id - Modifier un employé
router.put('/employes/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => employeController.modifier(req, res, next)
);

// DELETE /employes/:id - Supprimer un employé
router.delete('/employes/:id',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => employeController.supprimer(req, res, next)
);

// PATCH /employes/:id/status - Modifier le statut d'un employé (RESTful)
router.patch('/employes/:id/status',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    const { action } = req.body;
    if (action === 'activate') {
      return employeController.activer(req, res, next);
    } else if (action === 'deactivate') {
      return employeController.desactiver(req, res, next);
    } else if (action === 'toggle') {
      return employeController.toggle(req, res, next);
    } else {
      return res.status(400).json({ message: 'Action invalide. Utilisez: activate, deactivate, ou toggle' });
    }
  }
);

// Routes legacy pour compatibilité (à supprimer plus tard)
router.post('/employes/:id/activer', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => employeController.activer(req, res, next));
router.post('/employes/:id/desactiver', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => employeController.desactiver(req, res, next));
router.put('/employes/:id/toggle', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => employeController.toggle(req, res, next));

export default router;