import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * ================================
 * SCHÉMAS DE VALIDATION FRONTEND
 * Application Gestion des Salaires - React Hook Form + Yup
 * ================================
 */

// ================================
// EXPRESSIONS RÉGULIÈRES
// ================================

const phoneRegex = /^(\+221|221)?[0-9]{9}$/; // Format sénégalais
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

// ================================
// MESSAGES D'ERREUR PERSONNALISÉS
// ================================

const MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  EMAIL_INVALID: 'Veuillez entrer un email valide',
  PHONE_INVALID: 'Format de téléphone invalide (ex: +221701234567 ou 701234567)',
  PASSWORD_WEAK: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial',
  NAME_INVALID: 'Ne peut contenir que des lettres, espaces, apostrophes et tirets',
  POSITIVE_NUMBER: 'Doit être un nombre positif',
  SALARY_INVALID: 'Le salaire doit être supérieur à 0',
  MIN_LENGTH: (min) => `Doit contenir au moins ${min} caractères`,
  MAX_LENGTH: (max) => `Ne peut pas dépasser ${max} caractères`,
  PASSWORDS_NOT_MATCH: 'Les mots de passe ne correspondent pas',
  FUTURE_DATE: 'La date ne peut pas être dans le futur',
  DATE_INVALID: 'Date invalide'
};

// ================================
// SCHÉMAS DE VALIDATION UTILISATEURS
// ================================

