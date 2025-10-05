import { Request, Response } from 'express';
import { PaiementJournalierService } from '../services/paiementJournalier.service.js';
import { z } from 'zod';

const paiementJournalierService = new PaiementJournalierService();

// Schémas de validation
const calculerPaiementSchema = z.object({
  employeId: z.number().int().positive(),
  mois: z.number().int().min(1).max(12),
  annee: z.number().int().min(2020).max(2030)
});

const enregistrerPaiementSchema = z.object({
  employeId: z.number().int().positive(),
  mois: z.number().int().min(1).max(12),
  annee: z.number().int().min(2020).max(2030),
  montantPaye: z.number().positive(),
  methodePaiement: z.enum(['ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE', 'AUTRE']),
  reference: z.string().optional(),
  notes: z.string().optional()
});

export class PaiementJournalierController {

  /**
   * Calcule le paiement dû pour un employé journalier
   */
  async calculerPaiement(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // ADMIN et CAISSIER peuvent calculer les paiements
      if (!['ADMIN', 'CAISSIER'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour calculer les paiements'
        });
      }

      const { employeId, mois, annee } = calculerPaiementSchema.parse(req.body);

      const calcul = await paiementJournalierService.calculerPaiementJournalier(
        employeId, 
        mois, 
        annee
      );

      res.json({
        success: true,
        message: 'Calcul effectué avec succès',
        data: calcul
      });

    } catch (error) {
      console.error('Erreur calcul paiement journalier:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.issues
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du calcul du paiement'
      });
    }
  }

  /**
   * Enregistre un paiement manuel pour un employé journalier
   */
  async enregistrerPaiement(req: Request, res: Response) {
    try {
      const donnees = enregistrerPaiementSchema.parse(req.body);
      const user = (req as any).user; // Utilisateur connecté

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // Vérifier les permissions (ADMIN ou CAISSIER peuvent enregistrer)
      if (!['ADMIN', 'CAISSIER'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour enregistrer un paiement'
        });
      }

      const resultat = await paiementJournalierService.enregistrerPaiementJournalier(
        donnees.employeId,
        donnees.mois,
        donnees.annee,
        donnees.montantPaye,
        donnees.methodePaiement,
        user.id, // traiteParId
        donnees.reference,
        donnees.notes
      );

      res.json({
        success: true,
        message: 'Paiement enregistré avec succès',
        data: resultat
      });

    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.issues
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement du paiement'
      });
    }
  }

  /**
   * Liste tous les employés journaliers avec leur statut de paiement
   */
  async listerEmployesJournaliers(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user?.entrepriseId) {
        return res.status(400).json({
          success: false,
          message: 'Entreprise non identifiée'
        });
      }

      // ADMIN et CAISSIER peuvent lister les employés journaliers
      // ADMIN : pour voir le statut des pointages
      // CAISSIER : pour effectuer les paiements
      if (!['ADMIN', 'CAISSIER'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes'
        });
      }

      // Paramètres optionnels
      const mois = req.query.mois ? parseInt(req.query.mois as string) : new Date().getMonth() + 1;
      const annee = req.query.annee ? parseInt(req.query.annee as string) : new Date().getFullYear();

      const employes = await paiementJournalierService.listerEmployesJournaliers(
        user.entrepriseId,
        mois,
        annee
      );

      res.json({
        success: true,
        data: {
          employes,
          periode: { mois, annee },
          total: employes.length,
          avecPointages: employes.filter(e => e.hasPointages).length,
          necessitentPaiement: employes.filter(e => e.needsPayment).length
        }
      });

    } catch (error) {
      console.error('Erreur listage employés journaliers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement des employés journaliers'
      });
    }
  }

  /**
   * Obtient l'historique des paiements journaliers
   */
  async obtenirHistorique(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user?.entrepriseId) {
        return res.status(400).json({
          success: false,
          message: 'Entreprise non identifiée'
        });
      }

      // Filtres optionnels
      const filtres: any = {};
      
      if (req.query.employeId) {
        filtres.employeId = parseInt(req.query.employeId as string);
      }
      
      if (req.query.mois && req.query.annee) {
        filtres.mois = parseInt(req.query.mois as string);
        filtres.annee = parseInt(req.query.annee as string);
      }
      
      if (req.query.dateDebut) {
        filtres.dateDebut = new Date(req.query.dateDebut as string);
      }
      
      if (req.query.dateFin) {
        filtres.dateFin = new Date(req.query.dateFin as string);
      }

      const historique = await paiementJournalierService.obtenirHistoriquePaiementsJournaliers(
        user.entrepriseId,
        filtres
      );

      res.json({
        success: true,
        data: {
          paiements: historique,
          total: historique.length,
          filtres: filtres
        }
      });

    } catch (error) {
      console.error('Erreur historique paiements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement de l\'historique'
      });
    }
  }

  /**
   * Obtient le détail d'un calcul pour un employé journalier
   */
  async obtenirDetailCalcul(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // ADMIN et CAISSIER peuvent obtenir le détail des calculs
      if (!['ADMIN', 'CAISSIER'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour consulter les détails de calcul'
        });
      }

      const employeId = parseInt(req.params.employeId);
      const mois = req.query.mois ? parseInt(req.query.mois as string) : new Date().getMonth() + 1;
      const annee = req.query.annee ? parseInt(req.query.annee as string) : new Date().getFullYear();

      if (isNaN(employeId)) {
        return res.status(400).json({
          success: false,
          message: 'ID employé invalide'
        });
      }

      const detail = await paiementJournalierService.calculerPaiementJournalier(
        employeId,
        mois,
        annee
      );

      res.json({
        success: true,
        data: detail
      });

    } catch (error) {
      console.error('Erreur détail calcul:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du calcul'
      });
    }
  }
}

// Export des instances des méthodes pour les routes
const controller = new PaiementJournalierController();

export const calculerPaiement = controller.calculerPaiement.bind(controller);
export const enregistrerPaiement = controller.enregistrerPaiement.bind(controller);
export const listerEmployesJournaliers = controller.listerEmployesJournaliers.bind(controller);
export const obtenirHistorique = controller.obtenirHistorique.bind(controller);
export const obtenirDetailCalcul = controller.obtenirDetailCalcul.bind(controller);