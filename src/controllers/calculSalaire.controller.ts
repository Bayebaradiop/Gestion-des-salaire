import { Request, Response, NextFunction } from 'express';
import { calculSalaireService } from '../services/calculSalaire.service.js';

export class CalculSalaireController {

  /**
   * Calcule le salaire d'un employé pour un cycle de paie
   * GET /api/employes/:employeId/cycles/:cyclePaieId/calculer-salaire
   */
  async calculerSalaire(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeId, cyclePaieId } = req.params;

      const calculs = await calculSalaireService.calculerSalaire(
        Number(employeId),
        Number(cyclePaieId)
      );

      res.json({
        success: true,
        message: 'Salaire calculé avec succès',
        data: calculs
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul du salaire:', error);
      next(error);
    }
  }

  /**
   * Calcule et met à jour le bulletin de paie
   * POST /api/bulletins/:bulletinId/calculer-et-mettre-a-jour
   */
  async calculerEtMettreAJour(req: Request, res: Response, next: NextFunction) {
    try {
      const { bulletinId } = req.params;

      // Récupérer le bulletin pour obtenir l'employé et le cycle
      const bulletinRepo = (calculSalaireService as any).bulletinRepo;
      const bulletin = await bulletinRepo.trouverParId(Number(bulletinId));
      if (!bulletin) {
        return res.status(404).json({
          success: false,
          message: 'Bulletin de paie introuvable'
        });
      }

      // Calculer le salaire
      const calculs = await calculSalaireService.calculerSalaire(
        bulletin.employeId,
        bulletin.cyclePaieId
      );

      // Mettre à jour le bulletin
      const bulletinMisAJour = await calculSalaireService.mettreAJourBulletinAvecCalculs(
        Number(bulletinId),
        calculs
      );

      res.json({
        success: true,
        message: 'Bulletin de paie calculé et mis à jour avec succès',
        data: {
          bulletin: bulletinMisAJour,
          calculs
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul et mise à jour du bulletin:', error);
      next(error);
    }
  }

  /**
   * Obtient les détails de calcul pour un bulletin spécifique
   * GET /api/bulletins/:bulletinId/details-calcul
   */
  async obtenirDetailsCalcul(req: Request, res: Response, next: NextFunction) {
    try {
      const { bulletinId } = req.params;

      // Récupérer le bulletin pour obtenir l'employé et le cycle
      const bulletinRepo = (calculSalaireService as any).bulletinRepo;
      const bulletin = await bulletinRepo.trouverParId(Number(bulletinId));
      if (!bulletin) {
        return res.status(404).json({
          success: false,
          message: 'Bulletin de paie introuvable'
        });
      }

      // Calculer les détails sans mettre à jour
      const calculs = await calculSalaireService.calculerSalaire(
        bulletin.employeId,
        bulletin.cyclePaieId
      );

      // Enrichir avec les données du bulletin existant
      const response = {
        bulletin: {
          id: bulletin.id,
          numeroBulletin: bulletin.numeroBulletin,
          statut: bulletin.statut,
          employe: bulletin.employe,
          cyclePaie: bulletin.cyclePaie
        },
        calculs,
        // Comparaison avec les valeurs stockées
        comparaison: {
          salaireBrutStocke: bulletin.salaireBrut,
          salaireBrutCalcule: calculs.salaireBrut,
          salaireNetStocke: bulletin.salaireNet,
          salaireNetCalcule: calculs.salaireNet,
          tauxHoraireStocke: (bulletin as any).tauxHoraire || 0,
          tauxHoraireCalcule: calculs.tauxHoraire,
          heuresStockees: (bulletin as any).totalHeuresTravaillees || 0,
          heuresCalculees: calculs.heuresTravaillees
        }
      };

      res.json({
        success: true,
        message: 'Détails de calcul obtenus avec succès',
        data: response
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention des détails de calcul:', error);
      next(error);
    }
  }

  /**
   * Recalcule tous les bulletins d'un cycle de paie
   * POST /api/cycles/:cyclePaieId/recalculer-bulletins
   */
  async recalculerTousLesBulletins(req: Request, res: Response, next: NextFunction) {
    try {
      const { cyclePaieId } = req.params;

      // Récupérer tous les bulletins du cycle
      const bulletinRepo = (calculSalaireService as any).bulletinRepo;
      const bulletins = await bulletinRepo.listerParCycle(Number(cyclePaieId));

      const resultats = [];
      let succes = 0;
      let erreurs = 0;

      for (const bulletin of bulletins) {
        try {
          // Calculer le salaire
          const calculs = await calculSalaireService.calculerSalaire(
            bulletin.employeId,
            bulletin.cyclePaieId
          );

          // Mettre à jour le bulletin
          const bulletinMisAJour = await calculSalaireService.mettreAJourBulletinAvecCalculs(
            bulletin.id,
            calculs
          );

          resultats.push({
            bulletinId: bulletin.id,
            employe: `${bulletin.employe.prenom} ${bulletin.employe.nom}`,
            typeContrat: bulletin.employe.typeContrat,
            success: true,
            heuresCalculees: calculs.heuresTravaillees,
            montantCalcule: calculs.montantAPayer
          });

          succes++;
        } catch (error) {
          console.error(`❌ Erreur pour le bulletin ${bulletin.id}:`, error);
          
          resultats.push({
            bulletinId: bulletin.id,
            employe: `${bulletin.employe.prenom} ${bulletin.employe.nom}`,
            typeContrat: bulletin.employe.typeContrat,
            success: false,
            erreur: error instanceof Error ? error.message : 'Erreur inconnue'
          });

          erreurs++;
        }
      }

      res.json({
        success: true,
        message: `Recalcul terminé: ${succes} succès, ${erreurs} erreurs`,
        data: {
          totalBulletins: bulletins.length,
          succes,
          erreurs,
          resultats
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors du recalcul des bulletins:', error);
      next(error);
    }
  }

  /**
   * Obtient un résumé des heures travaillées pour un employé sur une période
   * GET /api/employes/:employeId/resume-heures?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD
   */
  async obtenirResumeHeures(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeId } = req.params;
      const { dateDebut, dateFin } = req.query;

      if (!dateDebut || !dateFin) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres dateDebut et dateFin requis'
        });
      }

      // Utiliser la méthode privée via une instance temporaire
      const service = calculSalaireService as any;
      const resume = await service.calculerHeuresTravailleesDepuisPointages(
        Number(employeId),
        new Date(dateDebut as string),
        new Date(dateFin as string)
      );

      res.json({
        success: true,
        message: 'Résumé des heures obtenu avec succès',
        data: {
          periode: {
            dateDebut: dateDebut as string,
            dateFin: dateFin as string
          },
          ...resume
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention du résumé des heures:', error);
      next(error);
    }
  }
}