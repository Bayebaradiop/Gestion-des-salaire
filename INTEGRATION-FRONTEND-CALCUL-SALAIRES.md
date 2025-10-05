# Intégration Frontend - Calcul des Salaires Basé sur les Pointages

## Vue d'ensemble

Ce document explique comment intégrer les nouveaux calculs de salaires basés sur les pointages réels dans l'interface Caissier. Le problème des "Heures travaillées : 0.00h" et "Taux horaire : 0 F CFA/h" est maintenant résolu.

## API Endpoints Disponibles

### 1. Calculer le Salaire d'un Employé

**Endpoint**: `GET /api/employes/:employeId/cycles/:cyclePaieId/calculer-salaire`

**Utilisation**: Obtenir les calculs en temps réel pour un employé dans un cycle de paie.

```javascript
// Exemple d'appel côté frontend
const calculerSalaire = async (employeId, cyclePaieId) => {
  try {
    const response = await fetch(`/api/employes/${employeId}/cycles/${cyclePaieId}/calculer-salaire`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data; // CalculSalaireResult
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur calcul salaire:', error);
    throw error;
  }
};
```

**Réponse Type**:
```javascript
{
  success: true,
  message: "Salaire calculé avec succès",
  data: {
    typeContrat: "HONORAIRE", // ou "FIXE", "JOURNALIER"
    heuresTravaillees: 42.5,
    tauxHoraire: 2500,
    salaireBrut: 106250,
    deductions: 0,
    salaireNet: 106250,
    montantAPayer: 106250,
    details: {
      nombreJoursTravailles: 8,
      joursPresents: ["01/10/2025", "02/10/2025", ...],
      pointagesDetailles: [
        {
          date: "01/10/2025",
          heureArrivee: "08:00:00",
          heureDepart: "17:00:00",
          dureeMinutes: 540,
          heuresCalculees: 9.0
        },
        // ...
      ]
    }
  }
}
```

### 2. Obtenir les Détails d'un Bulletin

**Endpoint**: `GET /api/bulletins/:bulletinId/details-calcul`

**Utilisation**: Afficher les détails de calcul avec comparaison entre valeurs stockées et calculées.

```javascript
const obtenirDetailsCalcul = async (bulletinId) => {
  try {
    const response = await fetch(`/api/bulletins/${bulletinId}/details-calcul`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur détails calcul:', error);
    throw error;
  }
};
```

### 3. Recalculer et Mettre à Jour un Bulletin

**Endpoint**: `POST /api/bulletins/:bulletinId/calculer-et-mettre-a-jour`

**Utilisation**: Mettre à jour le bulletin avec les calculs les plus récents.

```javascript
const recalculerBulletin = async (bulletinId) => {
  try {
    const response = await fetch(`/api/bulletins/${bulletinId}/calculer-et-mettre-a-jour`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur recalcul bulletin:', error);
    throw error;
  }
};
```

## Intégration dans l'Interface Caissier

### 1. Composant de Sélection d'Employé/Bulletin

```jsx
// FormulaireSelectionPaiement.jsx
import React, { useState, useEffect } from 'react';

const FormulaireSelectionPaiement = () => {
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [bulletinSelectionne, setBulletinSelectionne] = useState(null);
  const [calculsSalaire, setCalculsSalaire] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour calculer le salaire quand employé + bulletin sélectionnés
  const calculerSalaireEmploye = async () => {
    if (!employeSelectionne || !bulletinSelectionne) return;

    setLoading(true);
    try {
      // Appel API pour calculer le salaire
      const calculs = await calculerSalaire(
        employeSelectionne.id, 
        bulletinSelectionne.cyclePaieId
      );
      
      setCalculsSalaire(calculs);
    } catch (error) {
      console.error('Erreur calcul:', error);
      // Gérer l'erreur côté UI
    } finally {
      setLoading(false);
    }
  };

  // Recalculer quand sélection change
  useEffect(() => {
    calculerSalaireEmploye();
  }, [employeSelectionne, bulletinSelectionne]);

  return (
    <div className="space-y-6">
      {/* Sélection employé */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employé
        </label>
        <select 
          value={employeSelectionne?.id || ''} 
          onChange={(e) => setEmployeSelectionne(employes.find(emp => emp.id == e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="">Sélectionner un employé</option>
          {employes.map(employe => (
            <option key={employe.id} value={employe.id}>
              {employe.prenom} {employe.nom} ({employe.typeContrat})
            </option>
          ))}
        </select>
      </div>

      {/* Sélection bulletin */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bulletin de paie
        </label>
        <select 
          value={bulletinSelectionne?.id || ''} 
          onChange={(e) => setBulletinSelectionne(bulletins.find(bull => bull.id == e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="">Sélectionner un bulletin</option>
          {bulletins.map(bulletin => (
            <option key={bulletin.id} value={bulletin.id}>
              {bulletin.numeroBulletin} - {bulletin.cyclePaie.periode}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage des calculs */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Calcul en cours...</span>
        </div>
      )}

      {calculsSalaire && !loading && (
        <AffichageCalculsSalaire calculs={calculsSalaire} />
      )}
    </div>
  );
};
```

### 2. Composant d'Affichage des Calculs

