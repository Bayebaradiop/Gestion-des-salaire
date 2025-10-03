import { BaseRepository } from './base.repository.js';
import type { StatutPointage } from '@prisma/client';

export interface PointageFiltre {
  du?: Date;
  au?: Date;
  employeId?: number;
  statut?: StatutPointage;
}

export interface ClockInData {
  entrepriseId: number;
  employeId: number;
  date: Date; // Jour normalisé (00:00)
  heureArrivee: Date; // Timestamp réel d'arrivée
  statut?: StatutPointage; // défaut: PRESENT
  notes?: string;
}

export interface ClockOutData {
  employeId: number;
  date: Date; // Jour normalisé (00:00)
  heureDepart: Date; // Timestamp réel de départ
  dureeMinutes?: number; // Calculée au niveau service, puis persistée
  statut?: StatutPointage; // Optionnel
  notes?: string; // Optionnel
}

export interface CreerAbsenceData {
  entrepriseId: number;
  employeId: number;
  date: Date; // Jour normalisé (00:00)
  statut: StatutPointage; // ABSENT, CONGE, MALADIE, etc.
  notes?: string;
  marqueAutomatiquement?: boolean;
}

export class PointageRepository extends BaseRepository {
  async trouverParId(id: number) {
    return this.prisma.pointage.findUnique({
      where: { id },
      include: {
        employe: true,
        entreprise: true,
      }
    });
  }

  async trouverParEmployeEtDate(employeId: number, date: Date) {
    return this.prisma.pointage.findUnique({
      where: {
        employeId_date: {
          employeId,
          date,
        }
      },
      include: {
        employe: true,
        entreprise: true,
      }
    });
  }

  async clockIn(data: ClockInData) {
    return this.prisma.pointage.create({
      data: {
        entrepriseId: data.entrepriseId,
        employeId: data.employeId,
        date: data.date,
        heureArrivee: data.heureArrivee,
        statut: data.statut ?? 'PRESENT',
        notes: data.notes,
      }
    });
  }

  async clockOut(data: ClockOutData) {
    return this.prisma.pointage.update({
      where: {
        employeId_date: {
          employeId: data.employeId,
          date: data.date,
        }
      },
      data: {
        heureDepart: data.heureDepart,
        dureeMinutes: typeof data.dureeMinutes === 'number' ? data.dureeMinutes : undefined,
        statut: data.statut,
        notes: data.notes,
      }
    });
  }

  async listerParEntreprise(entrepriseId: number, filtre: PointageFiltre = {}) {
    const where: any = { entrepriseId };

    if (filtre.employeId) where.employeId = filtre.employeId;
    if (filtre.statut) where.statut = filtre.statut;
    if (filtre.du || filtre.au) {
      where.date = {};
      if (filtre.du) where.date.gte = filtre.du;
      if (filtre.au) where.date.lte = filtre.au;
    }

    return this.prisma.pointage.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { employeId: 'asc' },
      ],
      include: {
        employe: true,
      }
    });
  }

  async listerPourExport(entrepriseId: number, du: Date, au: Date) {
    return this.prisma.pointage.findMany({
      where: {
        entrepriseId,
        date: {
          gte: du,
          lte: au,
        }
      },
      orderBy: [
        { date: 'asc' },
        { employeId: 'asc' },
      ],
      include: {
        employe: true,
      }
    });
  }

  async creerAbsence(data: CreerAbsenceData) {
    return this.prisma.pointage.create({
      data: {
        entrepriseId: data.entrepriseId,
        employeId: data.employeId,
        date: data.date,
        statut: data.statut,
        notes: data.notes,
        heureArrivee: null, // Pas d'arrivée pour une absence
        heureDepart: null,  // Pas de départ pour une absence
        dureeMinutes: 0,    // 0 minute travaillée
      }
    });
  }

  async supprimer(id: number) {
    await this.prisma.pointage.delete({ where: { id } });
  }
}
