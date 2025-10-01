import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth.service';

const EntrepriseHeader = () => {
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerInfosUtilisateur = async () => {
      try {
        const profil = await authService.obtenirProfil();
        if (profil) {
          setUtilisateur(profil.utilisateur);
          setEntrepriseInfo(profil.entreprise);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    chargerInfosUtilisateur();
  }, []);

  // N'afficher que pour les ADMIN et CAISSIER
  if (loading || !utilisateur || !entrepriseInfo || 
      (utilisateur.role !== 'ADMIN' && utilisateur.role !== 'CAISSIER')) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Logo de l'entreprise */}
          {entrepriseInfo.logo && (
            <div className="flex-shrink-0">
              <img
                src={entrepriseInfo.logo}
                alt={`Logo ${entrepriseInfo.nom}`}
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Nom de l'entreprise */}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">
              {entrepriseInfo.nom}
            </h1>
            <p className="text-sm text-gray-500">
              {utilisateur.role === 'ADMIN' ? 'Administration' : 'Caisse'}
            </p>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {utilisateur.prenom} {utilisateur.nom}
            </p>
            <p className="text-xs text-gray-500">
              {utilisateur.role === 'ADMIN' ? 'Administrateur' : 'Caissier'}
            </p>
          </div>
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {utilisateur.prenom.charAt(0)}{utilisateur.nom.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseHeader;