import { EntrepriseRepository } from '../repositories/entreprise.repository.js';
import type { CreerEntrepriseDto, ModifierEntrepriseDto, EntrepriseAvecStats } from '../interfaces/entreprise.interface.js';

export class EntrepriseService {
  private entrepriseRepository: EntrepriseRepository;

  constructor() {
    this.entrepriseRepository = new EntrepriseRepository();
  }

  async listerTout(): Promise<EntrepriseAvecStats[]> {
    const entreprises = await this.entrepriseRepository.listerTout();
    
    const entreprisesAvecStats = await Promise.all(
      entreprises.map(async (entreprise) => {
        const stats = await this.entrepriseRepository.obtenirStatistiques(entreprise.id);
        return {
          ...entreprise,
          ...stats
        };
      })
    );

    return entreprisesAvecStats;
  }

  async obtenirParId(id: number): Promise<EntrepriseAvecStats | null> {
    const entreprise = await this.entrepriseRepository.trouverParId(id);
    if (!entreprise) {
      return null;
    }

    const stats = await this.entrepriseRepository.obtenirStatistiques(id);
    return {
      ...entreprise,
      ...stats
    };
  }

  async creer(donnees: CreerEntrepriseDto): Promise<EntrepriseAvecStats> {
    // Vérifier l'unicité du nom
    const existeDejaAvecCeNom = await this.entrepriseRepository.verifierExistence(donnees.nom);
    if (existeDejaAvecCeNom) {
      throw new Error('Une entreprise avec ce nom existe déjà');
    }

    const entreprise = await this.entrepriseRepository.creer(donnees);
    const stats = await this.entrepriseRepository.obtenirStatistiques(entreprise.id);
    
    return {
      ...entreprise,
      ...stats
    };
  }

  async modifier(id: number, donnees: ModifierEntrepriseDto): Promise<EntrepriseAvecStats> {
    // Vérifier que l'entreprise existe
    const entrepriseExistante = await this.entrepriseRepository.trouverParId(id);
    if (!entrepriseExistante) {
      throw new Error('Entreprise non trouvée');
    }

    // Vérifier l'unicité du nom si modifié
    if (donnees.nom) {
      const existeDejaAvecCeNom = await this.entrepriseRepository.verifierExistence(donnees.nom, id);
      if (existeDejaAvecCeNom) {
        throw new Error('Une entreprise avec ce nom existe déjà');
      }
    }

    const entrepriseModifiee = await this.entrepriseRepository.modifier(id, donnees);
    const stats = await this.entrepriseRepository.obtenirStatistiques(id);
    
    return {
      ...entrepriseModifiee,
      ...stats
    };
  }

  async supprimer(id: number): Promise<void> {
    // Vérifier que l'entreprise existe
    const entreprise = await this.entrepriseRepository.trouverParId(id);
    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    // Vérifier qu'il n'y a pas d'employés actifs
    const stats = await this.entrepriseRepository.obtenirStatistiques(id);
    if (stats.nombreEmployesActifs > 0) {
      throw new Error('Impossible de supprimer une entreprise avec des employés actifs');
    }

    await this.entrepriseRepository.supprimer(id);
  }

  async obtenirStatistiques(id: number) {
    const entreprise = await this.entrepriseRepository.trouverParId(id);
    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    return await this.entrepriseRepository.obtenirStatistiques(id);
  }
}