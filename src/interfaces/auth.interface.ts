import type { RoleUtilisateur as PrismaRoleUtilisateur } from '@prisma/client';

export type RoleUtilisateur = PrismaRoleUtilisateur;

export interface ConnexionDto {
  email: string;
  motDePasse: string;
}

export interface InscriptionDto {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  entrepriseId?: number; // Optionnel pour super admin
}

export interface TokenPayload {
  id: number;
  email: string;
  role: RoleUtilisateur;
  entrepriseId?: number;
}

export interface ReponseAuth {
  utilisateur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
    role: RoleUtilisateur;
    entrepriseId?: number;
  };
  token: string;
}