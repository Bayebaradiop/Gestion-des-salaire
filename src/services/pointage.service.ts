import { PointageRepository } from '../repositories/pointage.repository.js';
import type { StatutPointage } from '@prisma/client';

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

  /**
   * Calcule la durée en minutes entre l'heure d'arrivée et l'heure de départ
   * @param heureArrivee Heure d'arrivée
   * @param heureDepart Heure de départ
   * @returns Durée en minutes ou null si calcul impossible
   */
  private calculerDureeMinutes(heureArrivee?: Date | null, heureDepart?: Date | null): number | null {
    // Si l'une des heures manque, on ne peut pas calculer
    if (!heureArrivee || !heureDepart) {
      return null;
    }

    // Validation : l'heure de départ doit être après l'heure d'arrivée
    if (heureDepart <= heureArrivee) {
      console.warn('⚠️ Heure de départ antérieure ou égale à l\'heure d\'arrivée', {
        heureArrivee: heureArrivee.toISOString(),
        heureDepart: heureDepart.toISOString()
      });
      return null;
    }

    // Calcul de la différence en minutes
    const diffEnMs = heureDepart.getTime() - heureArrivee.getTime();
    const diffEnMinutes = Math.floor(diffEnMs / (1000 * 60));

    // Sécurité : pas de durées négatives ou excessives (plus de 24h = 1440 minutes)
    if (diffEnMinutes < 0 || diffEnMinutes > 1440) {
      console.warn('⚠️ Durée calculée invalide', {
        dureeMinutes: diffEnMinutes,
        heureArrivee: heureArrivee.toISOString(),
        heureDepart: heureDepart.toISOString()
      });
      return null;
    }

    return diffEnMinutes;
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

    // Calcul automatique de la durée avec validation
    const dureeCalculee = this.calculerDureeMinutes(new Date(existant.heureArrivee), now);
    const dureeMinutes = dureeCalculee || 0; // Fallback à 0 si calcul impossible

    const res = await this.repo.clockOut({
      employeId: payload.employeId,
      date: dateNormalisee,
      heureDepart: now,
      dureeMinutes,
      notes: payload.notes,
    });

    console.log('✅ Départ enregistré avec durée calculée', {
      employeId: payload.employeId,
      date: dateNormalisee.toISOString().split('T')[0],
      heureArrivee: existant.heureArrivee,
      heureDepart: now,
      dureeMinutes
    });

    return res;
  }

  async creerAbsence(payload: { 
    entrepriseId: number; 
    employeId: number; 
    date: string; 
    statut?: StatutPointage; 
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
      statut: payload.statut || ('ABSENT' as StatutPointage),
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

  async calculerAbsences(entrepriseId: number, employeId: number, du: string, au: string) {
    const duDate = new Date(du);
    const auDate = new Date(au);
    
    // Récupérer tous les pointages de l'employé pour la période
    const pointages = await this.repo.listerParEmployeEtPeriode(employeId, duDate, auDate);
    
    // Calculer les jours ouvrables dans la période (en excluant les weekends)
    const joursOuvrables = [];
    const joursAbsents = [];
    
    const date = new Date(duDate);
    while (date <= auDate) {
      const dayOfWeek = date.getDay();
      // Exclure samedi (6) et dimanche (0) 
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        joursOuvrables.push(dateStr);
        
        // Vérifier si l'employé était présent ou absent ce jour
        const pointageJour = pointages.find((p: any) => {
          const pointageDate = new Date(p.date).toISOString().split('T')[0];
          return pointageDate === dateStr;
        });
        
        if (!pointageJour || pointageJour.statut === 'ABSENT') {
          joursAbsents.push(dateStr);
        }
      }
      date.setDate(date.getDate() + 1);
    }
    
    return {
      nombreAbsences: joursAbsents.length,
      joursAbsents,
      nombreJoursOuvrables: joursOuvrables.length,
      joursOuvrables
    };
  }

  /**
   * Met à jour un pointage avec recalcul automatique de la durée si nécessaire
   * @param id ID du pointage à mettre à jour
   * @param data Données à mettre à jour
   * @returns Pointage mis à jour
   */
  async mettreAJourPointage(id: number, data: { 
    heureArrivee?: Date; 
    heureDepart?: Date; 
    statut?: StatutPointage; 
    notes?: string;
    dureeMinutes?: number; // Optionnel : si fourni, ne pas recalculer
  }) {
    try {
      // Récupérer le pointage existant
      const pointageExistant = await this.repo.trouverParId(id);
      if (!pointageExistant) {
        throw new Error(`Pointage avec l'ID ${id} introuvable`);
      }

      // Combiner les données existantes avec les nouvelles
      const heureArrivee = data.heureArrivee ?? pointageExistant.heureArrivee;
      const heureDepart = data.heureDepart ?? pointageExistant.heureDepart;

      // Calcul automatique de la durée si non fournie explicitement
      let dureeMinutes: number | null = data.dureeMinutes ?? null;
      if (dureeMinutes === null && (data.heureArrivee || data.heureDepart)) {
        // Recalculer la durée seulement si on modifie les heures
        const nouvelleDate = heureArrivee ? new Date(heureArrivee) : null;
        const nouvelleDepart = heureDepart ? new Date(heureDepart) : null;
        dureeMinutes = this.calculerDureeMinutes(nouvelleDate, nouvelleDepart);
      } else if (dureeMinutes === null && data.dureeMinutes === undefined) {
        // Garder l'ancienne durée
        dureeMinutes = pointageExistant.dureeMinutes;
      }

      // Mettre à jour le pointage
      const pointageMisAJour = await this.repo.mettreAJour(id, {
        heureArrivee: heureArrivee ? new Date(heureArrivee) : heureArrivee,
        heureDepart: heureDepart ? new Date(heureDepart) : heureDepart,
        dureeMinutes,
        statut: data.statut,
        notes: data.notes
      });

      console.log('✅ Pointage mis à jour avec succès', {
        id: pointageMisAJour.id,
        ancienneDuree: pointageExistant.dureeMinutes,
        nouvelleDuree: pointageMisAJour.dureeMinutes
      });

      return pointageMisAJour;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du pointage:', error);
      throw error;
    }
  }

  /**
   * Recalcule et met à jour la durée pour un pointage spécifique
   * @param id ID du pointage
   * @returns Pointage avec durée recalculée
   */
  async recalculerDuree(id: number) {
    try {
      const pointage = await this.repo.trouverParId(id);
      if (!pointage) {
        throw new Error(`Pointage avec l'ID ${id} introuvable`);
      }

      const nouvelleDuree = this.calculerDureeMinutes(
        pointage.heureArrivee ? new Date(pointage.heureArrivee) : null,
        pointage.heureDepart ? new Date(pointage.heureDepart) : null
      );

      const pointageMisAJour = await this.repo.mettreAJour(id, {
        dureeMinutes: nouvelleDuree
      });

      console.log('✅ Durée recalculée', {
        id: pointageMisAJour.id,
        ancienneDuree: pointage.dureeMinutes,
        nouvelleDuree: pointageMisAJour.dureeMinutes
      });

      return pointageMisAJour;
    } catch (error) {
      console.error('❌ Erreur lors du recalcul de la durée:', error);
      throw error;
    }
  }

  /**
   * Recalcule les durées pour tous les pointages ayant des heures mais pas de durée
   * @param entrepriseId ID de l'entreprise (optionnel)
   * @returns Nombre de pointages mis à jour
   */
  async recalculerToutesLesDurees(entrepriseId?: number): Promise<number> {
    try {
      // Utiliser le repository pour obtenir les pointages sans durée
      const pointagesSansDuree = await this.repo.trouverSansDuree(entrepriseId);
      
      console.log(`🔄 ${pointagesSansDuree.length} pointages à recalculer`);

      let nombreMisAJour = 0;

      // Traiter chaque pointage
      for (const pointage of pointagesSansDuree) {
        const dureeCalculee = this.calculerDureeMinutes(
          pointage.heureArrivee ? new Date(pointage.heureArrivee) : null,
          pointage.heureDepart ? new Date(pointage.heureDepart) : null
        );

        if (dureeCalculee !== null) {
          await this.repo.mettreAJour(pointage.id, {
            dureeMinutes: dureeCalculee
          });
          nombreMisAJour++;
        }
      }

      console.log(`✅ ${nombreMisAJour} pointages mis à jour avec leur durée`);
      return nombreMisAJour;
    } catch (error) {
      console.error('❌ Erreur lors du recalcul en masse:', error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques de pointage pour un employé sur une période
   * @param employeId ID de l'employé
   * @param dateDebut Date de début
   * @param dateFin Date de fin
   * @returns Statistiques de pointage
   */
  async obtenirStatistiquesPointage(employeId: number, dateDebut: Date, dateFin: Date) {
    try {
      const pointages = await this.repo.listerParEmployeEtPeriode(employeId, dateDebut, dateFin);

      const totalJours = pointages.length;
      const joursPresents = pointages.filter((p: any) => p.statut === 'PRESENT').length;
      const joursAbsents = pointages.filter((p: any) => p.statut === 'ABSENT').length;
      const totalMinutes = pointages
        .filter((p: any) => p.dureeMinutes !== null)
        .reduce((sum: number, p: any) => sum + (p.dureeMinutes || 0), 0);
      const totalHeures = Math.round((totalMinutes / 60) * 100) / 100;

      return {
        periode: {
          debut: dateDebut.toISOString().split('T')[0],
          fin: dateFin.toISOString().split('T')[0]
        },
        totalJours,
        joursPresents,
        joursAbsents,
        totalMinutes,
        totalHeures,
        moyenneMinutesParJour: joursPresents > 0 ? Math.round(totalMinutes / joursPresents) : 0,
        moyenneHeuresParJour: joursPresents > 0 ? Math.round((totalHeures / joursPresents) * 100) / 100 : 0
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
}
