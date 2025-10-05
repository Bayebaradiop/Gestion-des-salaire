import { Request, Response, NextFunction } from 'express';
import { AbsenceService } from '../services/absence.service.js';
import { calculSalaireService } from '../services/calculSalaire.service.js';

export class AbsenceController {
  private service: AbsenceService;

  constructor() {
    this.service = new AbsenceService();
  }

  async calculerAbsencesBulletin(req: Request, res: Response, next: NextFunction) {
    try {
      const { bulletinId } = req.params;
      
      console.log(`🎯 Calcul du bulletin ${bulletinId}`);
      
      await this.service.mettreAJourBulletinAvecAbsences(Number(bulletinId));
      
      res.json({ 
        message: 'Calcul terminé et bulletin mis à jour avec succès',
        bulletinId: Number(bulletinId)
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul du bulletin:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Taux journalier manquant')) {
          return res.status(400).json({ 
            message: error.message,
            code: 'TAUX_JOURNALIER_MANQUANT'
          });
        }
        if (error.message.includes('introuvable')) {
          return res.status(404).json({ 
            message: error.message,
            code: 'RESSOURCE_INTROUVABLE'
          });
        }
      }
      
      next(error);
    }
  }

  async calculerAbsencesCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycleId } = req.params;
      
      await this.service.mettreAJourCycleAvecAbsences(Number(cycleId));
      
      res.json({ 
        message: 'Absences calculées pour tous les bulletins du cycle',
        cycleId: Number(cycleId)
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenirAbsencesBulletin(req: Request, res: Response, next: NextFunction) {
    try {
      const { bulletinId } = req.params;
      
      // Récupérer le bulletin avec les informations d'absences
      const bulletin = await this.service['bulletinRepo'].obtenirParId(Number(bulletinId));
      
      if (!bulletin) {
        return res.status(404).json({ message: 'Bulletin introuvable' });
      }

      // Récupérer l'employé pour connaître son type de contrat
      const employe = await this.service['employeRepo'].trouverParId(bulletin.employeId);

      if (!employe) {
        return res.status(404).json({ message: 'Employé introuvable' });
      }

      // CORRECTION: Utiliser le nouveau service de calcul pour tous les types
      console.log(`🔄 Calcul des heures/salaire pour employé ${employe.prenom} ${employe.nom} (${employe.typeContrat})`);
      
      try {
        const calculs = await calculSalaireService.calculerSalaire(bulletin.employeId, bulletin.cyclePaieId);
        
        console.log('📊 Calculs obtenus:', {
          type: calculs.typeContrat,
          heures: calculs.heuresTravaillees,
          taux: calculs.tauxHoraire,
          montant: calculs.montantAPayer
        });

        // Adapter la réponse selon le type de contrat pour la compatibilité frontend
        if (employe.typeContrat === 'JOURNALIER') {
          const response = {
            nombreJoursTravailles: calculs.details.nombreJoursTravailles || 0,
            joursPresents: calculs.details.joursPresents || [],
            tauxJournalier: calculs.tauxHoraire * 8, // Reconvertir en taux journalier
            salaireBrut: calculs.salaireBrut,
            typeEmploye: 'JOURNALIER'
          };
          console.log('✅ Réponse journalier:', response);
          res.json(response);
        } else if (employe.typeContrat === 'HONORAIRE') {
          // CORRECTION: Maintenant avec les vraies heures travaillées !
          const response = {
            totalHeuresTravaillees: calculs.heuresTravaillees, // VRAIES heures depuis pointages
            tauxHoraire: calculs.tauxHoraire, // VRAI taux horaire
            salaireBrut: calculs.salaireBrut,
            salaireNet: calculs.salaireNet,
            joursPresents: calculs.details.joursPresents || [],
            typeEmploye: 'HONORAIRE'
          };
          console.log('✅ Réponse honoraire avec heures réelles:', response);
          res.json(response);
        } else {
          // Pour les FIXE
          const response = {
            nombreAbsences: (bulletin as any).nombreAbsences || 0,
            joursAbsences: (bulletin as any).joursAbsences ? JSON.parse((bulletin as any).joursAbsences) : [],
            montantDeduction: calculs.deductions || 0,
            salaireBrut: calculs.salaireBrut,
            typeEmploye: 'FIXE'
          };
          console.log('✅ Réponse fixe:', response);
          res.json(response);
        }
      } catch (calculError) {
        console.error('❌ Erreur lors du calcul:', calculError);
        
        // Fallback vers l'ancienne méthode si le nouveau calcul échoue
        if (employe.typeContrat === 'HONORAIRE') {
          const fallbackResponse = {
            totalHeuresTravaillees: 0,
            tauxHoraire: employe.tauxHoraire || 0,
            salaireBrut: bulletin.salaireBrut,
            salaireNet: bulletin.salaireNet,
            joursPresents: [],
            typeEmploye: 'HONORAIRE'
          };
          console.log('⚠️ Fallback honoraire:', fallbackResponse);
          res.json(fallbackResponse);
        } else {
          throw calculError; // Re-lancer l'erreur pour les autres types
        }
      }
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      next(error);
    }
  }
}