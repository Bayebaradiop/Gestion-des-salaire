import { Request, Response, NextFunction } from 'express';
import { PointageService } from '../services/pointage.service.js';
import { PDFService } from '../services/pdf.service.js';
import { PrismaClient } from '@prisma/client';

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
}
