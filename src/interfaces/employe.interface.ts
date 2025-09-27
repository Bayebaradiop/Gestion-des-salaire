import type { TypeContrat as PrismaTypeContrat } from '@prisma/client';

export type TypeContrat = PrismaTypeContrat;

export interface CreerEmployeDto {
  codeEmploye: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  poste: string;
  typeContrat: TypeContrat;
  salaireBase?: number;
  tauxJournalier?: number;
  compteBancaire?: string;
  dateEmbauche: string; // Format ISO
}

export interface ModifierEmployeDto {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  poste?: string;
  typeContrat?: TypeContrat;
  salaireBase?: number;
  tauxJournalier?: number;
  compteBancaire?: string;
  estActif?: boolean;
}

export interface FiltreEmployeDto {
  typeContrat?: TypeContrat;
  poste?: string;
  estActif?: boolean;
  recherche?: string; // Recherche dans nom/prénom/email
}