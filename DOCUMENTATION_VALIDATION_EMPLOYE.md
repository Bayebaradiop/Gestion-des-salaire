# 📋 Système de Validation - Formulaire Ajout Employé

## 🎯 Vue d'ensemble

Ce document présente le système de validation complet pour le formulaire d'ajout d'employé, avec validation côté backend (Node.js + Zod) et frontend (React + Yup + React Hook Form).

## 🔧 Architecture

### Backend (Node.js + Express + Zod)
- **Validateur** : `src/validator/employe.validator.ts`
- **Contrôleur** : `src/controllers/employe.controller.ts`
- **Service** : `src/services/employe.service.ts`
- **Repository** : `src/repositories/employe.repository.ts`

### Frontend (React + Yup + React Hook Form)
- **Validateur** : `frontend/src/validators/employe.validators.js`
- **Formulaire** : `frontend/src/components/formulaires/FormulaireAjoutEmploye.jsx`
- **Service** : `frontend/src/services/employe.service.js`

## 📝 Champs validés

### 1. Email *
- **Requis** : Oui
- **Validation** : Format email valide
- **Unicité** : Vérifiée côté backend
- **Message d'erreur** : "Cet email est déjà utilisé par un autre employé"

### 2. Prénom *
- **Requis** : Oui
- **Validation** : Min 2 caractères, lettres uniquement
- **Regex** : `/^[a-zA-ZÀ-ÿ\s'-]+$/`
- **Message d'erreur** : "Le prénom ne peut contenir que des lettres uniquement"

### 3. Nom *
- **Requis** : Oui
- **Validation** : Min 2 caractères, lettres uniquement
- **Regex** : `/^[a-zA-ZÀ-ÿ\s'-]+$/`
- **Message d'erreur** : "Le nom ne peut contenir que des lettres uniquement"

### 4. Poste *
- **Requis** : Oui
- **Validation** : Min 2 caractères
- **Message d'erreur** : "Le poste doit contenir au moins 2 caractères"

### 5. Type de Contrat *
- **Requis** : Oui
- **Options** : FIXE, JOURNALIER, HONORAIRE
- **Validation conditionnelle** :
  - **FIXE** → Salaire de base requis
  - **JOURNALIER** → Taux journalier requis  
  - **HONORAIRE** → Salaire de base requis

### 6. Salaire de Base
- **Requis** : Si type = FIXE ou HONORAIRE
- **Validation** : Nombre > 0
- **Message d'erreur** : "Le salaire doit être supérieur à 0"

### 7. Taux Journalier
- **Requis** : Si type = JOURNALIER
- **Validation** : Nombre > 0
- **Message d'erreur** : "Le taux journalier doit être supérieur à 0"

### 8. Date d'Embauche *
- **Requis** : Oui
- **Validation** : Format YYYY-MM-DD, ≤ aujourd'hui
- **Message d'erreur** : "La date d'embauche ne peut pas être dans le futur"

### 9. Compte Bancaire
- **Requis** : Non
- **Validation** : Format IBAN si fourni
- **Regex** : `/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/`
- **Exemple** : FR14 2004 1010 0505 0001 3M02 606

### 10. Téléphone *
- **Requis** : Oui
- **Validation** : Format sénégalais +221XXXXXXXXX
- **Unicité** : Vérifiée côté backend
- **Regex** : `/^\+221[0-9]{9}$/`
- **Message d'erreur** : "Ce numéro est déjà utilisé"

## 🔄 Flux de validation

### 1. Validation Frontend (React Hook Form + Yup)
```javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { creerEmployeSchema } from '../../validators/employe.validators';

const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm({
  resolver: yupResolver(creerEmployeSchema)
});
```

### 2. Validation Backend (Zod)
```typescript
const verif = creerEmployeSchema.safeParse(req.body);
if (!verif.success) {
  return res.status(400).json({
    errors: verif.error.format()
  });
}
```

