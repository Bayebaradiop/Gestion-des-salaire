import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AutorisationService {
  
  /**
   * Obtenir l'état de l'accès Super-Admin pour une entreprise
   */
  async obtenirEtatAcces(entrepriseId: number) {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      select: {
        id: true,
        nom: true,
        accesSuperAdminAutorise: true,
        misAJourLe: true
      }
    });

    if (!entreprise) {
      throw new Error('Entreprise introuvable');
    }

    return {
      entrepriseId: entreprise.id,
      nomEntreprise: entreprise.nom,
      accesSuperAdminAutorise: entreprise.accesSuperAdminAutorise,
      derniereMiseAJour: entreprise.misAJourLe
    };
  }

  /**
   * Mettre à jour l'autorisation d'accès Super-Admin
   */
  async mettreAJourAutorisation(entrepriseId: number, accesSuperAdminAutorise: boolean) {
    // Vérifier que l'entreprise existe
    const entrepriseExistante = await prisma.entreprise.findUnique({
      where: { id: entrepriseId }
    });

    if (!entrepriseExistante) {
      throw new Error('Entreprise introuvable');
    }

    // Mettre à jour l'autorisation
    const entrepriseMiseAJour = await prisma.entreprise.update({
      where: { id: entrepriseId },
      data: { 
        accesSuperAdminAutorise,
        misAJourLe: new Date()
      },
      select: {
        id: true,
        nom: true,
        accesSuperAdminAutorise: true,
        misAJourLe: true
      }
    });

    return entrepriseMiseAJour;
  }

  /**
   * Vérifier si un Super-Admin peut accéder à une entreprise
   */
  async verifierAccesAutorise(entrepriseId: number): Promise<boolean> {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: entrepriseId },
      select: { accesSuperAdminAutorise: true }
    });

    if (!entreprise) {
      throw new Error('Entreprise introuvable');
    }

    return entreprise.accesSuperAdminAutorise;
  }

  /**
   * Lister toutes les entreprises avec leur état d'autorisation (pour Super-Admin)
   */
  async listerEntreprisesAvecAutorisation() {
    return await prisma.entreprise.findMany({
      select: {
        id: true,
        nom: true,
        accesSuperAdminAutorise: true,
        estActif: true,
        creeLe: true,
        misAJourLe: true,
        _count: {
          select: {
            employes: true,
            utilisateurs: true
          }
        }
      },
      orderBy: { nom: 'asc' }
    });
  }
}