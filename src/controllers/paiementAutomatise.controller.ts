import { Request, Response } from 'express';
import { PaiementAutomatiseService } from '../services/paiementAutomatise.service';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schémas de validation
const calculerPaiementSchema = z.object({
  employeId: z.number().int().positive('ID employé invalide'),
  periode: z.string().regex(/^\d{4}-\d{2}$/, 'Format de période invalide (YYYY-MM)')
});

const marquerPayeSchema = z.object({
  montantPaye: z.number().positive('Le montant payé doit être positif'),
  methodePaiement: z.enum(['ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE', 'AUTRE']),
  notes: z.string().optional()
});

const validerPointagesSchema = z.object({
  employeId: z.number().int().positive('ID employé invalide'),
  periode: z.string().regex(/^\d{4}-\d{2}$/, 'Format de période invalide (YYYY-MM)')
});

export class PaiementAutomatiseController {
  private paiementAutomatiseService: PaiementAutomatiseService;

  constructor() {
    this.paiementAutomatiseService = new PaiementAutomatiseService();
  }

  /**
   * POST /api/paiements/calculer/:employeId
   * Calculer le montant dû pour un employé sur une période
   * RESTRICTION : Seuls les CAISSIER peuvent calculer les paiements
   * VALIDATION : Les pointages doivent être validés par un ADMIN
   */
  calculerPaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeId = parseInt(req.params.employeId);
      const { periode } = req.body;

      // Récupérer les infos du caissier connecté
      const utilisateur = (req as any).utilisateur;
      if (!utilisateur || utilisateur.role !== 'CAISSIER') {
        res.status(403).json({
          message: '🚫 Accès refusé : Seuls les CAISSIER peuvent calculer les paiements'
        });
        return;
      }

      // Validation des données
      const validationResult = calculerPaiementSchema.safeParse({
        employeId,
        periode
      });

      if (!validationResult.success) {
        res.status(400).json({
          message: 'Données invalides',
          erreurs: validationResult.error.issues
        });
        return;
      }

      const caissierInfo = {
        id: utilisateur.id,
        nom: `${utilisateur.prenom} ${utilisateur.nom}`
      };

      // Calculer le paiement avec vérification des pointages validés
      const resultat = await this.paiementAutomatiseService.calculerPaiement(
        employeId, 
        periode, 
        caissierInfo
      );