```jsx
// AffichageCalculsSalaire.jsx
import React from 'react';

const AffichageCalculsSalaire = ({ calculs }) => {
  const {
    typeContrat,
    heuresTravaillees,
    tauxHoraire,
    salaireBrut,
    salaireNet,
    montantAPayer,
    details
  } = calculs;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Détails du Salaire ({typeContrat})
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Heures travaillées - MAINTENANT CALCULÉES */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">
            Heures travaillées
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {heuresTravaillees.toFixed(2)}h
          </div>
          <div className="text-xs text-blue-600">
            Basé sur {details.nombreJoursTravailles} jours de présence
          </div>
        </div>

        {/* Taux horaire - MAINTENANT CALCULÉ */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">
            Taux horaire
          </div>
          <div className="text-2xl font-bold text-green-900">
            {tauxHoraire.toLocaleString()} F CFA/h
          </div>
          <div className="text-xs text-green-600">
            {typeContrat === 'FIXE' && 'Salaire base ÷ 173h'}
            {typeContrat === 'JOURNALIER' && 'Taux journalier ÷ 8h'}
            {typeContrat === 'HONORAIRE' && 'Depuis fiche employé'}
          </div>
        </div>

        {/* Salaire brut */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-600">
            Salaire brut
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {salaireBrut.toLocaleString()} F CFA
          </div>
        </div>

        {/* Montant à payer */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-600">
            Montant à payer
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {montantAPayer.toLocaleString()} F CFA
          </div>
        </div>
      </div>

      {/* Détail des pointages */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">
          Détail des pointages ({details.pointagesDetailles.length} jours)
        </h4>
        
        <div className="max-h-60 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Arrivée
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Départ
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Heures
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {details.pointagesDetailles.map((pointage, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {pointage.date}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {pointage.heureArrivee || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {pointage.heureDepart || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    {pointage.heuresCalculees.toFixed(2)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Actualiser les calculs
        </button>
        
        <button
          onClick={() => {/* Logique de paiement */}}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Procéder au paiement
        </button>
      </div>
    </div>
  );
};
```

### 3. Hook Personnalisé pour les Calculs

```jsx
// hooks/useCalculSalaire.js
import { useState, useEffect } from 'react';

export const useCalculSalaire = (employeId, cyclePaieId) => {
  const [calculs, setCalculs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculer = async () => {
    if (!employeId || !cyclePaieId) {
      setCalculs(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/employes/${employeId}/cycles/${cyclePaieId}/calculer-salaire`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setCalculs(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur calcul salaire:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculer();
  }, [employeId, cyclePaieId]);

  return {
    calculs,
    loading,
    error,
    recalculer: calculer
  };
};
```

## Utilisation dans les Pages Existantes

### 1. Page Caissier - Modification

```jsx
// Dans votre composant Caissier existant
import { useCalculSalaire } from '../hooks/useCalculSalaire';

const PageCaissier = () => {
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [bulletinSelectionne, setBulletinSelectionne] = useState(null);

  // Utiliser le hook pour obtenir les calculs automatiquement
  const { calculs, loading, error, recalculer } = useCalculSalaire(
    employeSelectionne?.id,
    bulletinSelectionne?.cyclePaieId
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Interface Caissier</h1>

      {/* Vos composants de sélection existants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Sélection employé/bulletin */}
        </div>
        
        <div>
          {/* Affichage des calculs - NOUVEAU */}
          {loading && <div>Calcul en cours...</div>}
          {error && <div className="text-red-600">Erreur: {error}</div>}
          {calculs && <AffichageCalculsSalaire calculs={calculs} />}
        </div>
      </div>
    </div>
  );
};
```

## Points Clés d'Intégration

### 1. Remplacement des Valeurs Statiques

**Avant**:
```jsx
<div>Taux horaire : 0 F CFA/h</div>
<div>Heures travaillées : 0.00h</div>
```

**Après**:
```jsx
<div>Taux horaire : {calculs?.tauxHoraire?.toLocaleString() || 0} F CFA/h</div>
<div>Heures travaillées : {calculs?.heuresTravaillees?.toFixed(2) || 0}h</div>
```

### 2. Gestion des États de Chargement

```jsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
) : (
  <AffichageCalculsSalaire calculs={calculs} />
)}
```

### 3. Mise à Jour Automatique

```jsx
// Recalculer quand les pointages changent
useEffect(() => {
  const interval = setInterval(() => {
    if (employeSelectionne && bulletinSelectionne) {
      recalculer();
    }
  }, 30000); // Toutes les 30 secondes

  return () => clearInterval(interval);
}, [employeSelectionne, bulletinSelectionne, recalculer]);
```

## Résolution des Problèmes

### 1. Heures travaillées : 0.00h
**Cause**: Pas d'appel à l'API de calcul
**Solution**: Utiliser `useCalculSalaire` hook ou appeler `/calculer-salaire`

### 2. Taux horaire : 0 F CFA/h  
**Cause**: Calcul basé sur des données incomplètes
**Solution**: Le nouveau service calcule selon le type de contrat

### 3. Montant incorrect
**Cause**: Calculs basés sur des valeurs statiques
**Solution**: Utiliser `montantAPayer` du résultat API

### 4. Données non actualisées
**Cause**: Cache côté frontend
**Solution**: Appeler `recalculer()` après modifications de pointages

Cette intégration garantit que l'interface Caissier affiche maintenant les bonnes heures travaillées et taux horaires basés sur les pointages réels des employés.