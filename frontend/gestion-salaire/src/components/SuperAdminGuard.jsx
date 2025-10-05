import React, { useState, useEffect } from 'react';
import { useAccesSuperAdmin } from '../hooks/useAccesSuperAdmin';
import ModalRefusAcces from './ModalRefusAcces';
import LoadingSpinner from './LoadingSpinner';

/**
 * Composant Guard pour vérifier l'accès Super-Admin avant d'afficher le contenu
 */
const SuperAdminGuard = ({ children, entrepriseId }) => {
  const { verifierAcces, loading, error, clearError, isSuperAdmin } = useAccesSuperAdmin();
  const [showModal, setShowModal] = useState(false);
  const [accessVerified, setAccessVerified] = useState(!isSuperAdmin); // Si pas Super-Admin, on laisse passer
  const [verificationComplete, setVerificationComplete] = useState(!isSuperAdmin);

  useEffect(() => {
    // Vérifier l'accès seulement pour les Super-Admins
    if (isSuperAdmin && entrepriseId) {
      verifierAcces(entrepriseId).then((result) => {
        if (result.accesAutorise) {
          setAccessVerified(true);
        } else {
          setShowModal(true);
          setAccessVerified(false);
        }
        setVerificationComplete(true);
      });
    }
  }, [isSuperAdmin, entrepriseId, verifierAcces]);

  // Fermer le modal et nettoyer l'erreur
  const handleCloseModal = () => {
    setShowModal(false);
    clearError();
  };

  // Afficher le spinner pendant la vérification
  if (loading || !verificationComplete) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Vérification des autorisations...</span>
      </div>
    );
  }

  // Si l'accès est refusé, afficher le modal
  if (showModal) {
    return (
      <>
        <ModalRefusAcces
          isOpen={showModal}
          onClose={handleCloseModal}
          message={error?.message}
          raison={error?.raison}
        />
        {/* Optionnel : Affichage alternatif pendant que le modal est ouvert */}
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Accès Non Autorisé
            </h2>
            <p className="text-gray-600">
              Vous n'avez pas l'autorisation d'accéder à cette entreprise
            </p>
          </div>
        </div>
      </>
    );
  }

  // Si l'accès est autorisé, afficher le contenu
  if (accessVerified) {
    return children;
  }

  // Cas par défaut (ne devrait pas arriver)
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Vérification en cours
        </h2>
        <p className="text-gray-600">
          Vérification des autorisations d'accès...
        </p>
      </div>
    </div>
  );
};

export default SuperAdminGuard;