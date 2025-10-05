# Payroll Management System Backend

This is a comprehensive Node.js/Express backend application for payroll management, covering employee management, time tracking, automatic payroll calculation, pay slip generation and distribution.

Features:
- Employee management (salaried, daily workers, freelancers)
- Time tracking (attendance/hours/absences)
- Automatic payroll calculation (daily, hourly, fixed with absence deductions)
- Pay slip generation and sending (email, SMS, WhatsApp)
- Secure REST APIs (JWT auth, roles)
- Strict data validation (Zod)
- History of processes (pay runs) and logs

Objective: Provide complete documentation with code snippets, schemas, configuration, tests so any developer can clone and run the backend without looking elsewhere.

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT
- **PDF Generation**: html-pdf-node, Puppeteer
- **Security**: Helmet, CORS, bcryptjs

## Project Structure

```
payroll-management-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── employe.controller.ts
│   │   ├── entreprise.controller.ts
│   │   ├── cyclePaie.controller.ts
│   │   ├── bulletinPaie.controller.ts
│   │   ├── paiement.controller.ts
│   │   ├── paiementAutomatise.controller.ts
│   │   ├── pointage.controller.ts
│   │   └── dashboard.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── employe.service.ts
│   │   ├── entreprise.service.ts
│   │   ├── cyclePaie.service.ts
│   │   ├── bulletinPaie.service.ts
│   │   ├── paiement.service.ts
│   │   ├── paiementAutomatise.service.ts
│   │   ├── pointage.service.ts
│   │   ├── dashboard.service.ts
│   │   └── pdf.service.ts
│   ├── repositories/
│   │   ├── employe.repository.ts
│   │   ├── entreprise.repository.ts
│   │   ├── cyclePaie.repository.ts
│   │   ├── bulletinPaie.repository.ts
│   │   ├── paiement.repository.ts
│   │   ├── paiementAutomatise.repository.ts
│   │   └── pointage.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── employe.routes.ts
│   │   ├── entreprise.routes.ts
│   │   ├── cyclePaie.routes.ts
│   │   ├── bulletinPaie.routes.ts
│   │   ├── paiement.routes.ts
│   │   ├── paiementAutomatise.routes.ts
│   │   ├── pointage.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── admin.routes.ts
│   ├── validator/
│   │   ├── auth.validator.ts
│   │   ├── employe.validator.ts
│   │   ├── entreprise.validator.ts
│   │   ├── cyclepaie.validator.ts
│   │   ├── bulletinPaie.validator.ts
│   │   ├── paiement.validator.ts
│   │   └── user.validator.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── validation.middleware.ts
│   ├── types/
│   │   └── global.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── uploads/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration & Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd payroll-management-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the values:

   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/payroll_db"

   # JWT
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=3000
   NODE_ENV="development"
   ```

4. Set up the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   npm run prisma:seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3000

## Complete Backend Code

### `src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import entrepriseRoutes from './routes/entreprise.routes.js';
import employeRoutes from './routes/employe.routes.js';
import cyclePaieRoutes from './routes/cyclePaie.routes.js';
import bulletinPaieRoutes from './routes/bulletinPaie.routes.js';
import paiementRoutes from './routes/paiement.routes.js';
import paiementAutomatiseRoutes from './routes/paiementAutomatise.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import pointageRoutes from './routes/pointage.routes.js';
import autorisationRoutes from './routes/autorisation.routes.js';

