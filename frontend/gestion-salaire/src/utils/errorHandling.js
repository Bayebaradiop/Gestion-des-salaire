/**
 * Utilitaires pour gérer les erreurs de validation backend
 */

/**
 * Transforme les erreurs Zod du backend en erreurs utilisables par les formulaires
 * @param {Object} backendError - Erreur du backend
 * @returns {Object} - Erreurs formatées pour les formulaires
 */
export const formatBackendErrors = (backendError) => {
  const formattedErrors = {};

  if (backendError.response?.data?.errors) {
    const errors = backendError.response.data.errors;
    
    // Parcourir les erreurs Zod formatées
    Object.keys(errors).forEach(field => {
      if (errors[field]._errors && errors[field]._errors.length > 0) {
        formattedErrors[field] = errors[field]._errors[0];
      }
    });
  } else if (backendError.response?.data?.message) {
    // Gérer les erreurs spécifiques comme l'unicité
    const message = backendError.response.data.message;
    
    if (message.includes('email')) {
      formattedErrors.email = 'Cet email est déjà utilisé par un autre employé';
    } else if (message.includes('téléphone')) {
      formattedErrors.telephone = 'Ce numéro de téléphone est déjà utilisé';
    } else if (message.includes('entreprise')) {
      formattedErrors.entrepriseId = message;
    }
  }

  return formattedErrors;
};

/**
 * Extrait le message d'erreur principal d'une erreur backend
 * @param {Object} backendError - Erreur du backend
 * @returns {string} - Message d'erreur principal
 */
export const extractMainErrorMessage = (backendError) => {
  if (backendError.response?.data?.message) {
    return backendError.response.data.message;
  }
  
  if (backendError.response?.data?.errors) {
    // Prendre la première erreur disponible
    const errors = backendError.response.data.errors;
    const firstField = Object.keys(errors)[0];
    if (firstField && errors[firstField]._errors && errors[firstField]._errors.length > 0) {
      return errors[firstField]._errors[0];
    }
  }
  
  return 'Une erreur est survenue lors de l\'opération';
};

/**
 * Hook personnalisé pour gérer les erreurs de validation
 * @param {Function} setFieldError - Fonction pour définir les erreurs de champ (Formik/React Hook Form)
 * @returns {Function} - Fonction pour traiter les erreurs backend
 */
export const useBackendErrorHandler = (setFieldError) => {
  const handleBackendError = (error) => {
    const formattedErrors = formatBackendErrors(error);
    
    // Appliquer les erreurs aux champs correspondants
    Object.keys(formattedErrors).forEach(field => {
      setFieldError(field, formattedErrors[field]);
    });
    
    return formattedErrors;
  };
  
  return handleBackendError;
};

/**
 * Valide les données côté client avant envoi au backend
 * @param {Object} data - Données à valider
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateEmployeData = (data) => {
  const errors = {};
  
  // Validation de base
  if (!data.email?.trim()) {
    errors.email = "L'email est requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format d'email invalide";
  }
  
  if (!data.prenom?.trim()) {
    errors.prenom = "Le prénom est requis";
  } else if (data.prenom.length < 2) {
    errors.prenom = "Le prénom doit contenir au moins 2 caractères";
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.prenom)) {
    errors.prenom = "Le prénom ne peut contenir que des lettres";
  }
  
  if (!data.nom?.trim()) {
    errors.nom = "Le nom est requis";
  } else if (data.nom.length < 2) {
    errors.nom = "Le nom doit contenir au moins 2 caractères";
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.nom)) {
    errors.nom = "Le nom ne peut contenir que des lettres";
  }
  
  if (!data.poste?.trim()) {
    errors.poste = "Le poste est requis";
  } else if (data.poste.length < 2) {
    errors.poste = "Le poste doit contenir au moins 2 caractères";
  }
  
  if (!data.typeContrat) {
    errors.typeContrat = "Le type de contrat est requis";
  }
  
  if (!data.telephone?.trim()) {
    errors.telephone = "Le téléphone est requis";
  } else if (!/^\+221[0-9]{9}$/.test(data.telephone)) {
    errors.telephone = "Format téléphone invalide (+221XXXXXXXXX)";
  }
  
  if (!data.dateEmbauche) {
    errors.dateEmbauche = "La date d'embauche est requise";
  } else {
    const dateEmbauche = new Date(data.dateEmbauche);
    const today = new Date();
    if (dateEmbauche > today) {
      errors.dateEmbauche = "La date d'embauche ne peut pas être dans le futur";
    }
  }
  
  // Validation conditionnelle selon le type de contrat
  if (data.typeContrat === 'FIXE' || data.typeContrat === 'HONORAIRE') {
    if (!data.salaireBase || data.salaireBase <= 0) {
      errors.salaireBase = "Le salaire de base est requis et doit être supérieur à 0";
    }
  } else if (data.typeContrat === 'JOURNALIER') {
    if (!data.tauxJournalier || data.tauxJournalier <= 0) {
      errors.tauxJournalier = "Le taux journalier est requis et doit être supérieur à 0";
    }
  }
  
  // Validation IBAN si fourni
  if (data.compteBancaire && data.compteBancaire.trim()) {
    const cleanIban = data.compteBancaire.replace(/\s/g, '');
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleanIban)) {
      errors.compteBancaire = "Format IBAN invalide";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};