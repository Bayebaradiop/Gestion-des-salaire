import React from 'react';
import SuperAdminGuard from '../components/SuperAdminGuard';
import { useParams } from 'react-router-dom';

/**
 * Exemple d'utilisation du SuperAdminGuard dans une page d'entreprise
 */
const ExemplePageEntreprise = () => {
  const { entrepriseId } = useParams();

  return (
    <SuperAdminGuard entrepriseId={entrepriseId}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🏢 Gestion Entreprise #{entrepriseId}
          </h1>
          
          {/* Contenu de la page entreprise */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card Employés */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                👥 Employés
              </h3>
              <p className="text-blue-600">
                Gérer les employés de l'entreprise
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Voir les employés
              </button>
            </div>

            {/* Card Pointages */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ⏰ Pointages
              </h3>
              <p className="text-green-600">
                Consulter les pointages d'aujourd'hui
              </p>
              <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Voir les pointages
              </button>
            </div>

            {/* Card Salaires */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                💰 Salaires
              </h3>
              <p className="text-purple-600">
                Gérer les salaires et bulletins de paie
              </p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                Voir les salaires
              </button>
            </div>
          </div>

          {/* Section informations */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ℹ️ Information
            </h3>
            <p className="text-yellow-700">
              Vous accédez à cette entreprise en tant que Super-Admin. 
              L'administrateur de cette entreprise a autorisé votre accès.
            </p>
          </div>
        </div>
      </div>
    </SuperAdminGuard>
  );
};

export default ExemplePageEntreprise;