import { errorHandler, notFoundHandler, requestLogger, securityHeaders } from './middleware/errorHandler.js';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité et de logging
app.use(securityHeaders);
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origine (comme les appels d'API mobile ou Postman)
    if (!origin) return callback(null, true);

    // Liste des origines autorisées
    const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002'];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés (logos, etc.)
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api', employeRoutes);
app.use('/api', cyclePaieRoutes);
app.use('/api', bulletinPaieRoutes);
app.use('/api', paiementRoutes);
app.use('/api', paiementAutomatiseRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', pointageRoutes);
app.use('/api', autorisationRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API Backend Gestion des Salaires',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      entreprises: '/api/entreprises',
      employes: '/api/employes',
      'cycles-paie': '/api/cycles-paie'
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Gestion des routes non trouvées (404)
app.use(notFoundHandler);

// Gestion globale des erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Available endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Entreprises: http://localhost:${PORT}/api/entreprises`);
  console.log(`   - Employés: http://localhost:${PORT}/api/employes`);
  console.log(`   - Cycles de paie: http://localhost:${PORT}/api/cycles-paie`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
```

### `src/services/employe.service.ts`
```typescript
import { EmployeRepository } from '../repositories/employe.repository.js';
import { EntrepriseRepository } from '../repositories/entreprise.repository.js';
import type { CreerEmployeModifierEmployeDto, FiltreEmployeDto } from '../interfaces/employe.interface.js';
import type { Employe } from '../repositories/employe.repository.js';

export class EmployeService {
  private employeRepository: EmployeRepository;
  private entrepriseRepository: EntrepriseRepository;

  constructor() {
    this.employeRepository = new EmployeRepository();
    this.entrepriseRepository = new EntrepriseRepository();
  }Dto, 

  async listerParEntreprise(entrepriseId: number, filtre?: FiltreEmployeDto): Promise<Employe[]> {
    return await this.employeRepository.listerParEntreprise(entrepriseId, filtre);
  }

  async obtenirParId(id: number): Promise<Employe | null> {
    return await this.employeRepository.trouverParId(id);
  }

  async creer(donnees: CreerEmployeDto, entrepriseId: number): Promise<Employe> {
    // Vérifier que l'entreprise existe
    const entreprise = await this.entrepriseRepository.trouverParId(entrepriseId);
    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    // Vérifier l'unicité de l'email
    if (donnees.email) {
      const emailUnique = await this.employeRepository.verifierEmailUnique(donnees.email);
      if (!emailUnique) {
        throw new Error('Cet email est déjà utilisé par un autre employé');
      }
    }

    // Vérifier l'unicité du téléphone
    if (donnees.telephone) {
      const telephoneUnique = await this.employeRepository.verifierTelephoneUnique(donnees.telephone);
      if (!telephoneUnique) {
        throw new Error('Ce numéro de téléphone est déjà utilisé par un autre employé');
      }
    }

    // Générer automatiquement le code employé
    const codeEmploye = await this.genererCodeEmploye(entrepriseId);

    // Validation des données selon le type de contrat
    this.validerDonneesContrat(donnees);

    const nouvelEmploye = await this.employeRepository.creer({
      ...donnees,
      codeEmploye,
      dateEmbauche: new Date(donnees.dateEmbauche),
      entrepriseId
    });

    return nouvelEmploye;
  }

  /**
   * Génère un code employé unique pour une entreprise
   * Format: EMP-{entrepriseId}-{compteur}
   */
  private async genererCodeEmploye(entrepriseId: number): Promise<string> {
    // Compter le nombre d'employés existants dans cette entreprise
    const count = await this.employeRepository.compterParEntreprise(entrepriseId);

    // Générer le code avec un compteur incrémental
    const numeroSequentiel = (count + 1).toString().padStart(4, '0');
    return `EMP-${entrepriseId}-${numeroSequentiel}`;
  }

  async modifier(id: number, donnees: ModifierEmployeDto): Promise<Employe> {
    // Vérifier que l'employé existe
    const employe = await this.employeRepository.trouverParId(id);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // Validation des données selon le type de contrat si modifié
    if (donnees.typeContrat || donnees.salaireBase !== undefined || donnees.tauxJournalier !== undefined) {
      const donneesAValider = {
        typeContrat: donnees.typeContrat || employe.typeContrat,
        salaireBase: donnees.salaireBase !== undefined ? donnees.salaireBase : employe.salaireBase,
        tauxJournalier: donnees.tauxJournalier !== undefined ? donnees.tauxJournalier : employe.tauxJournalier
      };
      this.validerDonneesContrat(donneesAValider);
    }

    // Préparer les données avec conversion de date si nécessaire
    const donneesPreparees: any = { ...donnees };
    if (donnees.dateEmbauche) {
      donneesPreparees.dateEmbauche = new Date(donnees.dateEmbauche);
    }

    return await this.employeRepository.modifier(id, donneesPreparees);
  }

  async supprimer(id: number): Promise<void> {
    // Vérifier que l'employé existe
    const employe = await this.employeRepository.trouverParId(id);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // TODO: Vérifier qu'il n'y a pas de bulletins de paie en cours

    await this.employeRepository.supprimer(id);
  }

  async activer(id: number): Promise<void> {
    const employe = await this.employeRepository.trouverParId(id);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    if (employe.estActif) {
      throw new Error('L\'employé est déjà actif');
    }

    await this.employeRepository.activer(id);
  }

  async desactiver(id: number): Promise<void> {
    const employe = await this.employeRepository.trouverParId(id);
    if (!employe) {
      throw new Error('L\'employé est déjà inactif');
    }

    // TODO: Vérifier qu'il n'y a pas de bulletins de paie en cours

    await this.employeRepository.desactiver(id);
  }

  async toggle(id: number): Promise<Employe> {
    const employe = await this.employeRepository.trouverParId(id);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    if (employe.estActif) {
      // TODO: Vérifier qu'il n'y a pas de bulletins de paie en cours avant de désactiver
      await this.employeRepository.desactiver(id);
    } else {
      await this.employeRepository.activer(id);
    }

    // Retourner l'employé mis à jour
    return await this.employeRepository.trouverParId(id) as Employe;
  }

  async listerActifsParEntreprise(entrepriseId: number): Promise<Employe[]> {
    return await this.employeRepository.listerActifsParEntreprise(entrepriseId);
  }

  async obtenirStatistiques(entrepriseId: number) {
    const [total, actifs] = await Promise.all([
      this.employeRepository.compterParEntreprise(entrepriseId),
      this.employeRepository.compterActifsParEntreprise(entrepriseId)
    ]);

    return {
      nombreTotal: total,
      nombreActifs: actifs,
      nombreInactifs: total - actifs
    };
  }

  private validerDonneesContrat(donnees: {
    typeContrat: string;
    salaireBase?: number | null | undefined;
    tauxJournalier?: number | null | undefined;
  }): void {
    switch (donnees.typeContrat) {
      case 'JOURNALIER':
        if (!donnees.tauxJournalier || donnees.tauxJournalier <= 0) {
          throw new Error('Taux journalier requis et doit être positif pour un contrat journalier');
        }
        break;
      case 'FIXE':
      case 'HONORAIRE':
        if (!donnees.salaireBase || donnees.salaireBase <= 0) {
          throw new Error('Salaire de base requis et doit être positif pour ce type de contrat');
        }
        break;
      default:
        throw new Error('Type de contrat invalide');
    }
  }
}
```

### `src/services/bulletinPaie.service.ts`
```typescript
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

  async listerParEmploye(employeId: number, filtres?: { statut?: string[] }): Promise<BulletinPaie[]> {
    return await this.bulletinPaieRepository.listerParEmploye(employeId, filtres);
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

    // Validation stricte des jours travaillés pour les journaliers
    if (employe.typeContrat === 'JOURNALIER' && donnees.joursTravailes !== undefined) {
      this.validerJoursTravailes(donnees.joursTravailes, cycle);
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

  /**
   * Valide les jours travaillés selon la période du cycle
   */
  private validerJoursTravailes(joursTravailes: number | null, cycle: any): void {
    if (joursTravailes === null || joursTravailes === undefined) {
      return; // Valide pour les non-journaliers
    }

    // Validation des valeurs de base
    if (joursTravailes < 0) {
      throw new Error('Le nombre de jours travaillés ne peut pas être négatif');
    }

    if (joursTravailes > 31) {
      throw new Error('Le nombre de jours travaillés ne peut pas dépasser 31 jours par période');
    }

    // Calcul du nombre de jours maximum selon la période du cycle
    const dateDebut = new Date(cycle.dateDebut);
    const dateFin = new Date(cycle.dateFin);
    const joursMaxDansPeriode = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (joursTravailes > joursMaxDansPeriode) {
      throw new Error(`Le nombre de jours travaillés (${joursTravailes}) ne peut pas dépasser le nombre de jours dans la période (${joursMaxDansPeriode})`);
    }

    // Validation pour éviter les erreurs de saisie communes
    if (joursTravailes > 25 && joursMaxDansPeriode <= 31) {
      console.warn(`⚠️ Attention: ${joursTravailes} jours travaillés semble élevé pour une période de ${joursMaxDansPeriode} jours`);
    }
  }
}
```

### `src/services/paiementAutomatise.service.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { EmployeRepository } from '../repositories/employe.repository';
import { BaseRepository } from '../repositories/base.repository';

const prisma = new PrismaClient();

export interface DetailCalculJournalier {
  type: 'JOURNALIER';
  tauxJournalier: number;
  joursTravailes: number;
  joursAbsents: number;
  totalJours: number;
  montantBrut: number;
}

export interface DetailCalculHonoraire {
  type: 'HONORAIRE';
  tauxHoraire: number;
  heuresTravailes: number;
  montantBrut: number;
}

export interface DetailCalculFixe {
  type: 'FIXE';
  salaireFixe: number;
  joursOuvrables: number;
  joursAbsents: number;
  deductionAbsences: number;
  montantNet: number;
}

export type DetailCalcul = DetailCalculJournalier | DetailCalculHonoraire | DetailCalculFixe;

/**
 * Service pour calculer les paiements automatisés basés sur les pointages
 */
export class PaiementAutomatiseService extends BaseRepository {
  private employeRepository: EmployeRepository;

  constructor() {
    super();
    this.employeRepository = new EmployeRepository();
  }

  /**
   * Calculer le paiement pour un employé sur une période donnée
   */
  async calculerPaiement(employeId: number, periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalcul;
  }> {
    // Récupérer l'employé
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // Récupérer les pointages de la période
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculer selon le type de contrat
    switch (employe.typeContrat) {
      case 'JOURNALIER':
        return this.calculerPaiementJournalier(employe, pointages, periode);

      case 'HONORAIRE':
        return this.calculerPaiementHonoraire(employe, pointages, periode);

      case 'FIXE':
        return this.calculerPaiementFixe(employe, pointages, periode);

      default:
        throw new Error(`Type de contrat non supporté: ${employe.typeContrat}`);
    }
  }

  /**
   * Calculer le paiement pour un employé journalier
   */
  private async calculerPaiementJournalier(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculJournalier;
  }> {
    if (!employe.tauxJournalier) {
      throw new Error('Taux journalier non défini pour cet employé');
    }

    // Compter les jours travaillés (présents ou en retard)
    const joursTravailes = pointages.filter(p =>
      p.statut === 'PRESENT' || p.statut === 'RETARD'
    ).length;

    // Compter les jours d'absence
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;

    const montantBrut = employe.tauxJournalier * joursTravailes;

    const detailsCalcul: DetailCalculJournalier = {
      type: 'JOURNALIER',
      tauxJournalier: employe.tauxJournalier,
      joursTravailes,
      joursAbsents,
      totalJours: pointages.length,
      montantBrut
    };

    return {
      montantDu: montantBrut,
      detailsCalcul
    };
  }

  /**
   * Calculer le paiement pour un employé honoraire (basé sur les heures)
   */
  private async calculerPaiementHonoraire(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculHonoraire;
  }> {
    if (!employe.salaireBase) {
      throw new Error('Taux horaire (salaireBase) non défini pour cet employé honoraire');
    }

    // Calculer les heures travaillées basées sur les pointages
    let heuresTravailes = 0;

    for (const pointage of pointages) {
      if (pointage.statut === 'PRESENT' || pointage.statut === 'RETARD') {
        if (pointage.heureArrivee && pointage.heureDepart) {
          const heureArrivee = new Date(pointage.heureArrivee);
          const heureDepart = new Date(pointage.heureDepart);
          const dureeMs = heureDepart.getTime() - heureArrivee.getTime();
          const dureeHeures = dureeMs / (1000 * 60 * 60); // Convertir en heures
          heuresTravailes += Math.max(0, dureeHeures); // Éviter les valeurs négatives
        } else {
          // Si pas d'heure de départ, compter 8h par défaut pour les présents
          heuresTravailes += 8;
        }
      }
    }

    // Le salaireBase pour les honoraires est considéré comme un taux horaire
    const tauxHoraire = employe.salaireBase;
    const montantBrut = tauxHoraire * heuresTravailes;

    const detailsCalcul: DetailCalculHonoraire = {
      type: 'HONORAIRE',
      tauxHoraire,
      heuresTravailes: Math.round(heuresTravailes * 100) / 100, // Arrondir à 2 décimales
      montantBrut
    };

    return {
      montantDu: montantBrut,
      detailsCalcul
    };
  }

  /**
   * Calculer le paiement pour un employé fixe (avec déduction des absences)
   */
  private async calculerPaiementFixe(employe: any, pointages: any[], periode: string): Promise<{
    montantDu: number;
    detailsCalcul: DetailCalculFixe;
  }> {
    if (!employe.salaireBase) {
      throw new Error('Salaire de base non défini pour cet employé');
    }

    // Calculer le nombre de jours ouvrables dans le mois
    const [annee, mois] = periode.split('-').map(n => parseInt(n));
    const joursOuvrables = this.calculerJoursOuvrables(annee, mois);

    // Compter les jours d'absence
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;

    // Calculer la déduction pour les absences
    const salaireJournalier = employe.salaireBase / joursOuvrables;
    const deductionAbsences = salaireJournalier * joursAbsents;
    const montantNet = employe.salaireBase - deductionAbsences;

    const detailsCalcul: DetailCalculFixe = {
      type: 'FIXE',
      salaireFixe: employe.salaireBase,
      joursOuvrables,
      joursAbsents,
      deductionAbsences: Math.round(deductionAbsences),
      montantNet: Math.round(montantNet)
    };

    return {
      montantDu: montantNet,
      detailsCalcul
    };
  }

  /**
   * Calculer le nombre de jours ouvrables dans un mois (exclut weekends)
   */
  private calculerJoursOuvrables(annee: number, mois: number): number {
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    let joursOuvrables = 0;
    const currentDate = new Date(dateDebut);

    while (currentDate <= dateFin) {
      const jourSemaine = currentDate.getDay();
      // 0 = Dimanche, 6 = Samedi
      if (jourSemaine !== 0 && jourSemaine !== 6) {
        joursOuvrables++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return joursOuvrables;
  }

  /**
   * Enregistrer un paiement automatisé
   */
  async enregistrerPaiement(employeId: number, periode: string): Promise<any> {
    // Vérifier si un paiement existe déjà pour cette période
    const paiementExistant = await prisma.paiementAutomatise.findUnique({
      where: {
        employeId_periode: {
          employeId,
          periode
        }
      }
    });

    if (paiementExistant) {
      throw new Error(`Un paiement existe déjà pour l'employé ${employeId} pour la période ${periode}`);
    }

    // Calculer le montant
    const { montantDu, detailsCalcul } = await this.calculerPaiement(employeId, periode);

    // Récupérer l'employé pour l'entrepriseId
    const employe = await this.employeRepository.trouverParId(employeId);
    if (!employe) {
      throw new Error('Employé non trouvé');
    }

    // Créer le paiement automatisé
    const paiement = await prisma.paiementAutomatise.create({
      data: {
        employeId,
        entrepriseId: employe.entrepriseId,
        periode,
        montantDu,
        typeContrat: employe.typeContrat as any,
        detailsCalcul: detailsCalcul as any,
        statut: 'CALCULE'
      },
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            poste: true,
            typeContrat: true
          }
        }
      }
    });

    return paiement;
  }

  /**
   * Récupérer les paiements d'une entreprise pour une période
   */
  async obtenirPaiementsEntreprise(entrepriseId: number, periode?: string) {
    const where: any = { entrepriseId };
    if (periode) {
      where.periode = periode;
    }

    return await prisma.paiementAutomatise.findMany({
      where,
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            poste: true,
            typeContrat: true
          }
        }
      },
      orderBy: [
        { periode: 'desc' },
        { employe: { nom: 'asc' } }
      ]
    });
  }

  /**
   * Marquer un paiement comme payé
   */
  async marquerCommePaye(paiementId: number, montantPaye: number, methodePaiement: string, notes?: string) {
    const paiement = await prisma.paiementAutomatise.findUnique({
      where: { id: paiementId }
    });

    if (!paiement) {
      throw new Error('Paiement non trouvé');
    }

    let nouveauStatut: 'PARTIEL' | 'PAYE';
    if (montantPaye >= paiement.montantDu) {
      nouveauStatut = 'PAYE';
    } else {
      nouveauStatut = 'PARTIEL';
    }

    return await prisma.paiementAutomatise.update({
      where: { id: paiementId },
      data: {
        montantPaye: paiement.montantPaye + montantPaye,
        statut: nouveauStatut,
        methodePaiement: methodePaiement as any,
        datePaiement: nouveauStatut === 'PAYE' ? new Date() : paiement.datePaiement,
        notes
      }
    });
  }
}
```

### `src/middleware/auth.middleware.ts`
```typescript
import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { TokenPayload, RoleUtilisateur } from '../interfaces/auth.interface.js';

// Étendre l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      utilisateur?: TokenPayload;
    }
  }
}

const authService = new AuthService();

export const authentifier = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Essayer de lire le token depuis les cookies d'abord (HTTP-only)
    let token = req.cookies?.authToken;

    // Si pas de cookie, essayer l'en-tête Authorization en fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      res.status(401).json({ message: 'Token d\'authentification manquant' });
      return;
    }

    const payload = authService.verifierToken(token);
    req.utilisateur = payload;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token invalide',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const autoriserRoles = (...rolesAutorises: RoleUtilisateur[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.utilisateur) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      res.status(403).json({
        message: 'Accès refusé - Permissions insuffisantes',
        roleRequis: rolesAutorises,
        roleActuel: req.utilisateur.role
      });
      return;
    }

    next();
  };
};

export const verifierEntreprise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.utilisateur) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  // Super admin doit vérifier les autorisations d'accès
  if (req.utilisateur.role === 'SUPER_ADMIN') {
    // Déléguer la vérification au middleware spécialisé
    await verifierAccesSuperAdminAutorise(req, res, next);
    return;
  }

  // Pour les autres rôles, vérifier l'entreprise
  const entrepriseId = req.params.entrepriseId || req.body.entrepriseId;

  if (!entrepriseId) {
    res.status(400).json({ message: 'ID entreprise manquant' });
    return;
  }

  // Convertir en number pour la comparaison
  const entrepriseIdNumber = parseInt(entrepriseId);

  if (req.utilisateur.entrepriseId !== entrepriseIdNumber) {
    res.status(403).json({ message: 'Accès refusé - Entreprise non autorisée' });
    return;
  }

  next();
};

