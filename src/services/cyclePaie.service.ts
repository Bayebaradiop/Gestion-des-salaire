import { CyclePaieRepository } from '../repositories/cyclePaie.repository.js';
import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';
import type { CreerCyclePaieData, ModifierCyclePaieData } from '../repositories/cyclePaie.repository.js';
import type { CreerBulletinPaieData } from '../repositories/bulletinPaie.repository.js';
import type { CyclePaie, BulletinPaie } from '@prisma/client';

export class CyclePaieService {
  private cyclePaieRepository: CyclePaieRepository;
  private bulletinPaieRepository: BulletinPaieRepository;
  private employeRepository: EmployeRepository;

  constructor() {
    this.cyclePaieRepository = new CyclePaieRepository();
    this.bulletinPaieRepository = new BulletinPaieRepository();
    this.employeRepository = new EmployeRepository();
  }

  async listerParEntreprise(entrepriseId: number): Promise<CyclePaie[]> {
    return await this.cyclePaieRepository.listerParEntreprise(entrepriseId);
  }

  async obtenirParId(id: number): Promise<CyclePaie | null> {
    return await this.cyclePaieRepository.trouverParId(id);
  }

  async creer(donnees: CreerCyclePaieData): Promise<CyclePaie> {
    // Vérifier le chevauchement de dates
    const chevauchement = await this.cyclePaieRepository.verifierChevauchement(
      donnees.entrepriseId,
      donnees.dateDebut,
      donnees.dateFin
    );

    if (chevauchement) {
      throw new Error('Un cycle de paie existe déjà pour cette période');
    }

    return await this.cyclePaieRepository.creer(donnees);
  }

  async modifier(id: number, donnees: ModifierCyclePaieData): Promise<CyclePaie> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    // Vérifier le chevauchement si dates modifiées
    if (donnees.dateDebut || donnees.dateFin) {
      const dateDebut = donnees.dateDebut || cycle.dateDebut;
      const dateFin = donnees.dateFin || cycle.dateFin;

      const chevauchement = await this.cyclePaieRepository.verifierChevauchement(
        cycle.entrepriseId,
        dateDebut,
        dateFin,
        id
      );

      if (chevauchement) {
        throw new Error('Un cycle de paie existe déjà pour cette période');
      }
    }

