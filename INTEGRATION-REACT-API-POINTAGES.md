# 🔗 Guide d'Intégration : React ↔ Node.js API

## Configuration Environnement

### 📁 `.env` (Backend)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="mysql://user:password@localhost:3306/gestion_salaire"
# ou SQLite pour dev
# DATABASE_URL="file:./dev.db"

# JWT Secret (si auth)
JWT_SECRET="votre_secret_super_secure_ici"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

### 📁 `.env` (Frontend)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE="Gestion des Salaires"
```

---

## 🎯 Service React (Axios)

### `src/services/pointage.service.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT (si auth)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion automatique si token expiré
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === FONCTIONS CRUD ===

/**
 * Liste tous les pointages avec filtres
 * @param {Object} filters - { employeId?, date?, statut?, dateDebut?, dateFin? }
 * @returns {Promise<Array>}
 */
export const listerPointages = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/pointages?${params.toString()}`);
  return response.data;
};

/**
 * Récupère un pointage par ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getPointage = async (id) => {
  const response = await api.get(`/pointages/${id}`);
  return response.data.data;
};

/**
 * Crée un nouveau pointage
 * @param {Object} data - { employeId, date, heureArrivee?, heureDepart?, commentaire? }
 * @returns {Promise<Object>}
 */
export const creerPointage = async (data) => {
  const response = await api.post('/pointages', data);
  return response.data.data;
};

/**
 * Met à jour un pointage existant
 * @param {number} id
 * @param {Object} data - { heureArrivee?, heureDepart?, commentaire?, valide? }
 * @returns {Promise<Object>}
 */
export const mettreAJourPointage = async (id, data) => {
  const response = await api.patch(`/pointages/${id}`, data);
  return response.data.data;
};

/**
 * Supprime un pointage
 * @param {number} id
 * @returns {Promise<void>}
 */
export const supprimerPointage = async (id) => {
  await api.delete(`/pointages/${id}`);
};

/**
 * Récupère les statistiques d'un employé
 * @param {number} employeId
 * @param {Object} options - { dateDebut?, dateFin? }
 * @returns {Promise<Object>}
 */
export const getStatsEmploye = async (employeId, options = {}) => {
  const params = new URLSearchParams();
  if (options.dateDebut) params.append('dateDebut', options.dateDebut);
  if (options.dateFin) params.append('dateFin', options.dateFin);
  
  const response = await api.get(`/pointages/stats/${employeId}?${params.toString()}`);
  return response.data.data;
};

export default {
  listerPointages,
  getPointage,
  creerPointage,
  mettreAJourPointage,
  supprimerPointage,
  getStatsEmploye
};
```

---

## 🎨 Exemple Page React : Liste des Pointages

### `src/pages/pointages/PointagesListPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { listerPointages, mettreAJourPointage } from '../../services/pointage.service';
import InfographiePointage from '../../components/InfographiePointage';
import { Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Settings } from 'lucide-react';

