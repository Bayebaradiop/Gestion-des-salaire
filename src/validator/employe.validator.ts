import { z } from 'zod';

/**
 * Validators pour la gestion des employés
 * Conformément aux exigences pour le formulaire d'ajout d'employé
 */

// Validation de la date (doit être antérieure ou égale à aujourd'hui)
const dateEmbaucheValidation = z.string()
  .min(1, "La date d'embauche est requise")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
  .refine((date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin de journée pour permettre la date d'aujourd'hui
    return inputDate <= today;
  }, "La date d'embauche ne peut pas être dans le futur");

// Validation IBAN française et internationale
const ibanValidation = z.string()
  .trim()
  .optional()
  .refine((iban) => {
    if (!iban) return true; // Optionnel
    // Supprimer les espaces
    const cleanIban = iban.replace(/\s/g, '');
    // Vérifier le format de base (2 lettres + 2 chiffres + jusqu'à 30 caractères alphanumériques)
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleanIban);
  }, "Format IBAN invalide (ex: FR14 2004 1010 0505 0001 3M02 606)");

// Schema pour la création d'employé
export const creerEmployeSchema = z.object({
  email: z.string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer un email valide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .trim(),
  
  prenom: z.string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres uniquement")
    .trim(),
  
  nom: z.string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres uniquement")
    .trim(),
  
  poste: z.string()
    .min(1, "Le poste est requis")
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne peut pas dépasser 100 caractères")
    .trim(),
  
  typeContrat: z.enum(['FIXE', 'JOURNALIER', 'HONORAIRE'], {
    message: "Type de contrat requis (fixe, journalier, honoraire)"
  }),
  
  salaireBase: z.number()
    .positive("Le salaire doit être supérieur à 0")
    .optional(),
  
  tauxJournalier: z.number()
    .positive("Le taux journalier doit être supérieur à 0")
    .optional(),
    
  tauxHoraire: z.number()
    .positive("Le taux horaire doit être supérieur à 0")
    .optional(),
  
  dateEmbauche: dateEmbaucheValidation,
  
  compteBancaire: ibanValidation,
  
  telephone: z.string()
    .min(1, "Le téléphone est requis")
    .regex(/^\+221[0-9]{9}$/, "Format téléphone invalide (+221XXXXXXXXX)")
    .trim(),
  
  estActif: z.boolean().default(true),
  
  entrepriseId: z.number()
    .int("L'ID entreprise doit être un entier")
    .positive("L'ID entreprise doit être positif")
}).refine((data) => {
  // Validation conditionnelle selon le type de contrat
  if (data.typeContrat === 'FIXE' && (!data.salaireBase || data.salaireBase <= 0)) {
    return false;
  }
  if (data.typeContrat === 'JOURNALIER' && (!data.tauxJournalier || data.tauxJournalier <= 0)) {
    return false;
  }
  if (data.typeContrat === 'HONORAIRE' && (!data.tauxHoraire || data.tauxHoraire <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Le salaire de base est requis pour les contrats fixes, le taux journalier pour les journaliers, et le taux horaire pour les honoraires",
  path: ["salaireBase", "tauxJournalier", "tauxHoraire"] // Indiquer les champs concernés
});

// Schema pour la modification d'employé
export const modifierEmployeSchema = creerEmployeSchema.partial().extend({
  id: z.number().int().positive()
});

// Schema pour les paramètres de requête
export const employeParamsSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "L'ID doit être un nombre")
    .transform(Number)
    .refine(val => val > 0, "L'ID doit être positif")
});

// Types dérivés
export type CreerEmployeDto = z.infer<typeof creerEmployeSchema>;
export type ModifierEmployeDto = z.infer<typeof modifierEmployeSchema>;
export type EmployeParamsDto = z.infer<typeof employeParamsSchema>;
