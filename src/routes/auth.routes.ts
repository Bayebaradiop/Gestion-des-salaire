import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authentifier } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Routes d'authentification RESTful
router.post('/sessions', authController.connexion); // POST /sessions pour créer une session
router.post('/login', authController.connexion); // Alias pour compatibilité
router.post('/users', authController.inscription); // POST /users pour créer un utilisateur
router.delete('/sessions', authController.deconnexion); // DELETE /sessions pour supprimer la session

// Route protégée pour obtenir le profil utilisateur actuel
router.get('/profile', authentifier, authController.profil); // GET /profile (standard REST)

export default router;
