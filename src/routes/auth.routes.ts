import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authentifier } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Routes d'authentification - pas d'authentification requise
router.post('/connexion', authController.connexion);
router.post('/inscription', authController.inscription);
router.post('/deconnexion', authController.deconnexion);

// Route protégée pour obtenir le profil
router.get('/profil', authentifier, authController.profil);

export default router;
