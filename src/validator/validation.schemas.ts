import { z } from 'zod';

/**
 * ================================
 * SCHÉMAS DE VALIDATION COMPLETS
 * Application Gestion des Salaires
 * ================================
 */

// ================================
// SCHÉMAS COMMUNS
// ================================

const phoneRegex = /^(\+221|221)?[0-9]{9}$/; // Format sénégalais
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Messages d'erreur personnalisés
const MESSAGES = {
  REQUIRED: "Ce champ est obligatoire",
  EMAIL_INVALID: "Veuillez entrer un email valide",
  EMAIL_EXISTS: "Cet email est déjà utilisé",
  PHONE_INVALID: "Format de téléphone invalide (ex: +221701234567 ou 701234567)",
  PHONE_EXISTS: "Ce numéro de téléphone est déjà utilisé",
  PASSWORD_WEAK: "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial",
  NAME_INVALID: "Ne peut contenir que des lettres, espaces, apostrophes et tirets",
  POSITIVE_NUMBER: "Doit être un nombre positif",
  SALARY_INVALID: "Le salaire doit être supérieur à 0",
  NAME_EXISTS: "Ce nom est déjà utilisé"
};

// ================================
// VALIDATION UTILISATEURS
// ================================

export const creerUtilisateurSchema = z.object({
  prenom: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  nom: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  email: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(emailRegex, MESSAGES.EMAIL_INVALID)
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .transform(email => email.toLowerCase().trim()),
  
  telephone: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim(),
  
  motDePasse: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(passwordRegex, MESSAGES.PASSWORD_WEAK),
  
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CAISSIER'], {
    message: "Le rôle doit être SUPER_ADMIN, ADMIN ou CAISSIER"
  }),
  
  entrepriseId: z.number()
    .int("L'ID de l'entreprise doit être un entier")
    .positive("L'ID de l'entreprise doit être positif")
    .optional()
    .nullable(),
  
  estActif: z.boolean().default(true)
});

export const modifierUtilisateurSchema = creerUtilisateurSchema.partial().omit({
  motDePasse: true
}).extend({
  motDePasse: z.string()
    .regex(passwordRegex, MESSAGES.PASSWORD_WEAK)
    .optional()
});

export const changerMotDePasseSchema = z.object({
  motDePasseActuel: z.string().min(1, "Le mot de passe actuel est requis"),
  nouveauMotDePasse: z.string().regex(passwordRegex, MESSAGES.PASSWORD_WEAK),
  confirmerMotDePasse: z.string()
}).refine(data => data.nouveauMotDePasse === data.confirmerMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmerMotDePasse"]
});

// ================================
// VALIDATION ENTREPRISES
// ================================

export const creerEntrepriseSchema = z.object({
  nom: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
  
  logo: z.string()
    .refine(
      (value) => {
        if (!value) return true;
        return value.startsWith('http') || 
               value.startsWith('/uploads/') || 
               value.startsWith('data:image/');
      }, 
      "Le logo doit être une URL valide ou une image uploadée"
    )
    .optional(),
  
  adresse: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(10, "L'adresse doit contenir au moins 10 caractères")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .trim(),
  
  telephone: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim(),
  
  email: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(emailRegex, MESSAGES.EMAIL_INVALID)
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .transform(email => email.toLowerCase().trim()),
  
  devise: z.enum(['XOF', 'EUR', 'USD', 'CFA'], {
    message: "La devise doit être XOF, EUR, USD ou CFA"
  }).default('XOF'),
  
  periodePaie: z.enum(['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE'], {
    message: "La période de paie doit être MENSUELLE, HEBDOMADAIRE ou JOURNALIERE"
  }).default('MENSUELLE'),
  
  estActif: z.boolean().default(true)
});

export const modifierEntrepriseSchema = creerEntrepriseSchema.partial();

// ================================
// VALIDATION EMPLOYÉS
// ================================

