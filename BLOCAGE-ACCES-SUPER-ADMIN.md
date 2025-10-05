# 🚫 Système de Blocage d'Accès Super-Admin

## 📋 Vue d'ensemble

Ce système permet aux administrateurs d'entreprise de **contrôler l'accès des Super-Admins** à leur entreprise. Quand l'accès est bloqué, les Super-Admins reçoivent une **erreur 403** avec un **modal explicatif**.

## 🏗️ Architecture

### Backend

#### 1. **Base de données** (`schema.prisma`)
```prisma
model Entreprise {
  id                        Int      @id @default(autoincrement())
  accesSuperAdminAutorise   Boolean  @default(true)  // 🔑 Contrôle d'accès
  // ... autres champs
}
```

#### 2. **Middleware** (`auth.middleware.ts`)
- **`verifierAccesSuperAdminAutorise`** : Vérifie les permissions pour Super-Admins
- **`verifierEntreprise`** : Délègue la vérification selon le rôle

#### 3. **Service** (`autorisation.service.ts`)
- **`verifierAccesAutorise`** : Logique métier de vérification
- **`mettreAJourAutorisation`** : Mise à jour des permissions

#### 4. **Controller** (`autorisation.controller.ts`)
- **`verifierAccesNavigation`** : Endpoint qui retourne **403** si bloqué
- **`mettreAJourAutorisation`** : Endpoint pour les admins

#### 5. **Routes** (`autorisation.routes.ts`)
```javascript
// Pour vérifier l'accès (retourne 403 si bloqué)
GET /entreprises/:id/autorisation/navigation

// Pour gérer les permissions (admin seulement)
PUT /entreprises/:id/autorisation
```

### Frontend

#### 1. **Hook** (`useAccesSuperAdmin.js`)
```javascript
const { verifierAcces, loading, error } = useAccesSuperAdmin();

// Utilisation
const result = await verifierAcces(entrepriseId);
if (!result.accesAutorise) {
  // Afficher modal d'erreur
}
```

#### 2. **Service** (`autorisation.service.js`)
```javascript
// Vérification qui peut retourner 403
await autorisationService.verifierAccesNavigation(entrepriseId);
```

#### 3. **Guard Component** (`SuperAdminGuard.jsx`)
```jsx
<SuperAdminGuard entrepriseId={entrepriseId}>
  {/* Contenu protégé */}
  <MonComposantEntreprise />
</SuperAdminGuard>
```

#### 4. **Modal** (`ModalRefusAcces.jsx`)
- Modal avec animation Framer Motion
- Message d'erreur personnalisé
- Bouton "Fermer" avec action

## 🔄 Flux de fonctionnement

### 1. **Admin bloque l'accès**
```
Admin → Toggle OFF → API PUT /autorisation → DB accesSuperAdminAutorise = false
```

### 2. **Super-Admin tente d'accéder**
```
Super-Admin → Navigation → SuperAdminGuard → Hook verifierAcces → API GET /navigation
                                                                    ↓
                                                               403 Forbidden
                                                                    ↓
                                                              ModalRefusAcces
```

### 3. **Messages d'erreur**
- **Message principal** : "Vous n'avez pas accès à cette entreprise"
- **Raison** : "L'administrateur de cette entreprise a bloqué l'accès aux Super-Admins"

## 🚀 Utilisation

### Pour protéger une page d'entreprise :

```jsx
import SuperAdminGuard from '../components/SuperAdminGuard';
import { useParams } from 'react-router-dom';

function MaPageEntreprise() {
  const { entrepriseId } = useParams();
  
  return (
    <SuperAdminGuard entrepriseId={entrepriseId}>
      {/* Votre contenu ici */}
      <div>Contenu de l'entreprise...</div>
    </SuperAdminGuard>
  );
}
```

### Pour vérifier manuellement l'accès :

```jsx
import { useAccesSuperAdmin } from '../hooks/useAccesSuperAdmin';

function MonComposant() {
  const { verifierAcces, error } = useAccesSuperAdmin();
  
  const handleNavigation = async (entrepriseId) => {
    const result = await verifierAcces(entrepriseId);
    
    if (result.accesAutorise) {
      // Navigation autorisée
      navigate(`/entreprise/${entrepriseId}`);
    }
    // Sinon, le modal s'affiche automatiquement
  };
}
```

## 🎯 Points clés

### ✅ **Avantages**
- **Sécurité renforcée** : Contrôle granulaire par entreprise
- **UX fluide** : Modal informatif au lieu d'erreur générique
- **Code réutilisable** : Guard component et hook réutilisables
- **Performance** : Vérification uniquement pour Super-Admins

### 🔧 **Intégration facile**
1. Envelopper les pages avec `<SuperAdminGuard>`
2. Utiliser le hook `useAccesSuperAdmin` pour vérifications manuelles
3. Les non-Super-Admins ne sont **pas affectés**

### 🐛 **Gestion d'erreurs**
- **403** : Accès bloqué → Modal avec message explicite
- **500** : Erreur serveur → Message d'erreur générique
- **Network** : Pas de réseau → Retry automatique

## 📁 Fichiers créés/modifiés

### Backend
- ✅ `prisma/schema.prisma` - Champ `accesSuperAdminAutorise`
- ✅ `src/middleware/auth.middleware.ts` - Middleware vérification
- ✅ `src/services/autorisation.service.ts` - Logique métier
- ✅ `src/controllers/autorisation.controller.ts` - Controller API
- ✅ `src/routes/autorisation.routes.ts` - Routes API

### Frontend
- ✅ `src/hooks/useAccesSuperAdmin.js` - Hook de vérification
- ✅ `src/services/autorisation.service.js` - Service API
- ✅ `src/components/SuperAdminGuard.jsx` - Guard component
- ✅ `src/components/ModalRefusAcces.jsx` - Modal d'erreur
- ✅ `src/components/LoadingSpinner.jsx` - Spinner de chargement
- ✅ `src/pages/ExemplePageEntreprise.jsx` - Exemple d'utilisation

## 🧪 Tests recommandés

1. **Admin bloque accès** → Super-Admin voit modal
2. **Admin autorise accès** → Super-Admin accède normalement  
3. **Non-Super-Admin** → Pas de vérification supplémentaire
4. **Erreur réseau** → Gestion d'erreur appropriée
5. **Entreprise inexistante** → Message d'erreur

## 🎨 Personnalisation

Le modal et les messages peuvent être personnalisés via les props :

```jsx
<ModalRefusAcces
  isOpen={showModal}
  onClose={handleClose}
  message="Message personnalisé"
  raison="Raison personnalisée"
/>
```