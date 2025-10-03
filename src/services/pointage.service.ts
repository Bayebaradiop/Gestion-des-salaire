import { PointageRepository } from '../repositories/pointage.repository.js';

function normalizeDateToMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class PointageService {
  private repo: PointageRepository;

  constructor() {
    this.repo = new PointageRepository();
  }

  async arriver(payload: { entrepriseId: number; employeId: number; notes?: string; date?: string }) {
    const now = new Date();
    const jour = payload.date ? new Date(payload.date) : now;
    const dateNormalisee = normalizeDateToMidnight(jour);

    // Vérifier s'il existe déjà un pointage pour cet employé à la date
    const existant = await this.repo.trouverParEmployeEtDate(payload.employeId, dateNormalisee);
    if (existant) {
      // Un pointage existe déjà pour cette date → on empêche une seconde arrivée
      throw new Error('Arrivée déjà enregistrée pour cette date');
    }

    const res = await this.repo.clockIn({
      entrepriseId: payload.entrepriseId,
      employeId: payload.employeId,
      date: dateNormalisee,
      heureArrivee: now,
      notes: payload.notes,
    });

    return res;
  }

  async depart(payload: { entrepriseId: number; employeId: number; notes?: string; date?: string }) {
    const now = new Date();
    const jour = payload.date ? new Date(payload.date) : now;
    const dateNormalisee = normalizeDateToMidnight(jour);

    const existant = await this.repo.trouverParEmployeEtDate(payload.employeId, dateNormalisee);
    if (!existant || !existant.heureArrivee) {
      throw new Error("Aucune arrivée enregistrée pour cette date");
    }

    const dureeMinutes = Math.max(0, Math.round((now.getTime() - new Date(existant.heureArrivee).getTime()) / 60000));

    const res = await this.repo.clockOut({
      employeId: payload.employeId,
      date: dateNormalisee,
      heureDepart: now,
      dureeMinutes,
      notes: payload.notes,
    });

    return res;
  }

  async creerAbsence(payload: { 
    entrepriseId: number; 
    employeId: number; 
    date: string; 
    statut?: string; 
    notes?: string; 
    marqueAutomatiquement?: boolean 
  }) {
    const datePointage = new Date(payload.date);
    const dateNormalisee = normalizeDateToMidnight(datePointage);

    // Vérifier s'il existe déjà un pointage pour cet employé à cette date
    const existant = await this.repo.trouverParEmployeEtDate(payload.employeId, dateNormalisee);
    if (existant) {
      throw new Error('Un pointage existe déjà pour cette date');
    }

    // Créer le pointage d'absence
    const res = await this.repo.creerAbsence({
      entrepriseId: payload.entrepriseId,
      employeId: payload.employeId,
      date: dateNormalisee,
      statut: payload.statut || 'ABSENT',
      notes: payload.notes,
      marqueAutomatiquement: payload.marqueAutomatiquement || false
    });

    return res;
  }

  async lister(entrepriseId: number, filters: { du?: string; au?: string; employeId?: number; statut?: string }) {
    const filtre: any = {};
    if (filters.employeId) filtre.employeId = filters.employeId;
    if (filters.statut) filtre.statut = filters.statut;
    if (filters.du) filtre.du = new Date(filters.du);
    if (filters.au) filtre.au = new Date(filters.au);
    return this.repo.listerParEntreprise(entrepriseId, filtre);
  }

  async exporter(entrepriseId: number, du: string, au: string) {
    const duDate = new Date(du);
    const auDate = new Date(au);
    const data = await this.repo.listerPourExport(entrepriseId, duDate, auDate);
    return data;
  }
}
