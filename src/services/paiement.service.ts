import { PaiementRepository } from '../repositories/paiement.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { CyclePaieRepository } from '../repositories/cyclePaie.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';
import { PaiementJournalierService } from './paiementJournalier.service.js';
import type { CreerPaiementData, ModifierPaiementData } from '../repositories/paiement.repository.js';
import type { Paiement } from '@prisma/client';

export class PaiementService {
  private paiementRepository: PaiementRepository;
  private bulletinPaieRepository: BulletinPaieRepository;
  private cyclePaieRepository: CyclePaieRepository;
  private employeRepository: EmployeRepository;
  private paiementJournalierService: PaiementJournalierService;

  constructor() {
    this.paiementRepository = new PaiementRepository();
    this.bulletinPaieRepository = new BulletinPaieRepository();
    this.cyclePaieRepository = new CyclePaieRepository();
    this.employeRepository = new EmployeRepository();
    this.paiementJournalierService = new PaiementJournalierService();
  }

  async listerParBulletin(bulletinPaieId: number): Promise<Paiement[]> {
    return await this.paiementRepository.listerParBulletin(bulletinPaieId);
  }

  async obtenirParId(id: number): Promise<Paiement | null> {
    return await this.paiementRepository.trouverParId(id);
  }

  async creer(donnees: CreerPaiementData): Promise<Paiement> {
    // Générer le numéro de reçu
    const numeroRecu = await this.paiementRepository.genererNumeroRecu();

    const paiementData = {
      ...donnees,
      numeroRecu
    };

    const paiement = await this.paiementRepository.creer(paiementData);

    // Mettre à jour le montant payé du bulletin
    await this.bulletinPaieRepository.mettreAJourMontantPaye(donnees.bulletinPaieId);
    // Mettre à jour les totaux du cycle
    const bulletin = await this.bulletinPaieRepository.trouverParId(donnees.bulletinPaieId);
    if (bulletin) {
      await this.cyclePaieRepository.mettreAJourTotaux(bulletin.cyclePaieId);
    }

    return paiement;
  }

  async modifier(id: number, donnees: ModifierPaiementData): Promise<Paiement> {
    const paiement = await this.paiementRepository.modifier(id, donnees);

    // Mettre à jour le montant payé du bulletin
    await this.bulletinPaieRepository.mettreAJourMontantPaye(paiement.bulletinPaieId);
    const bulletin = await this.bulletinPaieRepository.trouverParId(paiement.bulletinPaieId);
    if (bulletin) {
      await this.cyclePaieRepository.mettreAJourTotaux(bulletin.cyclePaieId);
    }

    return paiement;
  }

  async supprimer(id: number): Promise<void> {
    const paiement = await this.paiementRepository.trouverParId(id);
    if (!paiement) {
      throw new Error('Paiement non trouvé');
    }

    await this.paiementRepository.supprimer(id);

    // Mettre à jour le montant payé du bulletin
    await this.bulletinPaieRepository.mettreAJourMontantPaye(paiement.bulletinPaieId);
    const bulletin = await this.bulletinPaieRepository.trouverParId(paiement.bulletinPaieId);
    if (bulletin) {
      await this.cyclePaieRepository.mettreAJourTotaux(bulletin.cyclePaieId);
    }
  }

  async obtenirAvecDetails(id: number): Promise<any> {
    return await this.paiementRepository.trouverAvecDetails(id);
  }

  async listerParEntrepriseEtPeriode(entrepriseId: number, periode: string): Promise<any[]> {
    return await this.paiementRepository.listerParEntrepriseEtPeriode(entrepriseId, periode);
  }

  async listerAvecFiltres(
    page: number, 
    limit: number, 
    filtres: {
      dateDebut?: Date;
      dateFin?: Date;
      employeId?: number;
      methodePaiement?: string;
      entrepriseId?: number;
      typeContrat?: 'JOURNALIER' | 'FIXE' | 'HONORAIRE';
    }
  ): Promise<{
    paiements: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Si le filtre est spécifiquement pour les journaliers
    if (filtres.typeContrat === 'JOURNALIER') {
      const historiqueJournaliers = await this.paiementJournalierService.obtenirHistoriquePaiementsJournaliers(
        filtres.entrepriseId!,
        {
          employeId: filtres.employeId,
          dateDebut: filtres.dateDebut,
          dateFin: filtres.dateFin
        }
      );
      
      return {
        paiements: historiqueJournaliers,
        total: historiqueJournaliers.length,
        page: 1,
        totalPages: 1
      };
    }

    // Pour les mensualisés et autres, utiliser le repository normal
    return await this.paiementRepository.listerAvecFiltres(page, limit, filtres);
  }

  /**
   * Historique unifié : paiements mensualisés + journaliers
   */
  async obtenirHistoriqueUnifie(
    entrepriseId: number,
    filtres: {
      dateDebut?: Date;
      dateFin?: Date;
      employeId?: number;
      typeContrat?: 'JOURNALIER' | 'FIXE' | 'HONORAIRE' | 'TOUS';
    } = {}
  ) {
    const historique = [];

    // Récupérer les paiements journaliers si demandé
    if (!filtres.typeContrat || filtres.typeContrat === 'JOURNALIER' || filtres.typeContrat === 'TOUS') {
      try {
        const paiementsJournaliers = await this.paiementJournalierService.obtenirHistoriquePaiementsJournaliers(
          entrepriseId,
          filtres
        );
        historique.push(...paiementsJournaliers);
      } catch (error) {
        console.error('Erreur lors de la récupération des paiements journaliers:', error);
      }
    }

    // Récupérer les paiements mensualisés si demandé
    if (!filtres.typeContrat || filtres.typeContrat === 'FIXE' || filtres.typeContrat === 'HONORAIRE' || filtres.typeContrat === 'TOUS') {
      try {
        const paiementsMensualises = await this.paiementRepository.listerAvecFiltres(1, 1000, {
          ...filtres,
          entrepriseId
        });
        
        // Ajouter le type de paiement pour distinction
        const paiementsAvecType = paiementsMensualises.paiements.map(p => ({
          ...p,
          typePaiement: 'MENSUALISÉ_AUTOMATIQUE'
        }));
        
        historique.push(...paiementsAvecType);
      } catch (error) {
        console.error('Erreur lors de la récupération des paiements mensualisés:', error);
      }
    }

    // Trier par date décroissante
    historique.sort((a, b) => {
      const dateA = new Date(a.creeLe || a.datePaiement);
      const dateB = new Date(b.creeLe || b.datePaiement);
      return dateB.getTime() - dateA.getTime();
    });

    return {
      paiements: historique,
      total: historique.length,
      totalJournaliers: historique.filter(p => p.typePaiement === 'JOURNALIER_MANUEL').length,
      totalMensualises: historique.filter(p => p.typePaiement === 'MENSUALISÉ_AUTOMATIQUE').length
    };
  }
}