const PointagesListPage = () => {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    statut: '',
    employeId: ''
  });
  const [showInfograp hie, setShowInfographie] = useState(false);

  // Charger les pointages
  const loadPointages = async () => {
    try {
      setLoading(true);
      const result = await listerPointages(filters);
      setPointages(result.data);
      toast.success(`${result.count} pointages chargés`);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
      toast.error('Impossible de charger les pointages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPointages();
  }, [filters]);

  // Valider un pointage
  const handleValider = async (id) => {
    try {
      await mettreAJourPointage(id, { valide: true });
      toast.success('Pointage validé');
      loadPointages();
    } catch (error) {
      toast.error('Erreur lors de la validation');
    }
  };

  // Icône selon statut
  const getStatutIcon = (statut) => {
    const icons = {
      PRESENT: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      ABSENT: <XCircle className="w-5 h-5 text-red-600" />,
      RETARD: <Clock className="w-5 h-5 text-orange-600" />,
      HEURES_SUP: <TrendingUp className="w-5 h-5 text-blue-600" />,
      CAS_PARTICULIER: <Settings className="w-5 h-5 text-gray-600" />
    };
    return icons[statut] || null;
  };

  // Classe CSS selon statut
  const getStatutClass = (statut) => {
    const classes = {
      PRESENT: 'bg-green-100 text-green-800 border-green-300',
      ABSENT: 'bg-red-100 text-red-800 border-red-300',
      RETARD: 'bg-orange-100 text-orange-800 border-orange-300',
      HEURES_SUP: 'bg-blue-100 text-blue-800 border-blue-300',
      CAS_PARTICULIER: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return classes[statut] || '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Pointages du {new Date(filters.date).toLocaleDateString('fr-FR')}
        </h1>
        <button
          onClick={() => setShowInfographie(!showInfographie)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showInfographie ? 'Masquer' : 'Voir'} Infographie
        </button>
      </div>

      {/* Infographie (conditionnelle) */}
      {showInfographie && (
        <div className="mb-8">
          <InfographiePointage 
            darkMode={false}
            onExportPDF={() => {
              toast.success('Fonction export PDF à implémenter');
            }}
            reduceMotion={false}
          />
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="RETARD">Retard</option>
              <option value="HEURES_SUP">Heures Sup</option>
              <option value="CAS_PARTICULIER">Cas Particulier</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: new Date().toISOString().split('T')[0], statut: '', employeId: '' })}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : pointages.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12 text-center">
          <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun pointage trouvé
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Employé
                </th>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Arrivée
                </th>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Départ
                </th>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Durée
                </th>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pointages.map((pointage) => (
                <tr key={pointage.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      Employé #{pointage.employeId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {pointage.heureArrivee || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {pointage.heureDepart || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {pointage.dureeMinutes ? `${Math.floor(pointage.dureeMinutes / 60)}h${pointage.dureeMinutes % 60}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatutClass(pointage.statut)}`}>
                      {getStatutIcon(pointage.statut)}
                      {pointage.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!pointage.valide && (
                      <button
                        onClick={() => handleValider(pointage.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                      >
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PointagesListPage;
```

---

## 🚀 Démarrage Rapide

### 1. Installation Dépendances

```bash
# Backend
cd backend
npm install express cors express-validator prisma @prisma/client

# Frontend
cd frontend
npm install axios framer-motion lucide-react react-hot-toast
```

### 2. Configuration Database

```bash
# Backend
npx prisma init
# Copier le schema Prisma fourni
npx prisma migrate dev --name init
npx prisma generate
npm run seed  # Si seed script configuré
```

### 3. Lancer les Serveurs

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # ou node src/api/pointages.api.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Tester l'API

```bash
# GET - Liste des pointages
curl http://localhost:3000/api/pointages

# POST - Créer un pointage
curl -X POST http://localhost:3000/api/pointages \
  -H "Content-Type: application/json" \
  -d '{
    "employeId": 1,
    "date": "2025-10-03",
    "heureArrivee": "08:00:00",
    "heureDepart": "17:00:00"
  }'

# PATCH - Mettre à jour
curl -X PATCH http://localhost:3000/api/pointages/1 \
  -H "Content-Type: application/json" \
  -d '{"heureDepart": "18:00:00"}'

# GET - Stats employé
curl http://localhost:3000/api/pointages/stats/1?dateDebut=2025-10-01&dateFin=2025-10-31
```

---

## ✅ Checklist Intégration

- [ ] Backend API fonctionne (http://localhost:3000/api/pointages)
- [ ] Frontend démarre (http://localhost:3001)
- [ ] Variables d'environnement configurées (.env)
- [ ] Database migrée (Prisma)
- [ ] Seed data créé
- [ ] Service Axios configuré
- [ ] Composant InfographiePointage s'affiche
- [ ] CRUD complet fonctionne
- [ ] Filtres opérationnels
- [ ] Validation erreurs API
- [ ] Toast notifications actives
- [ ] Dark mode fonctionne
- [ ] Responsive mobile/desktop
- [ ] Accessibilité testée

---

*Guide créé par Dr. Full-Stack Developer - Octobre 2025*
