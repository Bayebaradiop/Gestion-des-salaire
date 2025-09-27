import { BaseRepository } from './base.repository.js';
import type { Entreprise, PeriodePaie } from '@prisma/client';
import type { PeriodePaie as InterfacePeriodePaie } from '../interfaces/entreprise.interface.js';

export interface CreerEntrepriseData {
  nom: string;
  logo?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  devise?: string;
  periodePaie?: PeriodePaie;
}

export interface ModifierEntrepriseData {
  nom?: string;
  logo?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  devise?: string;
  periodePaie?: PeriodePaie;
}

export interface StatistiquesEntreprise {
  nombreEmployes: number;
  nombreEmployesActifs: number;
  masseSalarialeMensuelle: number;
}

export class EntrepriseRepository extends BaseRepository {
  async listerTout(): Promise<Entreprise[]> {
    return await this.prisma.entreprise.findMany({
      orderBy: { creeLe: 'desc' }
    });
  }

  async trouverParId(id: number): Promise<Entreprise | null> {
    return await this.prisma.entreprise.findUnique({
      where: { id }
    });
  }

  async creer(donnees: CreerEntrepriseData): Promise<Entreprise> {
    return await this.prisma.entreprise.create({
      data: {
        nom: donnees.nom,
        logo: donnees.logo || null,
        adresse: donnees.adresse || null,
        telephone: donnees.telephone || null,
        email: donnees.email || null,
        devise: donnees.devise || 'XOF',
        periodePaie: donnees.periodePaie || 'MENSUELLE'
      }
    });
  }

  async modifier(id: number, donnees: ModifierEntrepriseData): Promise<Entreprise> {
    return await this.prisma.entreprise.update({
      where: { id },
      data: donnees
    });
  }

  async supprimer(id: number): Promise<void> {
    await this.prisma.entreprise.delete({
      where: { id }
    });
  }

  async obtenirStatistiques(entrepriseId: number): Promise<StatistiquesEntreprise> {
    const [nombreEmployes, nombreEmployesActifs, employes] = await Promise.all([
      this.prisma.employe.count({
        where: { entrepriseId }
      }),
      this.prisma.employe.count({
        where: { entrepriseId, estActif: true }
      }),
      this.prisma.employe.findMany({
        where: { entrepriseId, estActif: true },
        select: {
          salaireBase: true,
          tauxJournalier: true,
          typeContrat: true
        }
      })
    ]);

    // Calculer la masse salariale mensuelle approximative
    let masseSalarialeMensuelle = 0;
    for (const employe of employes) {
      if (employe.typeContrat === 'FIXE' && employe.salaireBase) {
        masseSalarialeMensuelle += employe.salaireBase;
      } else if (employe.typeContrat === 'JOURNALIER' && employe.tauxJournalier) {
        // Approximation: 22 jours ouvrables par mois
        masseSalarialeMensuelle += employe.tauxJournalier * 22;
      } else if (employe.typeContrat === 'HONORAIRE' && employe.salaireBase) {
        masseSalarialeMensuelle += employe.salaireBase;
      }
    }

    return {
      nombreEmployes,
      nombreEmployesActifs,
      masseSalarialeMensuelle
    };
  }

  async verifierExistence(nom: string, excludeId?: number): Promise<boolean> {
    const where: any = { nom };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.entreprise.count({ where });
    return count > 0;
  }
}