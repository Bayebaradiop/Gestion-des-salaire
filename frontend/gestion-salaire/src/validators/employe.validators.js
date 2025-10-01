import * as yup from 'yup';

/**
 * Schémas de validation frontend pour les employés
 * Utilise Yup avec React Hook Form
 */

// Validation pour les noms (prénom, nom)
const nomValidation = yup
  .string()
  .required('Ce champ est requis')
  .min(2, 'Doit contenir au moins 2 caractères')
  .max(50, 'Ne peut pas dépasser 50 caractères')
  .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Ne peut contenir que des lettres uniquement')
  .trim();

// Validation pour l'email
const emailValidation = yup
  .string()
  .required("L'email est requis")
  .email('Veuillez entrer un email valide')
  .max(100, "L'email ne peut pas dépasser 100 caractères");

// Validation pour le téléphone sénégalais
const telephoneValidation = yup
  .string()
  .required('Le téléphone est requis')
  .matches(/^\+221[0-9]{9}$/, 'Format invalide (+221XXXXXXXXX)')
  .trim();

// Validation pour le poste
const posteValidation = yup
  .string()
  .required('Le poste est requis')
  .min(2, 'Le poste doit contenir au moins 2 caractères')
  .max(100, 'Le poste ne peut pas dépasser 100 caractères')
  .trim();

// Validation pour la date d'embauche
const dateEmbaucheValidation = yup
  .date()
  .required("La date d'embauche est requise")
  .max(new Date(), "La date d'embauche ne peut pas être dans le futur")
  .typeError('Date invalide');

// Validation pour l'IBAN (optionnel)
const ibanValidation = yup
  .string()
  .optional()
  .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, 'Format IBAN invalide (ex: FR14 2004 1010 0505 0001 3M02 606)')
  .transform((value) => value ? value.replace(/\s/g, '').toUpperCase() : value);

// Schéma principal de validation pour créer un employé
export const creerEmployeSchema = yup.object({
  email: emailValidation,
  prenom: nomValidation,
  nom: nomValidation,
  poste: posteValidation,
  typeContrat: yup
    .string()
    .required('Le type de contrat est requis')
    .oneOf(['FIXE', 'JOURNALIER', 'HONORAIRE'], 'Type de contrat invalide'),
  
  // Salaire conditionnel selon le type de contrat
  salaireBase: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .when('typeContrat', {
      is: (val) => val === 'FIXE' || val === 'HONORAIRE',
      then: (schema) => schema
        .required('Le salaire de base est requis pour ce type de contrat')
        .positive('Le salaire doit être supérieur à 0')
        .min(1, 'Le salaire doit être supérieur à 0'),
      otherwise: (schema) => schema.nullable()
    }),
  
  tauxJournalier: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .when('typeContrat', {
      is: 'JOURNALIER',
      then: (schema) => schema
        .required('Le taux journalier est requis pour ce type de contrat')
        .positive('Le taux journalier doit être supérieur à 0')
        .min(1, 'Le taux journalier doit être supérieur à 0'),
      otherwise: (schema) => schema.nullable()
    }),
  
  dateEmbauche: dateEmbaucheValidation,
  compteBancaire: ibanValidation,
  telephone: telephoneValidation,
  entrepriseId: yup
    .number()
    .required("L'ID de l'entreprise est requis")
    .positive("L'ID de l'entreprise doit être positif")
});

// Schéma pour la modification (tous les champs optionnels sauf l'ID)
export const modifierEmployeSchema = yup.object({
  id: yup
    .number()
    .required("L'ID de l'employé est requis")
    .positive("L'ID de l'employé doit être positif"),
  
  email: emailValidation.optional(),
  prenom: nomValidation.optional(),
  nom: nomValidation.optional(),
  poste: posteValidation.optional(),
  typeContrat: yup
    .string()
    .optional()
    .oneOf(['FIXE', 'JOURNALIER', 'HONORAIRE'], 'Type de contrat invalide'),
  
  salaireBase: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .when('typeContrat', {
      is: (val) => val === 'FIXE' || val === 'HONORAIRE',
      then: (schema) => schema
        .positive('Le salaire doit être supérieur à 0')
        .min(1, 'Le salaire doit être supérieur à 0'),
      otherwise: (schema) => schema.nullable()
    }),
  
  tauxJournalier: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .when('typeContrat', {
      is: 'JOURNALIER',
      then: (schema) => schema
        .positive('Le taux journalier doit être supérieur à 0')
        .min(1, 'Le taux journalier doit être supérieur à 0'),
      otherwise: (schema) => schema.nullable()
    }),
  
  dateEmbauche: dateEmbaucheValidation.optional(),
  compteBancaire: ibanValidation,
  telephone: telephoneValidation.optional()
});

/**
 * Messages d'erreur personnalisés
 */
export const messagesErreur = {
  email: {
    required: "L'email est requis",
    invalid: 'Veuillez entrer un email valide',
    unique: 'Cet email est déjà utilisé'
  },
  telephone: {
    required: 'Le téléphone est requis',
    invalid: 'Format invalide (+221XXXXXXXXX)',
    unique: 'Ce numéro est déjà utilisé'
  },
  prenom: {
    required: 'Le prénom est requis',
    minLength: 'Le prénom doit contenir au moins 2 caractères',
    pattern: 'Le prénom ne peut contenir que des lettres uniquement'
  },
  nom: {
    required: 'Le nom est requis',
    minLength: 'Le nom doit contenir au moins 2 caractères',
    pattern: 'Le nom ne peut contenir que des lettres uniquement'
  },
  poste: {
    required: 'Le poste est requis',
    minLength: 'Le poste doit contenir au moins 2 caractères'
  },
  typeContrat: {
    required: 'Le type de contrat est requis'
  },
  salaireBase: {
    required: 'Le salaire de base est requis',
    positive: 'Le salaire doit être supérieur à 0'
  },
  tauxJournalier: {
    required: 'Le taux journalier est requis',
    positive: 'Le taux journalier doit être supérieur à 0'
  },
  dateEmbauche: {
    required: "La date d'embauche est requise",
    max: "La date d'embauche ne peut pas être dans le futur"
  },
  compteBancaire: {
    invalid: 'Format IBAN invalide'
  }
};