import { z } from 'zod';

/**
 * Validators pour les formulaires utilisateur côté frontend
 */

// Schema pour la création d'utilisateur
export const createUserSchema = z.object({
  nom: z.string()
    .min(1, "Le nom est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  prenom: z.string()
    .min(1, "Le prénom est obligatoire")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),

  email: z.string()
    .min(1, "L'email est obligatoire")
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),

  role: z.enum(['ADMIN', 'CAISSIER'], {
    errorMap: () => ({ message: "Le rôle doit être ADMIN ou CAISSIER" })
  }),

  motDePasse: z.string()
    .min(1, "Le mot de passe est obligatoire")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(50, "Le mot de passe ne peut pas dépasser 50 caractères"),

  estActif: z.boolean().default(true)
});

// Schema pour la modification d'utilisateur
export const updateUserSchema = z.object({
  nom: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .optional(),

  prenom: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .optional(),

  email: z.string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .optional(),

  role: z.enum(['ADMIN', 'CAISSIER'], {
    errorMap: () => ({ message: "Le rôle doit être ADMIN ou CAISSIER" })
  }).optional(),

  motDePasse: z.string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(50, "Le mot de passe ne peut pas dépasser 50 caractères")
    .optional(),

  estActif: z.boolean().optional()
});

// Les types peuvent être inférés avec z.infer si nécessaire