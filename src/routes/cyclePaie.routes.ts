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

// PATCH /cycles-paie/:id/status - Modifier le statut d'un cycle (RESTful)
router.patch('/cycles-paie/:id/status',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    const { action } = req.body;
    if (action === 'approve') {
      return cyclePaieController.approuver(req, res, next);
    } else if (action === 'close') {
      return cyclePaieController.cloturer(req, res, next);
    } else {
      return res.status(400).json({ message: 'Action invalide. Utilisez: approve ou close' });
    }
  }
);

// POST /cycles-paie/:id/bulletins - Générer les bulletins (RESTful)
router.post('/cycles-paie/:id/bulletins',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.genererBulletins(req, res, next)
);

// GET /cycles-paie/:id/stats - Obtenir les statistiques d'un cycle (RESTful)
router.get('/cycles-paie/:id/stats',
  autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"),
  (req, res, next) => cyclePaieController.obtenirStatistiques(req, res, next)
);

// PATCH /cycles-paie/:id/working-days - Mettre à jour les jours travaillés en lot (RESTful)
router.patch('/cycles-paie/:id/working-days',
  autoriserRoles("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => cyclePaieController.mettreAJourJoursTravailes(req, res, next)
);

// Routes legacy pour compatibilité (à supprimer plus tard)
router.post('/cycles-paie/:id/approuver', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => cyclePaieController.approuver(req, res, next));
router.post('/cycles-paie/:id/cloturer', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => cyclePaieController.cloturer(req, res, next));
router.post('/cycles-paie/:id/generer-bulletins', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => cyclePaieController.genererBulletins(req, res, next));
router.get('/cycles-paie/:id/statistiques', autoriserRoles("SUPER_ADMIN", "ADMIN", "CAISSIER"), (req, res, next) => cyclePaieController.obtenirStatistiques(req, res, next));
router.put('/cycles-paie/:id/jours-travailes', autoriserRoles("SUPER_ADMIN", "ADMIN"), (req, res, next) => cyclePaieController.mettreAJourJoursTravailes(req, res, next));

export default router;