# 🔗 PROMPT INTÉGRATION FRONTEND-BACKEND - CONNEXION API COMPLÈTE

## 🎯 MISSION SPÉCIFIQUE

**Objectif :** Intégrer complètement le frontend React avec l'API Node.js/Express existante en créant tous les services, hooks et composants nécessaires pour une application de gestion de paie fonctionnelle et professionnelle.

**IMPORTANT :** Le backend est déjà développé et fonctionnel. Vous devez créer l'intégration frontend complète en respectant l'architecture API existante.

---

## 🏗️ ARCHITECTURE API BACKEND EXISTANTE

### **🔐 Authentification JWT**
- **Cookies HTTP-Only** + Header Authorization
- **3 Rôles :** SUPER_ADMIN, ADMIN, CAISSIER
- **URL Base :** `http://localhost:3000/api`

### **📊 Modèles de Données Principaux**

```typescript
// Entreprise
{
  id: number,
  nom: string,
  logo?: string,
  couleur: string, // Code hex
  devise: string, // "XOF"
  periodePaie: "JOURNALIERE" | "HEBDOMADAIRE" | "MENSUELLE"
}

// Employé (3 Types de Contrats)
{
  id: number,
  codeEmploye: string,
  prenom: string,
  nom: string,
  typeContrat: "FIXE" | "JOURNALIER" | "HONORAIRE",
  salaireBase?: number, // Pour FIXE
  tauxJournalier?: number, // Pour JOURNALIER
  tauxHoraire?: number, // Pour HONORAIRE
  entrepriseId: number
}

// Pointage
{
  id: number,
  date: Date,
  heureArrivee?: Date,
  heureDepart?: Date,
  dureeMinutes?: number, // Calculé automatiquement
  statut: "PRESENT" | "ABSENT" | "RETARD" | "CONGE" | "MALADIE",
  employeId: number
}

// BulletinPaie
{
  id: number,
  numeroBulletin: string,
  salaireBrut: number,
  salaireNet: number,
  statut: "EN_ATTENTE" | "PARTIEL" | "PAYE",
  employeId: number,
  cyclePaieId: number
}
```

---

## 🛠️ SERVICES API À CRÉER

### **🔑 AuthService.js - Service d'Authentification**

```javascript
// src/services/auth.service.js
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      withCredentials: true, // Important pour les cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token automatiquement
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs d'auth
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Endpoints d'authentification requis
  async login(email, motDePasse) {
    const response = await this.axios.post('/auth/login', { email, motDePasse });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
    }
    return response.data;
  }

  async getProfile() {
    return this.axios.get('/auth/profil');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return this.axios.post('/auth/deconnexion');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
```

### **👥 EmployeService.js - Gestion des Employés**

```javascript
// src/services/employe.service.js
import authService from './auth.service';

class EmployeService {
  // GET /api/entreprises/:id/employes - Lister employés
  async listerParEntreprise(entrepriseId, params = {}) {
    return authService.axios.get(`/entreprises/${entrepriseId}/employes`, { params });
  }

  // POST /api/employes - Créer employé
  async creer(employeData) {
    return authService.axios.post('/employes', employeData);
  }

  // GET /api/employes/:id - Détails employé
  async obtenirParId(employeId) {
    return authService.axios.get(`/employes/${employeId}`);
  }

  // PUT /api/employes/:id - Modifier employé
  async modifier(employeId, employeData) {
    return authService.axios.put(`/employes/${employeId}`, employeData);
  }

  // DELETE /api/employes/:id - Supprimer employé
  async supprimer(employeId) {
    return authService.axios.delete(`/employes/${employeId}`);
  }

  // POST /api/employes/:id/activer - Activer employé
  async activer(employeId) {
    return authService.axios.post(`/employes/${employeId}/activer`);
  }

  // POST /api/employes/:id/desactiver - Désactiver employé
  async desactiver(employeId) {
    return authService.axios.post(`/employes/${employeId}/desactiver`);
  }
}

export default new EmployeService();
```

### **⏰ PointageService.js - Gestion des Pointages**