export const userValidationSchema = yup.object({
  prenom: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(50, MESSAGES.MAX_LENGTH(50))
    .matches(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  nom: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(50, MESSAGES.MAX_LENGTH(50))
    .matches(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  email: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .max(100, MESSAGES.MAX_LENGTH(100))
    .lowercase()
    .trim(),
  
  telephone: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .matches(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim(),
  
  motDePasse: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .matches(passwordRegex, MESSAGES.PASSWORD_WEAK),
  
  role: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['SUPER_ADMIN', 'ADMIN', 'CAISSIER'], 'Le rôle doit être SUPER_ADMIN, ADMIN ou CAISSIER'),
  
  entrepriseId: yup
    .number()
    .nullable()
    .positive('L\'ID de l\'entreprise doit être positif')
    .integer('L\'ID de l\'entreprise doit être un entier'),
  
  estActif: yup.boolean().default(true)
});

export const updateUserValidationSchema = userValidationSchema.omit(['motDePasse']).shape({
  motDePasse: yup
    .string()
    .matches(passwordRegex, MESSAGES.PASSWORD_WEAK)
    .notRequired()
});

export const changePasswordValidationSchema = yup.object({
  motDePasseActuel: yup
    .string()
    .required('Le mot de passe actuel est requis'),
  
  nouveauMotDePasse: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .matches(passwordRegex, MESSAGES.PASSWORD_WEAK),
  
  confirmerMotDePasse: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf([yup.ref('nouveauMotDePasse')], MESSAGES.PASSWORDS_NOT_MATCH)
});

// ================================
// SCHÉMAS DE VALIDATION ENTREPRISES
// ================================

export const entrepriseValidationSchema = yup.object({
  nom: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(100, MESSAGES.MAX_LENGTH(100))
    .trim(),
  
  logo: yup
    .string()
    .nullable()
    .test('logo-format', 'Le logo doit être une URL valide ou une image uploadée', (value) => {
      if (!value) return true;
      return value.startsWith('http') || 
             value.startsWith('/uploads/') || 
             value.startsWith('data:image/');
    }),
  
  adresse: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(10, MESSAGES.MIN_LENGTH(10))
    .max(200, MESSAGES.MAX_LENGTH(200))
    .trim(),
  
  telephone: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .matches(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim(),
  
  email: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .max(100, MESSAGES.MAX_LENGTH(100))
    .lowercase()
    .trim(),
  
  devise: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['XOF', 'EUR', 'USD', 'CFA'], 'La devise doit être XOF, EUR, USD ou CFA')
    .default('XOF'),
  
  periodePaie: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE'], 'La période de paie doit être MENSUELLE, HEBDOMADAIRE ou JOURNALIERE')
    .default('MENSUELLE'),
  
  estActif: yup.boolean().default(true)
});

export const updateEntrepriseValidationSchema = entrepriseValidationSchema.partial();

// ================================
// SCHÉMAS DE VALIDATION EMPLOYÉS
// ================================

export const employeValidationSchema = yup.object({
  prenom: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(50, MESSAGES.MAX_LENGTH(50))
    .matches(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  nom: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(50, MESSAGES.MAX_LENGTH(50))
    .matches(nameRegex, MESSAGES.NAME_INVALID)
    .trim(),
  
  email: yup
    .string()
    .nullable()
    .email(MESSAGES.EMAIL_INVALID)
    .max(100, MESSAGES.MAX_LENGTH(100))
    .lowercase()
    .trim(),
  
  telephone: yup
    .string()
    .nullable()
    .matches(phoneRegex, MESSAGES.PHONE_INVALID)
    .trim(),
  
  poste: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(2, MESSAGES.MIN_LENGTH(2))
    .max(100, MESSAGES.MAX_LENGTH(100))
    .trim(),
  
  typeContrat: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['FIXE', 'JOURNALIER', 'HONORAIRE'], 'Le type de contrat doit être FIXE, JOURNALIER ou HONORAIRE'),
  
  salaireBase: yup
    .number()
    .nullable()
    .positive(MESSAGES.SALARY_INVALID)
    .when('typeContrat', {
      is: (val) => val === 'FIXE' || val === 'HONORAIRE',
      then: (schema) => schema.required('Le salaire de base est requis pour ce type de contrat'),
      otherwise: (schema) => schema.nullable()
    }),
  
  tauxJournalier: yup
    .number()
    .nullable()
    .positive(MESSAGES.SALARY_INVALID)
    .when('typeContrat', {
      is: 'JOURNALIER',
      then: (schema) => schema.required('Le taux journalier est requis pour ce type de contrat'),
      otherwise: (schema) => schema.nullable()
    }),
  
  compteBancaire: yup
    .string()
    .nullable()
    .matches(/^[0-9A-Z\s-]+$/, 'Format de compte bancaire invalide')
    .max(50, MESSAGES.MAX_LENGTH(50))
    .trim(),
  
  dateEmbauche: yup
    .date()
    .required(MESSAGES.REQUIRED)
    .max(new Date(), MESSAGES.FUTURE_DATE)
    .typeError(MESSAGES.DATE_INVALID),
  
  entrepriseId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID de l\'entreprise doit être positif')
    .integer('L\'ID de l\'entreprise doit être un entier'),
  
  estActif: yup.boolean().default(true)
});

export const updateEmployeValidationSchema = employeValidationSchema.omit(['entrepriseId', 'dateEmbauche']);

// ================================
// SCHÉMAS DE VALIDATION CYCLES DE PAIE
// ================================

export const cyclePaieValidationSchema = yup.object({
  titre: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .min(5, MESSAGES.MIN_LENGTH(5))
    .max(100, MESSAGES.MAX_LENGTH(100))
    .trim(),
  
  periode: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .matches(/^\d{4}-\d{2}$/, 'La période doit être au format YYYY-MM (ex: 2024-01)'),
  
  dateDebut: yup
    .date()
    .required(MESSAGES.REQUIRED)
    .typeError(MESSAGES.DATE_INVALID),
  
  dateFin: yup
    .date()
    .required(MESSAGES.REQUIRED)
    .min(yup.ref('dateDebut'), 'La date de fin doit être postérieure à la date de début')
    .typeError(MESSAGES.DATE_INVALID),
  
  joursOuvrables: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .integer('Le nombre de jours ouvrables doit être un entier')
    .min(1, 'Le nombre de jours ouvrables doit être au moins 1')
    .max(31, 'Le nombre de jours ouvrables ne peut pas dépasser 31'),
  
  entrepriseId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID de l\'entreprise doit être positif')
    .integer('L\'ID de l\'entreprise doit être un entier'),
  
  statut: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['BROUILLON', 'APPROUVE', 'CLOTURE'], 'Le statut doit être BROUILLON, APPROUVE ou CLOTURE')
    .default('BROUILLON')
});

export const updateCyclePaieValidationSchema = cyclePaieValidationSchema.omit(['entrepriseId']);

// ================================
// SCHÉMAS DE VALIDATION BULLETINS DE PAIE
// ================================