/**
 * Middleware pour vérifier l'accès Super-Admin avec autorisation de l'entreprise
 */
export const verifierAccesSuperAdminAutorise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.utilisateur) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  // Seuls les Super-Admins peuvent utiliser ce middleware
  if (req.utilisateur.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Accès réservé aux Super-Admins' });
    return;
  }

  const entrepriseId = req.params.entrepriseId || req.body.entrepriseId;

  if (!entrepriseId) {
    res.status(400).json({ message: 'ID entreprise manquant' });
    return;
  }

  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { AutorisationService } = await import('../services/autorisation.service.js');
    const autorisationService = new AutorisationService();

    const accesAutorise = await autorisationService.verifierAccesAutorise(parseInt(entrepriseId));

    if (!accesAutorise) {
      res.status(403).json({
        message: 'Accès bloqué par l\'administrateur de l\'entreprise',
        entrepriseId: parseInt(entrepriseId)
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la vérification des autorisations',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
```

### `prisma/schema.prisma`
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ================================
// GESTION DES ENTREPRISES & UTILISATEURS
// ================================

model Entreprise {
    id              Int      @id @default(autoincrement())
    nom             String
    logo            String? @db.Text
    couleur         String   @default("#3B82F6") // Couleur de l'entreprise (hex)
    adresse         String?
    telephone       String?
    email           String?
    devise          String   @default("XOF") // Devise par défaut
    periodePaie     PeriodePaie @default(MENSUELLE) // Période de paie
    estActif        Boolean  @default(true) // Statut actif/inactif
    accesSuperAdminAutorise Boolean @default(true) // Autorisation d'accès pour les Super-Admins
    creeLe          DateTime @default(now())
    misAJourLe      DateTime @updatedAt

    // Relations
    utilisateurs    Utilisateur[]
    employes        Employe[]
    cyclesPaie      CyclePaie[]
    pointages       Pointage[]
    paiementsAutomatises PaiementAutomatise[]

    @@map("entreprises")
}

model Utilisateur {
   id              Int      @id @default(autoincrement())
   email           String   @unique
   motDePasse      String
   prenom          String
   nom             String
   role            RoleUtilisateur
   estActif        Boolean  @default(true)
   derniereConnexion DateTime?
   creeLe          DateTime @default(now())
   misAJourLe      DateTime @updatedAt

   // Relations
   entrepriseId    Int?
   entreprise      Entreprise? @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
   paiements       Paiement[]

   @@map("utilisateurs")
}

// ================================
// GESTION DES EMPLOYÉS
// ================================

model Employe {
   id              Int      @id @default(autoincrement())
   codeEmploye     String   // Code unique employé dans l'entreprise
   prenom          String
   nom             String
   email           String?
   telephone       String?
   poste           String   // Poste occupé
   typeContrat     TypeContrat
   salaireBase     Float?   // Salaire de base (pour fixes et honoraires)
   tauxJournalier  Float?   // Taux journalier (pour journaliers)
   compteBancaire  String?  // Coordonnées bancaires
   estActif        Boolean  @default(true) // Actif/Inactif (vacataires)
   dateEmbauche    DateTime
   creeLe          DateTime @default(now())
   misAJourLe      DateTime @updatedAt

   // Relations
   entrepriseId    Int
   entreprise      Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
   bulletinsPaie   BulletinPaie[]
   pointages       Pointage[]
   paiementsAutomatises PaiementAutomatise[]

   @@unique([entrepriseId, codeEmploye])
   @@map("employes")
}

// ================================
// GESTION DES CYCLES DE PAIE
// ================================

model CyclePaie {
   id              Int      @id @default(autoincrement())
   titre           String   // Ex: "Paie Janvier 2024"
   periode         String   // Ex: "2024-01" pour janvier 2024
   dateDebut       DateTime
   dateFin         DateTime
   statut          StatutCyclePaie @default(BROUILLON)
   totalBrut       Float    @default(0) // Total brut
   totalNet        Float    @default(0) // Total net
   totalPaye       Float    @default(0) // Total payé
   creeLe          DateTime @default(now())
   misAJourLe      DateTime @updatedAt
   approuveLe      DateTime?
   clotureLe       DateTime?

   // Relations
   entrepriseId    Int
   entreprise      Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
   bulletinsPaie   BulletinPaie[]

   @@unique([entrepriseId, periode])
   @@map("cycles_paie")
}

// ================================
// BULLETINS DE PAIE
// ================================

model BulletinPaie {
   id              Int      @id @default(autoincrement())
   numeroBulletin  String   // Numéro unique du bulletin
   joursTravailes  Int?     // Nombre de jours travaillés (pour journaliers)
   salaireBrut     Float    // Salaire brut
   deductions      Float    @default(0) // Déductions
   salaireNet      Float    // Salaire net à payer
   montantPaye     Float    @default(0) // Montant payé
   statut          StatutBulletinPaie @default(EN_ATTENTE)
   creeLe          DateTime @default(now())
   misAJourLe      DateTime @updatedAt

   // Relations
   employeId       Int
   employe         Employe @relation(fields: [employeId], references: [id], onDelete: Cascade)
   cyclePaieId     Int
   cyclePaie       CyclePaie @relation(fields: [cyclePaieId], references: [id], onDelete: Cascade)
   paiements       Paiement[]

   @@unique([cyclePaieId, employeId])
   @@map("bulletins_paie")
}

// ================================
// GESTION DES PAIEMENTS
// ================================

model Paiement {
   id              Int      @id @default(autoincrement())
   montant         Float
   methodePaiement MethodePaiement
   reference       String?  // Référence du paiement
   notes           String?
   numeroRecu      String   @unique // Numéro du reçu généré
   creeLe          DateTime @default(now())

     // Relations
   bulletinPaieId  Int
   bulletinPaie    BulletinPaie @relation(fields: [bulletinPaieId], references: [id], onDelete: Cascade)
   traiteParId     Int
   traitePar       Utilisateur @relation(fields: [traiteParId], references: [id])

   @@map("paiements")
}

// ================================
// PAIEMENTS AUTOMATISÉS BASÉS SUR POINTAGES
// ================================

model PaiementAutomatise {
   id              Int      @id @default(autoincrement())
   periode         String   // Ex: "2024-10" pour octobre 2024
   montantDu       Float    // Montant calculé basé sur les pointages
   montantPaye     Float    @default(0) // Montant déjà payé
   typeContrat     TypeContrat // JOURNALIER, FIXE, HONORAIRE
   detailsCalcul   Json     // Détails du calcul (jours travaillés, heures, absences, etc.)
   statut          StatutPaiementAutomatise @default(CALCULE)
   methodePaiement MethodePaiement?
   dateCalcul      DateTime @default(now())
   datePaiement    DateTime?
   notes           String?

   // Relations
   employeId       Int
   employe         Employe @relation(fields: [employeId], references: [id], onDelete: Cascade)
   entrepriseId    Int
   entreprise      Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)

   @@unique([employeId, periode])
   @@index([entrepriseId, periode])
   @@map("paiements_automatises")
}

// ================================
// GESTION DES POINTAGES (PRÉSENCE/ABSENCE)
// ================================

model Pointage {
   id             Int       @id @default(autoincrement())
   date           DateTime  // Jour du pointage
   heureArrivee   DateTime?
   heureDepart    DateTime?
   dureeMinutes   Int?
   statut         StatutPointage @default(PRESENT) // Présent, absent, retard, etc.
   notes          String?
   creeLe         DateTime @default(now())
   misAJourLe     DateTime @updatedAt

   // Relations
   employeId      Int
   employe        Employe    @relation(fields: [employeId], references: [id], onDelete: Cascade)
   entrepriseId   Int
   entreprise     Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)

   @@unique([employeId, date])
   @@index([entrepriseId, date])
   @@map("pointages")
}

// ================================
// ENUMS
// ================================

enum RoleUtilisateur {
   SUPER_ADMIN
   ADMIN
   CAISSIER
}

enum TypeContrat {
   JOURNALIER   // Journalier
   FIXE         // Salaire fixe
   HONORAIRE    // Honoraire
}

enum PeriodePaie {
   JOURNALIERE  // Journalière
   HEBDOMADAIRE // Hebdomadaire
   MENSUELLE    // Mensuelle
}

enum StatutCyclePaie {
   BROUILLON    // Brouillon
   APPROUVE     // Approuvé
   CLOTURE      // Clôturé
}

enum StatutBulletinPaie {
   EN_ATTENTE   // En attente
   PARTIEL      // Payé partiellement
   PAYE         // Payé intégralement
}

enum MethodePaiement {
   ESPECES      // Espèces
   VIREMENT_BANCAIRE // Virement bancaire
   ORANGE_MONEY // Orange Money
   WAVE         // Wave
   AUTRE        // Autre
}

enum StatutPointage {
   PRESENT
   ABSENT
   RETARD
   CONGE
   MALADIE
   TELETRAVAIL
}

enum StatutPaiementAutomatise {
   CALCULE     // Montant calculé mais pas encore payé
   PARTIEL     // Payé partiellement
   PAYE        // Payé intégralement
   ANNULE      // Annulé
}
```

### `package.json`
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "npx tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@prisma/client": "^6.16.2",
    "@types/html-pdf-node": "^1.0.2",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/puppeteer": "^5.4.7",
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "helmet": "^8.1.0",
    "html-pdf-node": "^1.0.8",
    "jsonwebtoken": "^9.0.2",
    "puppeteer": "^24.22.3",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.9",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/node": "^24.5.2",
    "nodemon": "^3.1.10",
    "prisma": "^6.16.2",
    "tsx": "^4.20.6",
    "typescript": "^5.9.2"
  }
}
```

## Zod Validations

**Employee Schema** (`src/validator/employe.validator.ts`):
```typescript
import { z } from 'zod';

export const creerEmployeSchema = z.object({
  codeEmploye: z.string().min(1, 'Code employé requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  poste: z.string().min(1, 'Poste requis'),
  typeContrat: z.enum(['JOURNALIER', 'FIXE', 'HONORAIRE']),
  salaireBase: z.number().positive().optional(),
  tauxJournalier: z.number().positive().optional(),
  compteBancaire: z.string().optional(),
  dateEmbauche: z.string().transform(str => new Date(str)),
  entrepriseId: z.number()
});

export const modifierEmployeSchema = z.object({
  id: z.number(),
  codeEmploye: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  poste: z.string().min(1).optional(),
  typeContrat: z.enum(['JOURNALIER', 'FIXE', 'HONORAIRE']).optional(),
  salaireBase: z.number().positive().optional(),
  tauxJournalier: z.number().positive().optional(),
  compteBancaire: z.string().optional(),
  estActif: z.boolean().optional()
});
```

## API Examples

### Create Employee
```bash
curl -X POST http://localhost:3000/api/entreprises/1/employes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codeEmploye": "EMP001",
    "prenom": "John",
    "nom": "Doe",
    "email": "john@example.com",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 500000,
    "dateEmbauche": "2024-01-01"
  }'
```

### Record Time Tracking
```bash
curl -X POST http://localhost:3000/api/pointages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeId": 1,
    "date": "2024-10-04",
    "heureArrivee": "2024-10-04T08:00:00Z",
    "heureDepart": "2024-10-04T17:00:00Z",
    "statut": "PRESENT"
  }'