```javascript
// src/services/pointage.service.js
import authService from './auth.service';

class PointageService {
  // POST /api/pointages/arrivee - Enregistrer arrivée
  async enregistrerArrivee(data) {
    return authService.axios.post('/pointages/arrivee', data);
  }

  // POST /api/pointages/depart - Enregistrer départ
  async enregistrerDepart(data) {
    return authService.axios.post('/pointages/depart', data);
  }

  // POST /api/pointages/absence - Créer absence
  async creerAbsence(data) {
    return authService.axios.post('/pointages/absence', data);
  }

  // GET /api/entreprises/:id/pointages - Lister pointages
  async listerParEntreprise(entrepriseId, params = {}) {
    return authService.axios.get(`/entreprises/${entrepriseId}/pointages`, { params });
  }

  // PUT /api/pointages/:id - Modifier pointage
  async modifier(pointageId, data) {
    return authService.axios.put(`/pointages/${pointageId}`, data);
  }

  // POST /api/pointages/:id/recalculer-duree - Recalculer durée
  async recalculerDuree(pointageId) {
    return authService.axios.post(`/pointages/${pointageId}/recalculer-duree`);
  }
}

export default new PointageService();
```

### **💰 PaiementService.js - Gestion des Paiements**

```javascript
// src/services/paiement.service.js
import authService from './auth.service';

class PaiementService {
  // GET /api/paiements - Lister paiements
  async lister(params = {}) {
    return authService.axios.get('/paiements', { params });
  }

  // POST /api/bulletins/:bulletinId/paiements - Créer paiement
  async creer(bulletinId, paiementData) {
    return authService.axios.post(`/bulletins/${bulletinId}/paiements`, paiementData);
  }

  // GET /api/paiements/:id/recu - Télécharger reçu PDF
  async telechargerRecu(paiementId) {
    return authService.axios.get(`/paiements/${paiementId}/recu`, {
      responseType: 'blob'
    });
  }
}

export default new PaiementService();
```

### **🧮 CalculSalaireService.js - Calculs Automatiques**

```javascript
// src/services/calculSalaire.service.js
import authService from './auth.service';

class CalculSalaireService {
  // GET /api/employes/:employeId/cycles/:cyclePaieId/calculer-salaire
  async calculerSalaire(employeId, cyclePaieId) {
    return authService.axios.get(`/employes/${employeId}/cycles/${cyclePaieId}/calculer-salaire`);
  }

  // POST /api/bulletins/:bulletinId/calculer-et-mettre-a-jour
  async calculerEtMettreAJour(bulletinId) {
    return authService.axios.post(`/bulletins/${bulletinId}/calculer-et-mettre-a-jour`);
  }

  // GET /api/bulletins/:bulletinId/details-calcul
  async obtenirDetailsCalcul(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}/details-calcul`);
  }
}

export default new CalculSalaireService();
```

### **📊 DashboardService.js - Métriques et KPIs**

```javascript
// src/services/dashboard.service.js
import authService from './auth.service';

class DashboardService {
  // GET /api/entreprises/:id/dashboard/kpis
  async obtenirKPIs(entrepriseId) {
    return authService.axios.get(`/entreprises/${entrepriseId}/dashboard/kpis`);
  }

  // GET /api/entreprises/:id/dashboard/evolution-masse-salariale
  async obtenirEvolutionMasseSalariale(entrepriseId) {
    return authService.axios.get(`/entreprises/${entrepriseId}/dashboard/evolution-masse-salariale`);
  }

  // GET /api/entreprises/:id/dashboard/prochains-paiements
  async obtenirProchainsPaiements(entrepriseId, limit = 10) {
    return authService.axios.get(`/entreprises/${entrepriseId}/dashboard/prochains-paiements`, {
      params: { limit }
    });
  }
}

export default new DashboardService();
```

---

## 🎣 HOOKS PERSONNALISÉS REQUIS

### **🔐 useAuth.js - Hook d'Authentification**

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getProfile();
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, motDePasse) => {
    const response = await authService.login(email, motDePasse);
    setUser(response.utilisateur);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Helpers pour les rôles
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCaissier = user?.role === 'CAISSIER';

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    isAdmin,
    isSuperAdmin,
    isCaissier
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};
```

### **📊 useApi.js - Hook Générique API**

