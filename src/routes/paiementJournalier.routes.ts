import { Router } from 'express';
import {
  calculerPaiement,
  enregistrerPaiement,
  listerEmployesJournaliers,
  obtenirHistorique,
  obtenirDetailCalcul
} from '../controllers/paiementJournalier.controller.js';
import { authentifier } from '../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authentifier);

/**
 * @route POST /api/paiements-journaliers/calculer
 * @desc Calculer le paiement dû pour un employé journalier
 * @access ADMIN, CAISSIER
 */
router.post('/calculer', calculerPaiement);

/**
 * @route POST /api/paiements-journaliers/enregistrer
 * @desc Enregistrer un paiement manuel pour un employé journalier
 * @access ADMIN, CAISSIER
 */
router.post('/enregistrer', enregistrerPaiement);

/**
 * @route GET /api/paiements-journaliers/employes
 * @desc Lister tous les employés journaliers avec statut de paiement
 * @access ADMIN, CAISSIER
 */
router.get('/employes', listerEmployesJournaliers);

/**
 * @route GET /api/paiements-journaliers/historique
 * @desc Obtenir l'historique des paiements journaliers
 * @access ADMIN, CAISSIER
 */
router.get('/historique', obtenirHistorique);

/**
 * @route GET /api/paiements-journaliers/detail/:employeId
 * @desc Obtenir le détail du calcul pour un employé
 * @access ADMIN, CAISSIER
 */
router.get('/detail/:employeId', obtenirDetailCalcul);

export default router;