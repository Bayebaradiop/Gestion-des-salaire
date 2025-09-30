import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaCalendar, FaMoneyBillWave, FaBuilding, FaIdCard, FaTimes } from 'react-icons/fa';

const EmployeDetailsModal = ({ isOpen, onClose, employe }) => {
  if (!isOpen || !employe) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant);
  };

  const getTypeContratLabel = (type) => {
    const types = {
      'JOURNALIER': 'Journalier',
      'FIXE': 'Salaire fixe',
      'HONORAIRE': 'Honoraires'
    };
    return types[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Détails de l'employé
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Informations personnelles */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Informations personnelles
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaIdCard className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Code employé</p>
                    <p className="font-medium">{employe.codeEmploye || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaUser className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-medium">{employe.prenom} {employe.nom}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{employe.email || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{employe.telephone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-blue-600" />
              Informations professionnelles
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaBriefcase className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Poste</p>
                    <p className="font-medium">{employe.poste}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaIdCard className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Type de contrat</p>
                    <p className="font-medium">{getTypeContratLabel(employe.typeContrat)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date d'embauche</p>
                    <p className="font-medium">{formatDate(employe.dateEmbauche)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`mr-3 w-3 h-3 rounded-full ${employe.estActif ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <p className={`font-medium ${employe.estActif ? 'text-green-600' : 'text-red-600'}`}>
                      {employe.estActif ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations salariales */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-blue-600" />
              Informations salariales
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employe.salaireBase && (
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Salaire de base</p>
                      <p className="font-medium">{formatMontant(employe.salaireBase)} FCFA</p>
                    </div>
                  </div>
                )}
                {employe.tauxJournalier && (
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Taux journalier</p>
                      <p className="font-medium">{formatMontant(employe.tauxJournalier)} FCFA</p>
                    </div>
                  </div>
                )}
                {employe.compteBancaire && (
                  <div className="flex items-center col-span-1 md:col-span-2">
                    <FaBuilding className="mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Compte bancaire</p>
                      <p className="font-medium">{employe.compteBancaire}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations système */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaCalendar className="mr-2 text-blue-600" />
              Informations système
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Créé le</p>
                  <p className="font-medium">{formatDate(employe.creeLe)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dernière modification</p>
                  <p className="font-medium">{formatDate(employe.misAJourLe)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeDetailsModal;