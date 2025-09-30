import { z } from 'zod';

/**
 * Validators pour les formulaires employé côté frontend
 */

// Schema pour la création d'employé
export const createEmployeSchema = z.object({
  nom: z.string()
    .min(1, "Le nom est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),

  prenom: z.string()
    .min(1, "Le prénom est obligatoire")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets"),

  email: z.string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),

  telephone: z.string()
    .regex(/^\+?[0-9]{8,15}$/, "Format de téléphone invalide (8-15 chiffres, + optionnel)")
    .optional()
    .or(z.literal("")),

  poste: z.string()
    .min(1, "Le poste est obligatoire")
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne peut pas dépasser 100 caractères"),

  typeContrat: z.enum(['FIXE', 'JOURNALIER', 'HONORAIRE'], {
    errorMap: () => ({ message: "Type de contrat invalide" })
  }),

  salaireBase: z.number()
    .min(0, "Le salaire de base doit être positif ou nul")
    .optional(),

  tauxJournalier: z.number()
    .min(0, "Le taux journalier doit être positif ou nul")
    .optional(),

  dateEmbauche: z.string()
    .min(1, "La date d'embauche est requise")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),

  estActif: z.boolean().default(true)
}).refine((data) => {
  // Validation conditionnelle selon le type de contrat
  if (data.typeContrat === 'FIXE' && (!data.salaireBase || data.salaireBase <= 0)) {
    return false;
  }
  if ((data.typeContrat === 'JOURNALIER' || data.typeContrat === 'HONORAIRE') && (!data.tauxJournalier || data.tauxJournalier <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Salaire de base requis pour FIXE, taux journalier requis pour JOURNALIER/HONORAIRE"
});

// Schema pour la modification d'employé
export const updateEmployeSchema = createEmployeSchema.partial();

// Les types peuvent être inférés avec z.infer si nécessaire