import { Router } from 'express';
import { PaiementAutomatiseController } from '../controllers/paiementAutomatise.controller';
import { authentifier, verifierEntreprise, autoriserRoles } from '../middleware/auth.middleware';

const router = Router();
const paiementAutomatiseController = new PaiementAutomatiseController();

// Middleware d'authentification pour toutes les routes  
router.use(authentifier);

// ================================
// ROUTES CAISSIER - CALCUL ET PAIEMENT
// ================================

/**
 * POST /api/paiements/calculer/:employeId
 * Calculer le montant dû pour un employé sur une période donnée
 * RESTRICTION : Seuls les CAISSIER
 * VALIDATION : Nécessite pointages validés par ADMIN
 */
router.post('/calculer/:employeId', 
  autoriserRoles('CAISSIER'),
  paiementAutomatiseController.calculerPaiement
);

/**
 * POST /api/paiements/enregistrer/:employeId  
 * Enregistrer un paiement automatisé après calcul
 * RESTRICTION : Seuls les CAISSIER
 */
router.post('/enregistrer/:employeId',
  autoriserRoles('CAISSIER'),
  paiementAutomatiseController.enregistrerPaiement
);

/**
 * PUT /api/paiements/:paiementId/marquer-paye
 * Marquer un paiement comme payé
 * RESTRICTION : Seuls les CAISSIER
 */
router.put('/:paiementId/marquer-paye',
  autoriserRoles('CAISSIER'),
  paiementAutomatiseController.marquerCommePaye
);

// ================================
// ROUTES ADMIN - VALIDATION POINTAGES
// ================================

/**
 * POST /api/paiements/admin/pointages/valider
 * Valider les pointages d'une période
 * RESTRICTION : Seuls les ADMIN
 */
router.post('/admin/pointages/valider',
  autoriserRoles('ADMIN'),
  paiementAutomatiseController.validerPointagesPeriode
);

/**
 * GET /api/paiements/pointages/validation-status/:employeId/:periode
 * Vérifier le statut de validation des pointages
 * ACCESSIBLE : ADMIN et CAISSIER
 */
router.get('/pointages/validation-status/:employeId/:periode',
  autoriserRoles('ADMIN', 'CAISSIER'),
  paiementAutomatiseController.verifierValidationPointages
);

// ================================
// ROUTES CONSULTATION - ADMIN & CAISSIER
// ================================

/**
 * GET /api/paiements/entreprises/:entrepriseId/paiements-automatises
 * Récupérer tous les paiements automatisés d'une entreprise avec traçabilité
 * ACCESSIBLE : ADMIN et CAISSIER
 */
router.get('/entreprises/:entrepriseId/paiements-automatises',
  autoriserRoles('ADMIN', 'CAISSIER'),
  verifierEntreprise,
  paiementAutomatiseController.obtenirPaiementsEntreprise
);

/**
 * GET /api/paiements/:paiementId
 * Récupérer les détails d'un paiement automatisé avec traçabilité
 * ACCESSIBLE : ADMIN et CAISSIER
 */
router.get('/:paiementId',
  autoriserRoles('ADMIN', 'CAISSIER'),
  paiementAutomatiseController.obtenirDetailsPaiement
);

export default router;