      res.status(200).json({
        message: '💰 Paiement calculé avec succès',
        employeId,
        periode,
        caissier: caissierInfo.nom,
        ...resultat,
        infoValidation: {
          message: `✅ Pointages validés par : ${resultat.validationInfo.adminValidateur}`,
          totalPointages: resultat.validationInfo.totalPointages
        }
      });

    } catch (error: any) {
      console.error('Erreur lors du calcul du paiement:', error);
      
      if (error.message.includes('PAIEMENT BLOQUÉ')) {
        res.status(400).json({
          message: error.message,
          type: 'POINTAGES_NON_VALIDES'
        });
      } else {
        res.status(500).json({
          message: 'Erreur lors du calcul du paiement',
          erreur: error.message
        });
      }
    }
  };

  /**
   * POST /api/paiements/enregistrer/:employeId
   * Enregistrer un paiement automatisé après calcul
   * RESTRICTION : Seuls les CAISSIER peuvent enregistrer les paiements
   */
  enregistrerPaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeId = parseInt(req.params.employeId);
      const { periode } = req.body;

      // Vérifier le rôle
      const utilisateur = (req as any).utilisateur;
      if (!utilisateur || utilisateur.role !== 'CAISSIER') {
        res.status(403).json({
          message: '🚫 Accès refusé : Seuls les CAISSIER peuvent enregistrer les paiements'
        });
        return;
      }

      // Validation des données
      const validationResult = calculerPaiementSchema.safeParse({
        employeId,
        periode
      });

      if (!validationResult.success) {
        res.status(400).json({
          message: 'Données invalides',
          erreurs: validationResult.error.issues
        });
        return;
      }

      const caissierInfo = {
        id: utilisateur.id,
        nom: `${utilisateur.prenom} ${utilisateur.nom}`
      };

      // Enregistrer le paiement
      const paiement = await this.paiementAutomatiseService.enregistrerPaiement(
        employeId, 
        periode, 
        caissierInfo
      );

      res.status(201).json({
        message: '✅ Paiement enregistré avec succès',
        paiement,
        caissier: caissierInfo.nom
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      
      if (error.message.includes('existe déjà')) {
        res.status(409).json({
          message: error.message
        });
      } else if (error.message.includes('PAIEMENT BLOQUÉ')) {
        res.status(400).json({
          message: error.message,
          type: 'POINTAGES_NON_VALIDES'
        });
      } else {
        res.status(500).json({
          message: 'Erreur lors de l\'enregistrement du paiement',
          erreur: error.message
        });
      }
    }
  };

  /**
   * GET /api/entreprises/:entrepriseId/paiements-automatises
   * Récupérer les paiements automatisés d'une entreprise avec traçabilité
   */
  obtenirPaiementsEntreprise = async (req: Request, res: Response): Promise<void> => {
    try {
      const entrepriseId = parseInt(req.params.entrepriseId);
      const periode = req.query.periode as string;

      if (isNaN(entrepriseId)) {
        res.status(400).json({
          message: 'ID entreprise invalide'
        });
        return;
      }

      const paiements = await this.paiementAutomatiseService.obtenirPaiementsEntreprise(
        entrepriseId, 
        periode
      );

      // Enrichir les données avec les informations de traçabilité
      const paiementsEnrichis = paiements.map((paiement: any) => ({
        ...paiement,
        tracabilite: {
          calculeParCaissier: paiement.calculePar ? 
            `${paiement.calculePar.prenom} ${paiement.calculePar.nom}` : null,
          payeParCaissier: paiement.payePar ? 
            `${paiement.payePar.prenom} ${paiement.payePar.nom}` : null
        }
      }));

      res.status(200).json({
        message: 'Paiements récupérés avec succès',
        paiements: paiementsEnrichis,
        total: paiements.length,
        periode: periode || 'Toutes les périodes'
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération des paiements:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des paiements',
        erreur: error.message
      });
    }
  };

  /**
   * GET /api/paiements/:paiementId
   * Récupérer les détails d'un paiement automatisé
   */
  obtenirDetailsPaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const paiementId = parseInt(req.params.paiementId);

      if (isNaN(paiementId)) {
        res.status(400).json({
          message: 'ID paiement invalide'
        });
        return;
      }

      // Utilisation temporaire d'une requête SQL brute en attendant la correction du client Prisma
      const paiementQuery = await prisma.$queryRaw`
        SELECT 
          pa.*,
          e.prenom as employe_prenom, e.nom as employe_nom, e.poste, e.typeContrat,
          u1.prenom as calculePar_prenom, u1.nom as calculePar_nom, u1.role as calculePar_role,
          u2.prenom as payePar_prenom, u2.nom as payePar_nom, u2.role as payePar_role
        FROM paiements_automatises pa
        LEFT JOIN employes e ON pa.employeId = e.id
        LEFT JOIN utilisateurs u1 ON pa.calculeParId = u1.id  
        LEFT JOIN utilisateurs u2 ON pa.payeParId = u2.id
        WHERE pa.id = ${paiementId}
      `;
      
      const paiement = Array.isArray(paiementQuery) && paiementQuery.length > 0 ? paiementQuery[0] : null;

      if (!paiement) {
        res.status(404).json({
          message: 'Paiement non trouvé'
        });
        return;
      }

      res.status(200).json({
        message: 'Détails du paiement récupérés',
        paiement: {
          ...(paiement as any),
          employe: {
            prenom: (paiement as any).employe_prenom,
            nom: (paiement as any).employe_nom,
            poste: (paiement as any).poste,
            typeContrat: (paiement as any).typeContrat
          },
          tracabilite: {
            calculeParCaissier: (paiement as any).calculePar_prenom ? 
              `${(paiement as any).calculePar_prenom} ${(paiement as any).calculePar_nom}` : null,
            payeParCaissier: (paiement as any).payePar_prenom ? 
              `${(paiement as any).payePar_prenom} ${(paiement as any).payePar_nom}` : null
          }
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération du paiement:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération du paiement',
        erreur: error.message
      });
    }
  };

  /**
   * PUT /api/paiements/:paiementId/marquer-paye
   * Marquer un paiement comme payé
   * RESTRICTION : Seuls les CAISSIER peuvent marquer comme payé
   */
  marquerCommePaye = async (req: Request, res: Response): Promise<void> => {
    try {
      const paiementId = parseInt(req.params.paiementId);
      const { montantPaye, methodePaiement, notes } = req.body;

      // Vérifier le rôle
      const utilisateur = (req as any).utilisateur;
      if (!utilisateur || utilisateur.role !== 'CAISSIER') {
        res.status(403).json({
          message: '🚫 Accès refusé : Seuls les CAISSIER peuvent marquer les paiements comme payés'
        });
        return;
      }

      // Validation
      if (isNaN(paiementId)) {
        res.status(400).json({
          message: 'ID paiement invalide'
        });
        return;
      }

      const validationResult = marquerPayeSchema.safeParse({
        montantPaye,
        methodePaiement,
        notes
      });

      if (!validationResult.success) {
        res.status(400).json({
          message: 'Données invalides',
          erreurs: validationResult.error.issues
        });
        return;
      }

      const caissierInfo = {
        id: utilisateur.id,
        nom: `${utilisateur.prenom} ${utilisateur.nom}`
      };

      // Marquer comme payé
      const paiement = await this.paiementAutomatiseService.marquerCommePaye(
        paiementId,
        montantPaye,
        methodePaiement,
        caissierInfo,
        notes
      );

      res.status(200).json({
        message: '💰 Paiement marqué comme payé avec succès',
        paiement,
        payeParCaissier: caissierInfo.nom
      });

    } catch (error: any) {
      console.error('Erreur lors du marquage du paiement:', error);
      
      if (error.message.includes('non trouvé')) {
        res.status(404).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur lors du marquage du paiement',
          erreur: error.message
        });
      }
    }
  };

  /**
   * POST /api/admin/pointages/valider
   * Valider les pointages d'une période par un admin
   * RESTRICTION : Seuls les ADMIN peuvent valider les pointages
   */
  validerPointagesPeriode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeId, periode } = req.body;

      // Vérifier le rôle ADMIN
      const utilisateur = (req as any).utilisateur;
      if (!utilisateur || utilisateur.role !== 'ADMIN') {
        res.status(403).json({
          message: '🚫 Accès refusé : Seuls les ADMIN peuvent valider les pointages'
        });
        return;
      }

      // Validation des données
      const validationResult = validerPointagesSchema.safeParse({
        employeId,
        periode
      });

      if (!validationResult.success) {
        res.status(400).json({
          message: 'Données invalides',
          erreurs: validationResult.error.issues
        });
        return;
      }

      const adminInfo = {
        id: utilisateur.id,
        nom: `${utilisateur.prenom} ${utilisateur.nom}`
      };

      // Valider les pointages
      const resultat = await this.paiementAutomatiseService.validerPointagesPeriode(
        employeId,
        periode,
        adminInfo
      );

      res.status(200).json({
        message: `✅ Validation effectuée avec succès : ${resultat.message}`,
        pointagesValides: resultat.pointagesValides,
        adminValidateur: adminInfo.nom,
        periode
      });

    } catch (error: any) {
      console.error('Erreur lors de la validation des pointages:', error);
      res.status(500).json({
        message: 'Erreur lors de la validation des pointages',
        erreur: error.message
      });
    }
  };

  /**
   * GET /api/pointages/validation-status/:employeId/:periode
   * Vérifier le statut de validation des pointages d'une période
   */
  verifierValidationPointages = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeId = parseInt(req.params.employeId);
      const periode = req.params.periode;

      if (isNaN(employeId)) {
        res.status(400).json({
          message: 'ID employé invalide'
        });
        return;
      }

      const validationInfo = await this.paiementAutomatiseService.verifierValidationPointages(
        employeId,
        periode
      );

      res.status(200).json({
        message: 'Statut de validation récupéré',
        employeId,
        periode,
        ...validationInfo,
        peutCalculerPaiement: validationInfo.estValide
      });

    } catch (error: any) {
      console.error('Erreur lors de la vérification de validation:', error);
      res.status(500).json({
        message: 'Erreur lors de la vérification de validation',
        erreur: error.message
      });
    }
  };
}