### 3. Vérification d'unicité (Service)
```typescript
// Email
const emailUnique = await this.employeRepository.verifierEmailUnique(donnees.email);
if (!emailUnique) {
  throw new Error('Cet email est déjà utilisé par un autre employé');
}

// Téléphone  
const telephoneUnique = await this.employeRepository.verifierTelephoneUnique(donnees.telephone);
if (!telephoneUnique) {
  throw new Error('Ce numéro de téléphone est déjà utilisé par un autre employé');
}
```

## 🎨 Affichage des erreurs Frontend

### Erreurs de validation côté client
```jsx
{errors.email && (
  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
)}
```

### Erreurs du backend (unicité, etc.)
```javascript
// Dans le catch du onSubmit
if (error.response?.data?.message?.includes('email')) {
  setError('email', {
    type: 'server',
    message: 'Cet email est déjà utilisé par un autre employé'
  });
}
```

## 📡 Réponses d'erreur Backend

### Erreur de validation
```json
{
  "errors": {
    "email": {
      "_errors": ["Veuillez entrer un email valide"]
    },
    "telephone": {
      "_errors": ["Format téléphone invalide (+221XXXXXXXXX)"]
    }
  }
}
```

### Erreur d'unicité
```json
{
  "message": "Cet email est déjà utilisé par un autre employé"
}
```

## 🧪 Tests de validation

### Tests à effectuer

1. **Champs requis** : Vérifier que tous les champs obligatoires sont validés
2. **Formats** : Tester email, téléphone, IBAN avec des formats invalides
3. **Unicité** : Créer un employé avec email/téléphone existant
4. **Validation conditionnelle** : Changer le type de contrat et vérifier les champs requis
5. **Date** : Tenter une date future pour l'embauche
6. **Nombres** : Entrer des salaires/taux négatifs ou nuls

### Script de test
```bash
# Démarrer le serveur backend
npm run dev

# Démarrer le frontend  
cd frontend/gestion-salaire && npm run dev

# Accéder à http://localhost:3002
# Se connecter avec super@admin.com / SuperAdmin123!
# Aller sur Employés > Ajouter un employé
```

## 🔐 Sécurité

### Protection des données
- **Sanitisation** : Tous les champs string sont automatiquement trimés
- **Validation stricte** : Regex pour empêcher l'injection de code
- **Authentification** : Toutes les routes sont protégées
- **Autorisation** : Seuls SUPER_ADMIN et ADMIN peuvent créer des employés

### Gestion des erreurs
- **Pas de détails techniques** : Les erreurs système ne révèlent pas d'informations sensibles
- **Messages utilisateur** : Erreurs claires et utilisables
- **Logs sécurisés** : Erreurs loggées côté serveur pour debug

## 📱 Utilisation

### Pour Super Admin
1. Se connecter avec `super@admin.com` / `SuperAdmin123!`
2. Aller sur "Employés"
3. Cliquer "Ajouter un employé"
4. Sélectionner l'entreprise dans la liste
5. Remplir le formulaire et valider

### Pour Admin/Caissier  
1. L'entreprise est automatiquement sélectionnée
2. Tous les autres champs fonctionnent de la même manière

## 🐛 Dépannage

### Erreurs communes

1. **"Token d'authentification manquant"**
   - Solution : Se connecter d'abord

2. **"Cet email est déjà utilisé"**
   - Solution : Utiliser un email différent

3. **"Format téléphone invalide"**  
   - Solution : Utiliser le format +221XXXXXXXXX

4. **"Le salaire de base est requis"**
   - Solution : Sélectionner d'abord le type de contrat

### Debug
- Vérifier la console navigateur pour les erreurs frontend
- Vérifier les logs serveur pour les erreurs backend
- Utiliser les DevTools React pour inspecter le state

## 🚀 Déploiement

### Prérequis
- Node.js 18+
- MySQL/MariaDB
- Variables d'environnement configurées

### Commandes
```bash
# Backend
npm run build
npm start

# Frontend  
npm run build
# Servir les fichiers statiques
```

---

**Auteur** : Système de validation employé  
**Date** : Octobre 2025  
**Version** : 1.0.0