```

## Tests

Example test for employee creation:
```typescript
// tests/employe.test.ts
import { EmployeService } from '../src/services/employe.service';

describe('EmployeService', () => {
  let service: EmployeService;

  beforeEach(() => {
    service = new EmployeService();
  });

  it('should create an employee', async () => {
    const employeData = {
      codeEmploye: 'EMP001',
      prenom: 'John',
      nom: 'Doe',
      poste: 'Développeur',
      typeContrat: 'FIXE' as const,
      salaireBase: 500000,
      dateEmbauche: new Date('2024-01-01'),
      entrepriseId: 1
    };

    const employe = await service.creer(employeData, 1);
    expect(employe.codeEmploye).toBe('EMP001');
    expect(employe.prenom).toBe('John');
  });
});
```

## Best Practices & Security

- Password hashing with bcryptjs
- JWT authentication with expiration
- Input validation with Zod
- Role-based access control (SUPER_ADMIN, ADMIN, CAISSIER)
- CORS configuration
- Helmet for security headers
- Request logging and error handling

## Complete Scenario

1. SUPER_ADMIN creates a company and users (ADMIN, CAISSIER)
2. ADMIN creates employees with different contract types
3. Employees record their attendance via time tracking
4. System automatically calculates payroll based on contract type and attendance
5. ADMIN creates pay cycle and generates pay slips
6. CAISSIER processes payments and sends notifications
7. System maintains complete history of all operations

This provides a complete payroll management solution for businesses.

## Complete API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/connexion` - User login (alias)
- `POST /api/auth/inscription` - User registration
- `POST /api/auth/deconnexion` - User logout
- `GET /api/auth/profil` - Get user profile
- `GET /api/auth/me` - Get user profile (alias)

