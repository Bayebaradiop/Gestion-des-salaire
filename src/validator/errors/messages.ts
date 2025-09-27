export const ERROR_MESSAGES = {
  // Erreurs générales
  VALIDATION_ERROR: 'Erreur de validation des données',
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  NOT_FOUND: 'Resource non trouvée',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',

  // Messages pour les champs
  FIELDS: {
    REQUIRED: 'Ce champ est obligatoire',
    EMAIL_INVALID: 'Format d\'email invalide',
    EMAIL_REQUIRED: 'L\'email est obligatoire',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_REQUIRED: 'Le mot de passe est obligatoire',
    NOM_TOO_SHORT: 'Le nom doit contenir au moins 2 caractères',
    PRENOM_TOO_SHORT: 'Le prénom doit contenir au moins 2 caractères',
  },

  // Erreurs d'authentification
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    TOKEN_EXPIRED: 'Token expiré',
    TOKEN_INVALID: 'Token invalide',
    ACCESS_DENIED: 'Accès refusé',
    EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
  },

  // Messages pour l'entreprise
  ENTREPRISE: {
    NOT_FOUND: 'Entreprise non trouvée',
    ALREADY_EXISTS: 'Une entreprise avec ce nom existe déjà',
  },

  // Messages pour les employés
  EMPLOYE: {
    NOT_FOUND: 'Employé non trouvé',
    CODE_ALREADY_EXISTS: 'Ce code employé existe déjà',
  },
} as const;
