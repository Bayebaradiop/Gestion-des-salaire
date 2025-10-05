import { Router } from 'express';
import { PaiementAutomatiqueService } from '../services/paiementAutomatique.service.js';
import { authentifier } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();
const paiementAutomatiqueService = new PaiementAutomatiqueService();

// Schema de validation pour l'aperçu des calculs
const apercuCalculsSchema = z.object({
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
});

// Schema de validation pour la génération automatique
const genererBulletinsSchema = z.object({
  cyclePaieId: z.number().int().positive("L'ID du cycle de paie doit être un entier positif"),
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
});

/**
 * POST /api/entreprises/:id/paiements-automatiques/apercu
 * Obtenir un aperçu des calculs de salaires basés sur les pointages
 */
router.post('/:id/paiements-automatiques/apercu', authentifier, async (req, res) => {
  try {
    const entrepriseId = parseInt(req.params.id);
    const { dateDebut, dateFin } = apercuCalculsSchema.parse(req.body);

    // Vérifier les permissions
    if (req.utilisateur?.role !== 'SUPER_ADMIN' && req.utilisateur?.entrepriseId !== entrepriseId) {
      return res.status(403).json({ 
        error: 'Accès non autorisé à cette entreprise' 
      });
    }

    // Valider les pointages d'abord
    const validation = await paiementAutomatiqueService.validerPointagesPourCalcul(
      entrepriseId,
      new Date(dateDebut),
      new Date(dateFin)
    );

    // Obtenir l'aperçu des calculs
    const apercu = await paiementAutomatiqueService.obtenirApercuCalculs(
      entrepriseId,
      new Date(dateDebut),
      new Date(dateFin)
    );

    res.json({
      success: true,
      data: {
        validation,
        apercu
      }
    });

  } catch (error) {
    console.error('Erreur aperçu calculs automatiques:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.issues
      });
    }

    res.status(500).json({ 
      error: 'Erreur lors du calcul de l\'aperçu',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/entreprises/:id/paiements-automatiques/generer
 * Générer automatiquement les bulletins de paie basés sur les pointages
 */
router.post('/:id/paiements-automatiques/generer', authentifier, async (req, res) => {
  try {
    const entrepriseId = parseInt(req.params.id);
    const { cyclePaieId, dateDebut, dateFin } = genererBulletinsSchema.parse(req.body);

    // Vérifier les permissions
    if (req.utilisateur?.role !== 'SUPER_ADMIN' && req.utilisateur?.entrepriseId !== entrepriseId) {
      return res.status(403).json({ 
        error: 'Accès non autorisé à cette entreprise' 
      });
    }

    // Seuls les admins peuvent générer des bulletins
    if (req.utilisateur?.role === 'CAISSIER') {
      return res.status(403).json({ 
        error: 'Seuls les administrateurs peuvent générer des bulletins automatiquement' 
      });
    }

    // Valider les pointages d'abord
    const validation = await paiementAutomatiqueService.validerPointagesPourCalcul(
      entrepriseId,
      new Date(dateDebut),
      new Date(dateFin)
    );

    if (!validation.valide) {
      return res.status(400).json({
        error: 'Validation des pointages échouée',
        details: {
          erreurs: validation.erreurs,
          avertissements: validation.avertissements
        }
      });
    }

    // Générer les bulletins automatiquement
    const bulletins = await paiementAutomatiqueService.genererBulletinsAutomatiques(
      entrepriseId,
      cyclePaieId,
      new Date(dateDebut),
      new Date(dateFin)
    );

    res.json({
      success: true,
      data: {
        message: `${bulletins.length} bulletins générés automatiquement`,
        bulletins: bulletins.length,
        validation
      }
    });

  } catch (error) {
    console.error('Erreur génération bulletins automatiques:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.issues
      });
    }

    res.status(500).json({ 
      error: 'Erreur lors de la génération automatique',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/entreprises/:id/paiements-automatiques/validation
 * Valider les pointages pour le calcul automatique
 */
router.post('/:id/paiements-automatiques/validation', authentifier, async (req, res) => {
  try {
    const entrepriseId = parseInt(req.params.id);
    const { dateDebut, dateFin } = apercuCalculsSchema.parse(req.body);

    // Vérifier les permissions
    if (req.utilisateur?.role !== 'SUPER_ADMIN' && req.utilisateur?.entrepriseId !== entrepriseId) {
      return res.status(403).json({ 
        error: 'Accès non autorisé à cette entreprise' 
      });
    }

    const validation = await paiementAutomatiqueService.validerPointagesPourCalcul(
      entrepriseId,
      new Date(dateDebut),
      new Date(dateFin)
    );

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Erreur validation pointages:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.issues
      });
    }

    res.status(500).json({ 
      error: 'Erreur lors de la validation',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;