### Employees
- `GET /api/entreprises/:entrepriseId/employes` - List employees by company
- `POST /api/entreprises/:entrepriseId/employes` - Create employee
- `GET /api/entreprises/:entrepriseId/employes/statistiques` - Get employee statistics
- `GET /api/employes/:id` - Get employee by ID
- `PUT /api/employes/:id` - Update employee
- `DELETE /api/employes/:id` - Delete employee
- `POST /api/employes/:id/activer` - Activate employee
- `POST /api/employes/:id/desactiver` - Deactivate employee
- `PUT /api/employes/:id/toggle` - Toggle employee active status
- `POST /api/employes` - Create employee (for ADMIN)
- `GET /api/employes` - List employees (for ADMIN/CAISSIER)

### Time Tracking (Pointages)
- `POST /api/pointages/arrivee` - Record arrival
- `POST /api/pointages/depart` - Record departure
- `POST /api/pointages/absence` - Record absence
- `GET /api/entreprises/:entrepriseId/pointages` - List time tracking by company
- `GET /api/entreprises/:entrepriseId/pointages/export` - Export time tracking data

### Automatic Payments
- `POST /api/paiements/calculer/:employeId` - Calculate payment for employee
- `POST /api/paiements/enregistrer/:employeId` - Register automatic payment
- `GET /api/entreprises/:entrepriseId/paiements-automatises` - Get automatic payments by company
- `GET /api/paiements/:paiementId` - Get payment details
- `PUT /api/paiements/:paiementId/marquer-paye` - Mark payment as paid