    return await this.cyclePaieRepository.modifier(id, donnees);
  }

  async supprimer(id: number): Promise<void> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    // Vérifier qu'il n'y a pas de bulletins
    const nombreBulletins = await this.bulletinPaieRepository.compterParCycle(id);
    if (nombreBulletins > 0) {
      throw new Error('Impossible de supprimer un cycle avec des bulletins');
    }

    await this.cyclePaieRepository.supprimer(id);
  }

  async approuver(id: number): Promise<CyclePaie> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    if (cycle.statut !== 'BROUILLON') {
      throw new Error('Seul un cycle en brouillon peut être approuvé');
    }

    return await this.cyclePaieRepository.approuver(id);
  }

  async cloturer(id: number): Promise<CyclePaie> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    if (cycle.statut !== 'APPROUVE') {
      throw new Error('Seul un cycle approuvé peut être clôturé');
    }

    return await this.cyclePaieRepository.cloturer(id);
  }

  async genererBulletins(id: number): Promise<BulletinPaie[]> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    if (cycle.statut !== 'BROUILLON') {
      throw new Error('Les bulletins ne peuvent être générés que pour un cycle en brouillon');
    }

    // Vérifier qu'il n'y a pas déjà des bulletins
    const nombreBulletins = await this.bulletinPaieRepository.compterParCycle(id);
    if (nombreBulletins > 0) {
      throw new Error('Des bulletins existent déjà pour ce cycle');
    }

    // Récupérer les employés actifs
    const employes = await this.employeRepository.listerActifsParEntreprise(cycle.entrepriseId);

    const bulletins: BulletinPaie[] = [];

    for (const employe of employes) {
      let salaireBrut = 0;
      let joursTravailes: number | null = null;

      switch (employe.typeContrat) {
        case 'FIXE':
        case 'HONORAIRE':
          salaireBrut = employe.salaireBase || 0;
          break;
        case 'JOURNALIER':
          // Pour les journaliers, on initialise à 0, l'utilisateur devra saisir les jours
          salaireBrut = 0;
          joursTravailes = null;
          break;
      }

      const numeroBulletin = `BP-${cycle.id.toString().padStart(8, '0')}-${employe.id.toString().padStart(8, '0')}`;

      const bulletinData: CreerBulletinPaieData = {
        numeroBulletin,
        joursTravailes,
        salaireBrut,
        deductions: 0,
        salaireNet: salaireBrut,
        employeId: employe.id,
        cyclePaieId: id
      };

      const bulletin = await this.bulletinPaieRepository.creer(bulletinData);
      bulletins.push(bulletin);
    }

    // Mettre à jour les totaux du cycle
    await this.cyclePaieRepository.mettreAJourTotaux(id);

    return bulletins;
  }

  async obtenirStatistiques(id: number): Promise<any> {
    const cycle = await this.cyclePaieRepository.trouverParId(id);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    const bulletins = await this.bulletinPaieRepository.listerParCycle(id);
    
    const stats = {
      cycleInfo: {
        id: cycle.id,
        titre: cycle.titre,
        periode: cycle.periode,
        statut: cycle.statut,
        dateDebut: cycle.dateDebut,
        dateFin: cycle.dateFin
      },
      bulletins: {
        total: bulletins.length,
        enAttente: bulletins.filter(b => b.statut === 'EN_ATTENTE').length,
        partiel: bulletins.filter(b => b.statut === 'PARTIEL').length,
        paye: bulletins.filter(b => b.statut === 'PAYE').length
      },
      montants: {
        totalBrut: bulletins.reduce((sum, b) => sum + b.salaireBrut, 0),
        totalNet: bulletins.reduce((sum, b) => sum + b.salaireNet, 0),
        totalPaye: bulletins.reduce((sum, b) => sum + b.montantPaye, 0),
        totalRestant: bulletins.reduce((sum, b) => sum + (b.salaireNet - b.montantPaye), 0)
      },
      progression: {
        pourcentagePaye: bulletins.length > 0 
          ? Math.round((bulletins.filter(b => b.statut === 'PAYE').length / bulletins.length) * 100)
          : 0
      }
    };

    return stats;
  }

  async mettreAJourJoursTravailes(cycleId: number, joursTravailes: Array<{employeId: number, jours: number}>): Promise<any[]> {
    const cycle = await this.cyclePaieRepository.trouverParId(cycleId);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }

    if (cycle.statut !== 'BROUILLON') {
      throw new Error('Les jours travaillés ne peuvent être modifiés que pour un cycle en brouillon');
    }

    const bulletinsMisAJour = [];

    for (const item of joursTravailes) {
      // Trouver le bulletin pour cet employé
      const bulletins = await this.bulletinPaieRepository.listerParCycle(cycleId);
      const bulletin = bulletins.find(b => b.employeId === item.employeId);
      
      if (bulletin) {
        // Récupérer l'employé pour validation
        const employe = await this.employeRepository.trouverParId(item.employeId);
        if (employe && employe.typeContrat === 'JOURNALIER') {
          // Valider les jours travaillés
          if (item.jours < 0 || item.jours > 31) {
            throw new Error(`Nombre de jours invalide pour l'employé ${employe.prenom} ${employe.nom}: ${item.jours}`);
          }

          // Recalculer le salaire brut
          const salaireBrut = (employe.tauxJournalier || 0) * item.jours;
          const salaireNet = salaireBrut - bulletin.deductions;

          const bulletinMisAJour = await this.bulletinPaieRepository.modifier(bulletin.id, {
            joursTravailes: item.jours,
            salaireBrut,
            salaireNet
          });

          bulletinsMisAJour.push(bulletinMisAJour);
        }
      }
    }

    // Mettre à jour les totaux du cycle
    await this.cyclePaieRepository.mettreAJourTotaux(cycleId);

    return bulletinsMisAJour;
  }
}