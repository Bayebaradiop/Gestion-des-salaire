import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaMoneyBillWave, 
  FaChartLine,
  FaBuilding, 
  FaCog 
} from 'react-icons/fa';

const Sidebar = () => {
  const { isAdmin, isSuperAdmin, isCaissier } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen hidden md:block">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Gestion des Salaires</h2>
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>

        <nav className="space-y-1">
          {isCaissier && (
            <>
              <NavLink
                to="/caissier"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FaTachometerAlt className="mr-3" />
                Dashboard Caissier
              </NavLink>

              <NavLink
                to="/caissier/bulletins"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FaMoneyBillWave className="mr-3" />
                Consultation Bulletins
              </NavLink>
            </>
          )}

          {!isSuperAdmin && !isCaissier && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FaTachometerAlt className="mr-3" />
                Tableau de bord
              </NavLink>

              <NavLink
                to="/dashboard/salaires"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FaChartLine className="mr-3" />
                Dashboard Salaires
              </NavLink>

              <NavLink
                to="/employes"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FaUsers className="mr-3" />
                Employés
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/cycles"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <FaMoneyBillWave className="mr-3" />
                  Cycles de Paie
                </NavLink>
              )}
            </>
          )}

          {isSuperAdmin && (
            <NavLink
              to="/super-admin"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaBuilding className="mr-3" />
              Gestion Entreprises
            </NavLink>
          )}

          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaCog className="mr-3" />
            Paramètres
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;