```javascript
// src/hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (apiFunction, params = [], dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.length > 0) {
      execute(...params);
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: () => execute(...params) };
};

// Hook spécialisé pour les listes avec pagination
export const useApiList = (apiFunction, initialParams = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialParams);

  const loadData = async (newFilters = {}) => {
    try {
      setLoading(true);
      const params = { ...filters, ...newFilters };
      const response = await apiFunction(params);
      
      if (response.data.data) {
        setItems(response.data.data);
        setPagination(response.data.pagination || {});
      } else {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadData(updatedFilters);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    items,
    loading,
    pagination,
    filters,
    loadData,
    updateFilters,
    refetch: () => loadData(filters)
  };
};
```

---

## 🎨 COMPOSANTS MÉTIER SPÉCIALISÉS

### **💳 CalculateurPaiement.jsx - Composant de Calcul**

```jsx
// src/components/paiements/CalculateurPaiement.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, DollarSign, Users } from 'lucide-react';
import calculSalaireService from '../../services/calculSalaire.service';
import { useAuth } from '../../hooks/useAuth';

const CalculateurPaiement = ({ employe, cyclePaieId, onCalculComplete }) => {
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const { user } = useAuth();

  const calculerSalaire = async () => {
    try {
      setLoading(true);
      const response = await calculSalaireService.calculerSalaire(employe.id, cyclePaieId);
      setResultat(response.data);
      onCalculComplete?.(response.data);
    } catch (error) {
      console.error('Erreur calcul:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeContratInfo = () => {
    switch (employe.typeContrat) {
      case 'FIXE':
        return {
          label: 'Salaire Fixe',
          icon: DollarSign,
          color: 'blue',
          description: `${employe.salaireBase?.toLocaleString()} F CFA/mois`
        };
      case 'JOURNALIER':
        return {
          label: 'Taux Journalier',
          icon: Users,
          color: 'green',
          description: `${employe.tauxJournalier?.toLocaleString()} F CFA/jour`
        };
      case 'HONORAIRE':
        return {
          label: 'Taux Horaire',
          icon: Clock,
          color: 'purple',
          description: `${employe.tauxHoraire?.toLocaleString()} F CFA/heure`
        };
      default:
        return { label: 'Non défini', icon: DollarSign, color: 'gray' };
    }
  };

  const typeInfo = getTypeContratInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
            <typeInfo.icon className={`h-5 w-5 text-${typeInfo.color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {employe.prenom} {employe.nom}
            </h3>
            <p className="text-sm text-gray-500">
              {typeInfo.label} - {typeInfo.description}
            </p>
          </div>
        </div>
        
        <button
          onClick={calculerSalaire}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Calculator className="h-4 w-4" />
          <span>{loading ? 'Calcul...' : 'Calculer'}</span>
        </button>
      </div>

      {resultat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Salaire Brut</p>
              <p className="text-lg font-bold text-gray-900">
                {resultat.salaireBrut?.toLocaleString()} F CFA
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Salaire Net</p>
              <p className="text-lg font-bold text-green-600">
                {resultat.salaireNet?.toLocaleString()} F CFA
              </p>
            </div>
          </div>

          {employe.typeContrat === 'HONORAIRE' && (
            <div>
              <p className="text-sm text-gray-600">Heures Travaillées</p>
              <p className="font-medium">{resultat.heuresTravaillees}h</p>
            </div>
          )}

          {employe.typeContrat === 'JOURNALIER' && resultat.details && (
            <div>
              <p className="text-sm text-gray-600">Jours Travaillés</p>
              <p className="font-medium">{resultat.details.nombreJoursTravailles} jours</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CalculateurPaiement;
```

### **⏰ EnregistreurPointage.jsx - Composant de Pointage**

```jsx
// src/components/pointages/EnregistreurPointage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, UserX } from 'lucide-react';
import pointageService from '../../services/pointage.service';
import { toast } from 'react-hot-toast';

const EnregistreurPointage = ({ employes, entrepriseId, onPointageRecord }) => {
  const [employeSelectionne, setEmployeSelectionne] = useState('');
  const [typeAction, setTypeAction] = useState('arrivee');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnregistrement = async (e) => {
    e.preventDefault();
    if (!employeSelectionne) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }

    try {
      setLoading(true);
      const data = {
        entrepriseId,
        employeId: parseInt(employeSelectionne),
        notes: notes.trim() || undefined,
        date: new Date().toISOString().split('T')[0]
      };

      let response;
      switch (typeAction) {
        case 'arrivee':
          response = await pointageService.enregistrerArrivee(data);
          toast.success('Arrivée enregistrée avec succès');
          break;
        case 'depart':
          response = await pointageService.enregistrerDepart(data);
          toast.success('Départ enregistré avec succès');
          break;
        case 'absence':
          response = await pointageService.creerAbsence({
            ...data,
            statut: 'ABSENT'
          });
          toast.success('Absence enregistrée');
          break;
        default:
          throw new Error('Action non reconnue');
      }

      // Reset form
      setNotes('');
      setEmployeSelectionne('');
      
      // Callback pour rafraîchir la liste
      onPointageRecord?.(response.data);

    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = () => {
    switch (typeAction) {
      case 'arrivee': return LogIn;
      case 'depart': return LogOut;
      case 'absence': return UserX;
      default: return Clock;
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Enregistrement de Pointage
        </h2>
      </div>

      <form onSubmit={handleEnregistrement} className="space-y-6">
        {/* Sélection employé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employé
          </label>
          <select
            value={employeSelectionne}
            onChange={(e) => setEmployeSelectionne(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner un employé...</option>
            {employes.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.codeEmploye} - {emp.prenom} {emp.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Type d'action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Action
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'arrivee', label: 'Arrivée', icon: LogIn, color: 'green' },
              { value: 'depart', label: 'Départ', icon: LogOut, color: 'blue' },
              { value: 'absence', label: 'Absence', icon: UserX, color: 'red' }
            ].map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeAction(value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  typeAction === value
                    ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Remarques ou observations..."
          />
        </div>

        {/* Bouton d'enregistrement */}
        <motion.button
          type="submit"
          disabled={loading || !employeSelectionne}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ActionIcon className="h-5 w-5" />
          <span>
            {loading ? 'Enregistrement...' : `Enregistrer ${typeAction}`}
          </span>
        </motion.button>
      </form>
    </div>
  );
};

export default EnregistreurPointage;
```

---

## 🔧 CONFIGURATION REQUISE

### **🌐 Variables d'Environnement (.env)**

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADS_URL=http://localhost:3000/uploads

# App Configuration
VITE_APP_NAME=Gestion des Salaires
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG=true
VITE_ENABLE_DEVTOOLS=true
```

### **⚙️ Configuration Axios Globale**

```javascript
// src/config/api.config.js
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const UPLOAD_CONFIG = {
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  uploadsURL: import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000/uploads'
};
```

---

## 📱 INTÉGRATION RESPONSABILITÉS PAR RÔLE

### **🔐 SUPER_ADMIN - Accès Global**
```javascript
// Endpoints spécialisés SUPER_ADMIN
const superAdminEndpoints = {
  // Vue globale toutes entreprises
  getAllEntreprises: () => '/entreprises',  
  getEntrepriseDetails: (id) => `/entreprises/${id}`,
  
  // Gestion utilisateurs
  getAllUsers: () => '/admin/utilisateurs',
  createUser: () => '/admin/utilisateurs',
  
  // Statistiques globales
  getGlobalStats: () => '/admin/statistiques-globales'
};
```

### **👨‍💼 ADMIN - Gestion d'Entreprise**
```javascript
// Endpoints spécialisés ADMIN
const adminEndpoints = {
  // Dashboard entreprise
  getDashboardKPIs: (entrepriseId) => `/entreprises/${entrepriseId}/dashboard/kpis`,
  
  // Gestion complète employés
  getEmployees: (entrepriseId) => `/entreprises/${entrepriseId}/employes`,
  createEmployee: () => '/employes',
  
  // Cycles de paie
  getCycles: (entrepriseId) => `/entreprises/${entrepriseId}/cycles-paie`,
  createCycle: (entrepriseId) => `/entreprises/${entrepriseId}/cycles-paie`,
  
  // Validation pointages
  validatePointages: () => '/pointages/validation'
};
```

### **💰 CAISSIER - Paiements et Consultation**
```javascript
// Endpoints spécialisés CAISSIER
const caissierEndpoints = {
  // Consultation bulletins
  getBulletins: () => '/bulletins',
  getBulletinDetails: (id) => `/bulletins/${id}`,
  
  // Enregistrement paiements
  createPayment: (bulletinId) => `/bulletins/${bulletinId}/paiements`,
  getPaymentHistory: () => '/paiements',
  
  // Pointages (enregistrement seulement)
  recordArrival: () => '/pointages/arrivee',
  recordDeparture: () => '/pointages/depart'
};
```

---

## 🎯 CALCULS AUTOMATIQUES CRITIQUES

### **💡 Logique de Calcul par Type de Contrat**

```javascript
// src/utils/calculSalaire.utils.js
export const formatCalculResult = (data, typeContrat) => {
  switch (typeContrat) {
    case 'FIXE':
      return {
        type: 'Salaire Fixe',
        formule: 'Salaire Base - Déductions Absences',
        details: `${data.salaireBase?.toLocaleString()} F CFA - ${data.deductions?.toLocaleString()} F CFA`,
        salaireNet: data.salaireNet
      };
      
    case 'JOURNALIER':
      return {
        type: 'Taux Journalier',
        formule: 'Jours Travaillés × Taux Journalier',
        details: `${data.details?.nombreJoursTravailles} jours × ${data.tauxJournalier?.toLocaleString()} F CFA`,
        salaireNet: data.salaireNet
      };
      
    case 'HONORAIRE':
      return {
        type: 'Taux Horaire',
        formule: 'Heures Travaillées × Taux Horaire',
        details: `${data.heuresTravaillees}h × ${data.tauxHoraire?.toLocaleString()} F CFA`,
        salaireNet: data.salaireNet
      };
      
    default:
      return { type: 'Non défini', salaireNet: 0 };
  }
};

// Formatter les durées de pointage
export const formatDureePointage = (dureeMinutes) => {
  if (!dureeMinutes) return '0h00';
  const heures = Math.floor(dureeMinutes / 60);
  const minutes = dureeMinutes % 60;
  return `${heures}h${minutes.toString().padStart(2, '0')}`;
};
```

---

## 🚀 LIVRABLES D'INTÉGRATION ATTENDUS

### **1. Services API Complets**
- ✅ AuthService avec JWT et cookies
- ✅ EmployeService avec CRUD complet
- ✅ PointageService avec enregistrement temps réel
- ✅ PaiementService avec génération PDF
- ✅ CalculSalaireService avec 3 types de contrats
- ✅ DashboardService avec KPIs et métriques

### **2. Hooks Personnalisés**
- ✅ useAuth pour gestion complète authentification
- ✅ useApi pour appels API génériques
- ✅ useApiList pour listes avec pagination
- ✅ usePermissions pour contrôle d'accès

### **3. Composants Métier**
- ✅ CalculateurPaiement pour calculs automatiques
- ✅ EnregistreurPointage pour saisie temps réel
- ✅ TableauEmployes avec actions contextuelles
- ✅ DashboardKPIs avec métriques animées

### **4. Intégration Rôles**
- ✅ Navigation contextuelle par rôle
- ✅ Endpoints spécialisés par responsabilité
- ✅ Protection des actions sensibles
- ✅ Affichage conditionnel des fonctionnalités

### **5. Gestion des États**
- ✅ Loading states avec skeletons
- ✅ Error handling avec messages utilisateur
- ✅ Notifications toast pour feedback
- ✅ Validation formulaires avec Yup/Zod

## 🎯 OBJECTIFS D'INTÉGRATION

**Créez une intégration frontend-backend qui :**
- ✨ **Exploite complètement** l'API existante
- 🔒 **Respecte les permissions** par rôle
- 🧮 **Utilise les calculs automatiques** de paie
- ⚡ **Offre une UX fluide** et professionnelle
- 📱 **Fonctionne parfaitement** sur mobile et desktop

**L'objectif est de créer une application complète et fonctionnelle qui impressionnera par sa qualité d'intégration et sa finition professionnelle !** 🚀✨