export const bulletinPaieValidationSchema = yup.object({
  employeId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID de l\'employé doit être positif')
    .integer('L\'ID de l\'employé doit être un entier'),
  
  cyclePaieId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID du cycle de paie doit être positif')
    .integer('L\'ID du cycle de paie doit être un entier'),
  
  salaireBrut: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('Le salaire brut doit être supérieur à 0'),
  
  deductions: yup
    .number()
    .min(0, 'Les déductions ne peuvent pas être négatives')
    .max(yup.ref('salaireBrut'), 'Les déductions ne peuvent pas dépasser le salaire brut')
    .default(0),
  
  primes: yup
    .number()
    .min(0, 'Les primes ne peuvent pas être négatives')
    .default(0),
  
  salaireNet: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .min(0, 'Le salaire net ne peut pas être négatif')
    .test('salary-calculation', 'Le salaire net doit être égal au salaire brut moins les déductions plus les primes', function(value) {
      const { salaireBrut, deductions = 0, primes = 0 } = this.parent;
      const expectedNet = salaireBrut - deductions + primes;
      return Math.abs(value - expectedNet) < 0.01; // Tolérance pour les erreurs d'arrondi
    }),
  
  joursPayes: yup
    .number()
    .nullable()
    .integer('Le nombre de jours payés doit être un entier')
    .min(0, 'Le nombre de jours payés ne peut pas être négatif'),
  
  heuresSupplementaires: yup
    .number()
    .min(0, 'Les heures supplémentaires ne peuvent pas être négatives')
    .default(0),
  
  statut: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['EN_ATTENTE', 'PARTIEL', 'PAYE'], 'Le statut doit être EN_ATTENTE, PARTIEL ou PAYE')
    .default('EN_ATTENTE')
});

export const updateBulletinPaieValidationSchema = bulletinPaieValidationSchema.omit(['employeId', 'cyclePaieId']);

// ================================
// SCHÉMAS DE VALIDATION PAIEMENTS
// ================================

export const paiementValidationSchema = yup.object({
  bulletinPaieId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID du bulletin de paie doit être positif')
    .integer('L\'ID du bulletin de paie doit être un entier'),
  
  montant: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('Le montant payé doit être supérieur à 0'),
  
  methodePaiement: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .oneOf(['ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE', 'AUTRE'], 'La méthode de paiement doit être ESPECES, VIREMENT_BANCAIRE, ORANGE_MONEY, WAVE ou AUTRE'),
  
  reference: yup
    .string()
    .nullable()
    .max(100, MESSAGES.MAX_LENGTH(100))
    .trim(),
  
  notes: yup
    .string()
    .nullable()
    .max(500, MESSAGES.MAX_LENGTH(500))
    .trim(),
  
  datePaiement: yup
    .date()
    .nullable()
    .max(new Date(), MESSAGES.FUTURE_DATE)
    .typeError(MESSAGES.DATE_INVALID),
  
  traiteParId: yup
    .number()
    .required(MESSAGES.REQUIRED)
    .positive('L\'ID de l\'utilisateur doit être positif')
    .integer('L\'ID de l\'utilisateur doit être un entier')
});

export const updatePaiementValidationSchema = paiementValidationSchema.omit(['bulletinPaieId', 'traiteParId']);

// ================================
// SCHÉMAS DE VALIDATION AUTHENTIFICATION
// ================================

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .lowercase()
    .trim(),
  
  motDePasse: yup
    .string()
    .required('Le mot de passe est requis')
});

export const resetPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .required(MESSAGES.REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .lowercase()
    .trim()
});

// ================================
// HELPERS POUR REACT HOOK FORM
// ================================

/**
 * Configuration par défaut pour React Hook Form
 */
export const getFormConfig = (schema) => ({
  resolver: yupResolver(schema),
  mode: 'onChange', // Validation en temps réel
  reValidateMode: 'onChange'
});

/**
 * Helper pour extraire les messages d'erreur du serveur
 * et les formater pour React Hook Form
 */
export const formatServerErrors = (serverErrors) => {
  const formattedErrors = {};
  
  if (serverErrors && typeof serverErrors === 'object') {
    Object.keys(serverErrors).forEach(field => {
      formattedErrors[field] = {
        type: 'server',
        message: serverErrors[field]
      };
    });
  }
  
  return formattedErrors;
};

/**
 * Hook personnalisé pour gérer les erreurs serveur
 */
export const useServerErrors = (setError, clearErrors) => {
  const handleServerErrors = (errors) => {
    if (clearErrors) clearErrors();
    
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        setError(field, {
          type: 'server',
          message: errors[field]
        });
      });
    }
  };

  return { handleServerErrors };
};

// ================================
// EXPORTS POUR L'UTILISATION DANS LES COMPOSANTS
// ================================

// Les types TypeScript seraient définis dans un fichier .d.ts séparé si nécessaire