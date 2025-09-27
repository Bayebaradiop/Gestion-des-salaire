import { BulletinPaieRepository } from '../repositories/bulletinPaie.repository.js';
import { EmployeRepository } from '../repositories/employe.repository.js';
import { CyclePaieRepository } from '../repositories/cyclePaie.repository.js';
import type { CreerBulletinPaieData, ModifierBulletinPaieData } from '../repositories/bulletinPaie.repository.js';
import type { BulletinPaie } from '@prisma/client';

export class BulletinPaieService {
  private bulletinPaieRepository: BulletinPaieRepository;
  private employeRepository: EmployeRepository;
  private cyclePaieRepository: CyclePaieRepository;

  constructor() {
    this.bulletinPaieRepository = new BulletinPaieRepository();
    this.employeRepository = new EmployeRepository();
    this.cyclePaieRepository = new CyclePaieRepository();
  }

  async listerParCycle(cyclePaieId: number): Promise<BulletinPaie[]> {
    return await this.bulletinPaieRepository.listerParCycle(cyclePaieId);
  }

  async obtenirParId(id: number): Promise<BulletinPaie | null> {
    return await this.bulletinPaieRepository.trouverParId(id);
  }

  async modifier(id: number, donnees: ModifierBulletinPaieData): Promise<BulletinPaie> {
    const bulletin = await this.bulletinPaieRepository.trouverParId(id);
    if (!bulletin) {
      throw new Error('Bulletin de paie non trouvé');
    }

    // Fetch employe and cycle for checks
    const employe = await this.employeRepository.trouverParId(bulletin.employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }
    // Vérifier que le cycle est en brouillon avant modification
    const cycle = await this.cyclePaieRepository.trouverParId(bulletin.cyclePaieId);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }
    if (cycle.statut !== 'BROUILLON') {
      throw new Error('Le bulletin ne peut être modifié que lorsque le cycle est en brouillon');
    }

    // Recalculer les montants si nécessaire
    let salaireBrut = donnees.salaireBrut ?? bulletin.salaireBrut;
    let deductions = donnees.deductions ?? bulletin.deductions;
    let joursTravailes = donnees.joursTravailes ?? bulletin.joursTravailes;

    // Pour les journaliers, recalculer le salaire brut
    if (employe.typeContrat === 'JOURNALIER' && joursTravailes !== null && joursTravailes !== undefined) {
      salaireBrut = (employe.tauxJournalier || 0) * joursTravailes;
    }

    const salaireNet = salaireBrut - deductions;

    const bulletinModifie = await this.bulletinPaieRepository.modifier(id, {
      ...donnees,
      salaireBrut,
      salaireNet
    });

    // Mettre à jour le montant payé
    await this.bulletinPaieRepository.mettreAJourMontantPaye(id);

    return bulletinModifie;
  }

  async supprimer(id: number): Promise<void> {
    const bulletin = await this.bulletinPaieRepository.trouverParId(id);
    if (!bulletin) {
      throw new Error('Bulletin de paie non trouvé');
    }
    // Empêcher la suppression si le cycle n'est pas en brouillon
    const cycle = await this.cyclePaieRepository.trouverParId(bulletin.cyclePaieId);
    if (!cycle) {
      throw new Error('Cycle de paie non trouvé');
    }
    if (cycle.statut !== 'BROUILLON') {
      throw new Error('Le bulletin ne peut être supprimé que lorsque le cycle est en brouillon');
    }

    await this.bulletinPaieRepository.supprimer(id);
  }

  // Méthode pour recalculer un bulletin
  async recalculer(id: number): Promise<BulletinPaie> {
    const bulletin = await this.bulletinPaieRepository.trouverParId(id);
    if (!bulletin) {
      throw new Error('Bulletin de paie non trouvé');
    }

    const employe = await this.employeRepository.trouverParId(bulletin.employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    let salaireBrut = bulletin.salaireBrut;
    let joursTravailes = bulletin.joursTravailes;

    if (employe.typeContrat === 'JOURNALIER') {
      if (joursTravailes === null) {
        joursTravailes = 22; // Valeur par défaut
      }
      salaireBrut = (employe.tauxJournalier || 0) * joursTravailes;
    }

    const salaireNet = salaireBrut - bulletin.deductions;

    return await this.bulletinPaieRepository.modifier(id, {
      joursTravailes,
      salaireBrut,
      salaireNet
    });
  }

  async obtenirAvecDetails(id: number): Promise<any> {
    return await this.bulletinPaieRepository.trouverAvecDetails(id);
  }
}