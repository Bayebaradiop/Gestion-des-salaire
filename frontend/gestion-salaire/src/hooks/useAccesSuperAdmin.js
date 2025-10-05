import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import autorisationService from '../services/autorisation.service';

/**
 * Hook pour vérifier l'accès Super-Admin aux entreprises
 */
export function useAccesSuperAdmin() {
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Vérifier si le Super-Admin peut accéder à une entreprise
   */
  const verifierAcces = useCallback(async (entrepriseId) => {
    if (!isSuperAdmin || !entrepriseId) {
      return { accesAutorise: true }; // Les non-Super-Admins passent par d'autres vérifications
    }

    setLoading(true);
    setError(null);

    try {
      const response = await autorisationService.verifierAccesNavigation(entrepriseId);
      return response;
    } catch (err) {
      const errorData = {
        accesAutorise: false,
        message: err.response?.data?.message || 'Accès refusé',
        raison: err.response?.data?.raison || 'Accès bloqué par l\'administrateur',
        entrepriseId
      };
      setError(errorData);
      return errorData;
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  /**
   * Réinitialiser l'état d'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    verifierAcces,
    clearError,
    loading,
    error,
    isSuperAdmin
  };
}