export const creerEmployeSchema = z.object({
  prenom: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  nom: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  email: z.string()
    .regex(emailRegex, MESSAGES.EMAIL_INVALID)
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .transform(email => email.toLowerCase().trim())
    .optional(),
  
  telephone: z.string()
    .regex(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim()
    .optional(),
  
  poste: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne peut pas dépasser 100 caractères")
    .trim(),
  
  typeContrat: z.enum(['FIXE', 'JOURNALIER', 'HONORAIRE'], {
    message: "Le type de contrat doit être FIXE, JOURNALIER ou HONORAIRE"
  }),
  
  salaireBase: z.number()
    .positive(MESSAGES.SALARY_INVALID)
    .optional(),
  
  tauxJournalier: z.number()
    .positive(MESSAGES.SALARY_INVALID)
    .optional(),
  
  compteBancaire: z.string()
    .regex(/^[0-9A-Z\s-]+$/, "Format de compte bancaire invalide")
    .max(50, "Le compte bancaire ne peut pas dépasser 50 caractères")
    .trim()
    .optional(),
  
  dateEmbauche: z.string()
    .datetime("Date d'embauche invalide")
    .refine(date => new Date(date) <= new Date(), {
      message: "La date d'embauche ne peut pas être dans le futur"
    }),
  
  entrepriseId: z.number()
    .int("L'ID de l'entreprise doit être un entier")
    .positive("L'ID de l'entreprise doit être positif"),
  
  estActif: z.boolean().default(true)
})
.refine(data => {
  // Validation logique : salaire base OU taux journalier selon le type de contrat
  if (data.typeContrat === 'JOURNALIER') {
    return data.tauxJournalier && data.tauxJournalier > 0;
  } else {
    return data.salaireBase && data.salaireBase > 0;
  }
}, {
  message: "Le salaire de base est requis pour les contrats FIXE et HONORAIRE, le taux journalier pour les contrats JOURNALIER",
  path: ["salaireBase"]
});

export const modifierEmployeSchema = creerEmployeSchema.partial().omit({
  entrepriseId: true,
  dateEmbauche: true
});

// ================================
// VALIDATION CYCLES DE PAIE
// ================================

export const creerCyclePaieSchema = z.object({
  titre: z.string()
    .min(1, MESSAGES.REQUIRED)
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères")
    .trim(),
  
  periode: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(/^\d{4}-\d{2}$/, "La période doit être au format YYYY-MM (ex: 2024-01)"),
  
  dateDebut: z.string()
    .datetime("Date de début invalide"),
  
  dateFin: z.string()
    .datetime("Date de fin invalide"),
  
  joursOuvrables: z.number()
    .int("Le nombre de jours ouvrables doit être un entier")
    .min(1, "Le nombre de jours ouvrables doit être au moins 1")
    .max(31, "Le nombre de jours ouvrables ne peut pas dépasser 31"),
  
  entrepriseId: z.number()
    .int("L'ID de l'entreprise doit être un entier")
    .positive("L'ID de l'entreprise doit être positif"),
  
  statut: z.enum(['BROUILLON', 'APPROUVE', 'CLOTURE'], {
    message: "Le statut doit être BROUILLON, APPROUVE ou CLOTURE"
  }).default('BROUILLON')
})
.refine(data => new Date(data.dateDebut) < new Date(data.dateFin), {
  message: "La date de début doit être antérieure à la date de fin",
  path: ["dateFin"]
});

export const modifierCyclePaieSchema = creerCyclePaieSchema.partial().omit({
  entrepriseId: true
});

// ================================
// VALIDATION BULLETINS DE PAIE
// ================================

export const creerBulletinPaieSchema = z.object({
  employeId: z.number()
    .int("L'ID de l'employé doit être un entier")
    .positive("L'ID de l'employé doit être positif"),
  
  cyclePaieId: z.number()
    .int("L'ID du cycle de paie doit être un entier")
    .positive("L'ID du cycle de paie doit être positif"),
  
  salaireBrut: z.number()
    .positive("Le salaire brut doit être supérieur à 0"),
  
  deductions: z.number()
    .min(0, "Les déductions ne peuvent pas être négatives")
    .default(0),
  
  salaireNet: z.number()
    .min(0, "Le salaire net ne peut pas être négatif"),
  
  joursPayes: z.number()
    .int("Le nombre de jours payés doit être un entier")
    .min(0, "Le nombre de jours payés ne peut pas être négatif")
    .optional(),
  
  heuresSupplementaires: z.number()
    .min(0, "Les heures supplémentaires ne peuvent pas être négatives")
    .default(0),
  
  primes: z.number()
    .min(0, "Les primes ne peuvent pas être négatives")
    .default(0),
  
  statut: z.enum(['EN_ATTENTE', 'PARTIEL', 'PAYE'], {
    message: "Le statut doit être EN_ATTENTE, PARTIEL ou PAYE"
  }).default('EN_ATTENTE')
})
.refine(data => data.deductions <= data.salaireBrut, {
  message: "Les déductions ne peuvent pas dépasser le salaire brut",
  path: ["deductions"]
})
.refine(data => data.salaireNet === (data.salaireBrut - data.deductions + data.primes), {
  message: "Le salaire net doit être égal au salaire brut moins les déductions plus les primes",
  path: ["salaireNet"]
});

export const modifierBulletinPaieSchema = creerBulletinPaieSchema.partial().omit({
  employeId: true,
  cyclePaieId: true
});

// ================================
// VALIDATION PAIEMENTS
// ================================

export const creerPaiementSchema = z.object({
  bulletinPaieId: z.number()
    .int("L'ID du bulletin de paie doit être un entier")
    .positive("L'ID du bulletin de paie doit être positif"),
  
  montant: z.number()
    .positive("Le montant payé doit être supérieur à 0"),
  
  methodePaiement: z.enum(['ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE', 'AUTRE'], {
    message: "La méthode de paiement doit être ESPECES, VIREMENT_BANCAIRE, ORANGE_MONEY, WAVE ou AUTRE"
  }),
  
  reference: z.string()
    .max(100, "La référence ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),
  
  notes: z.string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères")
    .trim()
    .optional(),
  
  datePaiement: z.string()
    .datetime("Date de paiement invalide")
    .refine(date => new Date(date) <= new Date(), {
      message: "La date de paiement ne peut pas être dans le futur"
    })
    .optional(),
  
  traiteParId: z.number()
    .int("L'ID de l'utilisateur doit être un entier")
    .positive("L'ID de l'utilisateur doit être positif")
});

export const modifierPaiementSchema = creerPaiementSchema.partial().omit({
  bulletinPaieId: true,
  traiteParId: true
});

// ================================
// VALIDATION AUTHENTIFICATION
// ================================

export const connexionSchema = z.object({
  email: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(emailRegex, MESSAGES.EMAIL_INVALID)
    .transform(email => email.toLowerCase().trim()),
  
  motDePasse: z.string()
    .min(1, "Le mot de passe est requis")
});

export const reinitialiserMotDePasseSchema = z.object({
  email: z.string()
    .min(1, MESSAGES.REQUIRED)
    .regex(emailRegex, MESSAGES.EMAIL_INVALID)
    .transform(email => email.toLowerCase().trim())
});

// ================================
// SCHÉMAS POUR LES PARAMÈTRES
// ================================

export const idParamsSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "L'ID doit être un nombre")
    .transform(id => parseInt(id, 10))
});

