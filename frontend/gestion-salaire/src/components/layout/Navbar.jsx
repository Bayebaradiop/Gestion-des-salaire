import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/auth.service';
import { FaUserCircle, FaBuilding } from 'react-icons/fa';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { HiMenuAlt2 } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);

  useEffect(() => {
    const chargerInfosEntreprise = async () => {
      if (user && (user.role === 'ADMIN' || user.role === 'CAISSIER')) {
        try {
          const profil = await authService.obtenirProfil();
          if (profil?.entreprise) {
            setEntrepriseInfo(profil.entreprise);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des infos entreprise:', error);
        }
      }
    };

    chargerInfosEntreprise();
  }, [user]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="mr-2 md:hidden text-gray-600">
            <HiMenuAlt2 size={24} />
          </button>
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">PayManager</span>
          </Link>
          
          {/* Informations de l'entreprise pour ADMIN et CAISSIER */}
          {entrepriseInfo && (user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
            <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-300">
              {entrepriseInfo.logo ? (
                <img
                  src={entrepriseInfo.logo}
                  alt={`Logo ${entrepriseInfo.nom}`}
                  className="h-8 w-8 rounded-full object-cover border border-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaBuilding className="text-white text-sm" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{entrepriseInfo.nom}</span>
                <span className="text-xs text-gray-500">
                  {user?.role === 'ADMIN' ? 'Administration' : 'Caisse'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-gray-800">
            <IoMdNotificationsOutline size={24} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div className="flex items-center space-x-2">
                <FaUserCircle size={24} className="text-gray-600" />
                <span className="font-medium hidden md:block">{user?.prenom} {user?.nom}</span>
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs font-medium text-blue-600 mt-1">{user?.role}</p>
                </div>
                
                {/* Informations entreprise sur mobile */}
                {entrepriseInfo && (user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
                  <div className="px-4 py-2 border-b md:hidden">
                    <div className="flex items-center space-x-2">
                      {entrepriseInfo.logo ? (
                        <img
                          src={entrepriseInfo.logo}
                          alt={`Logo ${entrepriseInfo.nom}`}
                          className="h-6 w-6 rounded-full object-cover border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <FaBuilding className="text-white text-xs" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-900">{entrepriseInfo.nom}</p>
                        <p className="text-xs text-gray-500">
                          {user?.role === 'ADMIN' ? 'Administration' : 'Caisse'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;