import { Request, Response, NextFunction } from 'express';
import { PointageService } from '../services/pointage.service.js';
import { PDFService } from '../services/pdf.service.js';
import { PrismaClient, StatutPointage } from '@prisma/client';

const prisma = new PrismaClient();

export class PointageController {
  private service: PointageService;

  constructor() {
    this.service = new PointageService();
  }

  async arriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId, employeId, notes, date } = req.body;
      const result = await this.service.arriver({ entrepriseId: Number(entrepriseId), employeId: Number(employeId), notes, date });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async depart(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId, employeId, notes, date } = req.body;
      const result = await this.service.depart({ entrepriseId: Number(entrepriseId), employeId: Number(employeId), notes, date });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async creerAbsence(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId, employeId, date, statut, notes, marqueAutomatiquement } = req.body;
      const result = await this.service.creerAbsence({
        entrepriseId: Number(entrepriseId),
        employeId: Number(employeId),
        date,
        statut: (statut as StatutPointage) || ('ABSENT' as StatutPointage),
        notes,
        marqueAutomatiquement: marqueAutomatiquement || false
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async lister(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const { du, au, employeId, statut } = req.query;
      const result = await this.service.lister(Number(entrepriseId), {
        du: du as string,
        au: au as string,
        employeId: employeId ? Number(employeId) : undefined,
        statut: statut as string
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async exporter(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const { du, au } = req.query as { du: string; au: string };

      if (!du || !au) {
        return res.status(400).json({ message: 'Paramètres du et au requis' });
      }

      const [entreprise, pointages] = await Promise.all([
        prisma.entreprise.findUnique({ where: { id: Number(entrepriseId) } }),
        this.service.exporter(Number(entrepriseId), du, au)
      ]);

      if (!entreprise) {
        return res.status(404).json({ message: "Entreprise introuvable" });
      }

      const buffer = await PDFService.genererRapportPointages(pointages, entreprise, du, au);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rapport-pointages_${du}_${au}.pdf`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async calculerAbsences(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const { employeId, du, au } = req.query;

      if (!employeId || !du || !au) {
        return res.status(400).json({ 
          message: 'Paramètres employeId, du et au requis' 
        });
      }

      const result = await this.service.calculerAbsences(
        Number(entrepriseId),
        Number(employeId),
        du as string,
        au as string
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Met à jour un pointage avec recalcul automatique de la durée
   */
  async mettreAJour(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { heureArrivee, heureDepart, statut, notes, dureeMinutes } = req.body;

      const result = await this.service.mettreAJourPointage(Number(id), {
        heureArrivee: heureArrivee ? new Date(heureArrivee) : undefined,
        heureDepart: heureDepart ? new Date(heureDepart) : undefined,
        statut: statut as StatutPointage,
        notes,
        dureeMinutes: dureeMinutes !== undefined ? Number(dureeMinutes) : undefined
      });

      res.json({
        message: 'Pointage mis à jour avec succès',
        pointage: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recalcule la durée d'un pointage spécifique
   */
  async recalculerDuree(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.recalculerDuree(Number(id));

      res.json({
        message: 'Durée recalculée avec succès',
        pointage: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recalcule toutes les durées manquantes pour une entreprise
   */
  async recalculerToutesLesDurees(req: Request, res: Response, next: NextFunction) {
    try {
      const { entrepriseId } = req.params;
      const nombreMisAJour = await this.service.recalculerToutesLesDurees(Number(entrepriseId));

      res.json({
        message: `${nombreMisAJour} pointages mis à jour avec succès`,
        nombreMisAJour
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtient les statistiques de pointage pour un employé
   */
  async obtenirStatistiques(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeId } = req.params;
      const { dateDebut, dateFin } = req.query;

      if (!dateDebut || !dateFin) {
        return res.status(400).json({
          message: 'Paramètres dateDebut et dateFin requis'
        });
      }

      const result = await this.service.obtenirStatistiquesPointage(
        Number(employeId),
        new Date(dateDebut as string),
        new Date(dateFin as string)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
