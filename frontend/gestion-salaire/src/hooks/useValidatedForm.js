import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * ================================
 * HOOK PERSONNALISÉ POUR LA VALIDATION
 * Application Gestion des Salaires
 * ================================
 */

/**
 * Hook personnalisé pour gérer les formulaires avec validation
 * Intègre React Hook Form, Yup et la gestion des erreurs serveur
 */
export const useValidatedForm = (schema, defaultValues = {}, options = {}) => {
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options
  });

  const { setError, clearErrors, formState: { errors } } = form;

  /**
   * Gérer les erreurs venant du serveur
   */
  const handleServerErrors = useCallback((errors) => {
    setServerErrors(errors || {});
    
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        setError(field, {
          type: 'server',
          message: errors[field]
        });
      });
    }
  }, [setError]);

  /**
   * Nettoyer toutes les erreurs
   */
  const clearAllErrors = useCallback(() => {
    setServerErrors({});
    clearErrors();
  }, [clearErrors]);

  /**
   * Wrapper pour la soumission du formulaire
   */
  const handleSubmit = useCallback((onSubmit) => {
    return form.handleSubmit(async (data) => {
      try {
        setIsSubmitting(true);
        clearAllErrors();
        await onSubmit(data);
      } catch (error) {
        // Si l'erreur vient du serveur avec des erreurs de validation
        if (error.response?.data?.errors) {
          handleServerErrors(error.response.data.errors);
        } else if (error.response?.data?.message) {
          // Erreur générale du serveur
          console.error('Erreur serveur:', error.response.data.message);
        } else {
          console.error('Erreur inattendue:', error);
        }
        throw error; // Re-throw pour permettre la gestion dans le composant
      } finally {
        setIsSubmitting(false);
      }
    });
  }, [form, handleServerErrors, clearAllErrors]);

  /**
   * Obtenir le message d'erreur pour un champ
   */
  const getFieldError = useCallback((fieldName) => {
    const error = errors[fieldName];
    return error ? error.message : null;
  }, [errors]);

  /**
   * Vérifier si un champ a une erreur
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!errors[fieldName];
  }, [errors]);

  return {
    ...form,
    serverErrors,
    isSubmitting,
    handleServerErrors,
    clearAllErrors,
    handleSubmit,
    getFieldError,
    hasFieldError,
    // Propriétés utiles
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    touchedFields: form.formState.touchedFields
  };
};

/**
 * Hook pour gérer l'affichage des erreurs dans les composants Input
 */
export const useFieldError = (fieldName, errors, serverErrors = {}) => {
  const error = errors[fieldName] || serverErrors[fieldName];
  
  return {
    hasError: !!error,
    errorMessage: error?.message || error,
    errorType: error?.type || 'validation'
  };
};

/**
 * Composant wrapper pour afficher les erreurs de champ
 */
export const FieldError = ({ name, errors, serverErrors, className = '' }) => {
  const { hasError, errorMessage } = useFieldError(name, errors, serverErrors);
  
  if (!hasError) return null;
  
  return (
    <span className={`text-red-600 text-sm mt-1 block ${className}`}>
      {errorMessage}
    </span>
  );
};

/**
 * Hook pour gérer les erreurs de formulaire au niveau global
 */
export const useFormErrors = () => {
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleApiError = useCallback((error) => {
    if (error.response?.data) {
      const { errors, message } = error.response.data;
      
      if (errors && typeof errors === 'object') {
        setFieldErrors(errors);
        setGlobalError('');
      } else if (message) {
        setGlobalError(message);
        setFieldErrors({});
      }
    } else {
      setGlobalError('Une erreur inattendue s\'est produite');
      setFieldErrors({});
    }
  }, []);

  const clearErrors = useCallback(() => {
    setGlobalError('');
    setFieldErrors({});
  }, []);

  return {
    globalError,
    fieldErrors,
    handleApiError,
    clearErrors,
    hasErrors: !!globalError || Object.keys(fieldErrors).length > 0
  };
};

/**
 * Utilitaires pour la validation
 */
export const validationUtils = {
  /**
   * Formatter les erreurs serveur pour React Hook Form
   */
  formatServerErrors: (serverErrors) => {
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
  },

  /**
   * Extraire les erreurs d'un objet d'erreur Axios
   */
  extractApiErrors: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    if (error.response?.data?.message) {
      return { general: error.response.data.message };
    }
    return { general: 'Une erreur inattendue s\'est produite' };
  },

  /**
   * Valider un champ spécifique avec un schéma
   */
  validateField: async (schema, fieldName, value) => {
    try {
      await schema.validateAt(fieldName, { [fieldName]: value });
      return null;
    } catch (error) {
      return error.message;
    }
  }
};

export default useValidatedForm;