### Pay Cycles
- `GET /api/entreprises/:entrepriseId/cycles-paie` - List pay cycles by company
- `POST /api/entreprises/:entrepriseId/cycles-paie` - Create pay cycle
- `GET /api/cycles-paie/:id` - Get pay cycle by ID
- `PUT /api/cycles-paie/:id` - Update pay cycle
- `DELETE /api/cycles-paie/:id` - Delete pay cycle
- `POST /api/cycles-paie/:id/approuver` - Approve pay cycle
- `POST /api/cycles-paie/:id/cloturer` - Close pay cycle

### Pay Slips
- `GET /api/cycles-paie/:cyclePaieId/bulletins-paie` - List pay slips by cycle
- `POST /api/cycles-paie/:cyclePaieId/bulletins-paie` - Create pay slip
- `GET /api/bulletins-paie/:id` - Get pay slip by ID
- `PUT /api/bulletins-paie/:id` - Update pay slip
- `DELETE /api/bulletins-paie/:id` - Delete pay slip
- `POST /api/bulletins-paie/:id/generer-pdf` - Generate PDF pay slip
- `GET /api/employes/:employeId/bulletins-paie` - List pay slips by employee

### Payments
- `GET /api/bulletins-paie/:bulletinPaieId/paiements` - List payments by pay slip
- `POST /api/bulletins-paie/:bulletinPaieId/paiements` - Create payment
- `GET /api/paiements/:id` - Get payment by ID
- `PUT /api/paiements/:id` - Update payment
- `DELETE /api/paiements/:id` - Delete payment

### Companies
- `GET /api/entreprises` - List companies
- `POST /api/entreprises` - Create company
- `GET /api/entreprises/:id` - Get company by ID
- `PUT /api/entreprises/:id` - Update company
- `DELETE /api/entreprises/:id` - Delete company

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/entreprise/:entrepriseId` - Get company dashboard

### Admin
- `GET /api/admin/utilisateurs` - List all users
- `POST /api/admin/utilisateurs` - Create user
- `GET /api/admin/utilisateurs/:id` - Get user by ID
- `PUT /api/admin/utilisateurs/:id` - Update user
- `DELETE /api/admin/utilisateurs/:id` - Delete user

### Authorizations
- `GET /api/autorisations/:entrepriseId` - Get company authorizations
- `PUT /api/autorisations/:entrepriseId` - Update company authorizations