export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, "La page doit être un nombre")
    .optional()
    .default("1")
    .transform(page => parseInt(page, 10))
    .refine(page => page > 0, "La page doit être supérieure à 0"),
  
  limit: z.string()
    .regex(/^\d+$/, "La limite doit être un nombre")
    .optional()
    .default("10")
    .transform(limit => parseInt(limit, 10))
    .refine(limit => limit > 0 && limit <= 100, "La limite doit être entre 1 et 100")
});

// ================================
// TYPES TYPESCRIPT
// ================================

export type CreerUtilisateurDto = z.infer<typeof creerUtilisateurSchema>;
export type ModifierUtilisateurDto = z.infer<typeof modifierUtilisateurSchema>;
export type CreerEntrepriseDto = z.infer<typeof creerEntrepriseSchema>;
export type ModifierEntrepriseDto = z.infer<typeof modifierEntrepriseSchema>;
export type CreerEmployeDto = z.infer<typeof creerEmployeSchema>;
export type ModifierEmployeDto = z.infer<typeof modifierEmployeSchema>;
export type CreerCyclePaieDto = z.infer<typeof creerCyclePaieSchema>;
export type ModifierCyclePaieDto = z.infer<typeof modifierCyclePaieSchema>;
export type CreerBulletinPaieDto = z.infer<typeof creerBulletinPaieSchema>;
export type ModifierBulletinPaieDto = z.infer<typeof modifierBulletinPaieSchema>;
export type CreerPaiementDto = z.infer<typeof creerPaiementSchema>;
export type ModifierPaiementDto = z.infer<typeof modifierPaiementSchema>;
export type ConnexionDto = z.infer<typeof connexionSchema>;
export type IdParamsDto = z.infer<typeof idParamsSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;