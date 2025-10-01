# 📝 Documentation du Système de Validation

## Application Gestion des Salaires

Ce document explique l'implémentation complète du système de validation backend et frontend pour l'application de gestion des salaires.

## 🎯 Vue d'ensemble

Le système de validation est conçu pour :
- ✅ Valider les données côté backend avec **Zod**
- ✅ Valider les données côté frontend avec **Yup + React Hook Form**
- ✅ Gérer l'unicité (email, téléphone, nom d'entreprise)
- ✅ Afficher des messages d'erreur clairs et personnalisés
- ✅ Synchroniser les erreurs backend/frontend

## 🛠️ Structure des fichiers

### Backend (Node.js + Express)
```
src/
├── validator/
│   └── validation.schemas.ts     # Schémas Zod complets
├── middleware/
│   └── validation.middleware.ts  # Middleware de validation
└── controllers/
    └── *.controller.ts          # Utilisation des validations
```

### Frontend (React + React Hook Form)
```
src/
├── utils/
│   └── validation.schemas.js     # Schémas Yup complets
├── hooks/
│   └── useValidatedForm.js       # Hook personnalisé
└── components/
    ├── modals/
    │   └── EntrepriseModalValidated.jsx
    └── forms/
        └── EmployeFormValidated.jsx
```

## 📋 Schémas de validation disponibles

### Backend (Zod)
- `creerUtilisateurSchema` / `modifierUtilisateurSchema`
- `creerEntrepriseSchema` / `modifierEntrepriseSchema`
- `creerEmployeSchema` / `modifierEmployeSchema`
- `creerCyclePaieSchema` / `modifierCyclePaieSchema`
- `creerBulletinPaieSchema` / `modifierBulletinPaieSchema`
- `creerPaiementSchema` / `modifierPaiementSchema`
- `connexionSchema`

### Frontend (Yup)
- `userValidationSchema` / `updateUserValidationSchema`
- `entrepriseValidationSchema` / `updateEntrepriseValidationSchema`
- `employeValidationSchema` / `updateEmployeValidationSchema`
- `cyclePaieValidationSchema` / `updateCyclePaieValidationSchema`
- `bulletinPaieValidationSchema` / `updateBulletinPaieValidationSchema`
- `paiementValidationSchema` / `updatePaiementValidationSchema`
- `loginValidationSchema`

## 🚀 Utilisation Backend

### 1. Validation simple dans un contrôleur

```typescript
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { creerEntrepriseSchema, idParamsSchema } from '../validator/validation.schemas.js';

// Dans vos routes
router.post('/', 
  validateBody(creerEntrepriseSchema),
  entrepriseController.creer
);

router.get('/:id',
  validateParams(idParamsSchema),
  entrepriseController.obtenirParId
);
```

### 2. Validation avec vérification d'unicité

```typescript
import { createValidation } from '../middleware/validation.middleware.js';
import { creerEntrepriseSchema } from '../validator/validation.schemas.js';

// Création d'entreprise avec vérification d'unicité
router.post('/', 
  ...createValidation.createEntreprise(creerEntrepriseSchema),
  entrepriseController.creer
);
```

### 3. Format des erreurs renvoyées

```json
{
  "errors": {
    "email": "Cet email est déjà utilisé",
    "telephone": "Format de téléphone invalide",
    "nom": "Le nom doit contenir au moins 2 caractères"
  },
  "message": "Erreurs de validation"
}
```

## 🎨 Utilisation Frontend

### 1. Hook personnalisé `useValidatedForm`

```jsx
import { useValidatedForm, FieldError } from '../hooks/useValidatedForm';
import { entrepriseValidationSchema } from '../utils/validation.schemas';

const MonComposant = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    isSubmitting,
    handleServerErrors,
    hasFieldError
  } = useValidatedForm(entrepriseValidationSchema);

  const onSubmit = async (data) => {
    try {
      await monService.creer(data);
    } catch (error) {
      if (error.response?.data?.errors) {
        handleServerErrors(error.response.data.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('nom')}
        className={hasFieldError('nom') ? 'border-red-500' : 'border-gray-300'}
      />
      <FieldError name="nom" errors={errors} />
    </form>
  );
};
```

### 2. Composant d'erreur `FieldError`

```jsx
<FieldError 
  name="email" 
  errors={errors} 
  className="custom-error-style" 
/>
```

### 3. Gestion des erreurs serveur

```jsx
const onSubmit = async (data) => {
  try {
    await monService.creer(data);
  } catch (error) {
    // Les erreurs serveur sont automatiquement gérées
    if (error.response?.data?.errors) {
      handleServerErrors(error.response.data.errors);
    }
  }
};
```

## 📊 Règles de validation implémentées

### Utilisateurs
- ✅ Nom/prénom : 2-50 caractères, lettres uniquement
- ✅ Email : format valide + unicité
- ✅ Téléphone : format sénégalais + unicité
- ✅ Mot de passe : 8+ caractères, 1 maj, 1 min, 1 chiffre, 1 spécial
- ✅ Rôle : SUPER_ADMIN, ADMIN, CAISSIER

### Entreprises
- ✅ Nom : 2-100 caractères + unicité
- ✅ Email : format valide + unicité
- ✅ Téléphone : format sénégalais + unicité
- ✅ Adresse : 10-200 caractères
- ✅ Devise : XOF, EUR, USD, CFA
- ✅ Période de paie : MENSUELLE, HEBDOMADAIRE, JOURNALIERE

### Employés
- ✅ Nom/prénom : 2-50 caractères, lettres uniquement
- ✅ Email : format valide + unicité (optionnel)
- ✅ Téléphone : format sénégalais + unicité (optionnel)
- ✅ Poste : 2-100 caractères
- ✅ Type de contrat : FIXE, JOURNALIER, HONORAIRE
- ✅ Salaire : > 0 selon le type de contrat
- ✅ Date d'embauche : ≤ aujourd'hui

### Cycles de paie
- ✅ Titre : 5-100 caractères
- ✅ Période : format YYYY-MM
- ✅ Dates : début < fin
- ✅ Jours ouvrables : 1-31
- ✅ Statut : BROUILLON, APPROUVE, CLOTURE

### Bulletins de paie
- ✅ Salaire brut : > 0
- ✅ Déductions : ≥ 0 et ≤ brut
- ✅ Salaire net : = brut - déductions + primes
- ✅ Jours payés : ≥ 0
- ✅ Statut : EN_ATTENTE, PARTIEL, PAYE

### Paiements
- ✅ Montant : > 0 et ≤ net restant
- ✅ Méthode : ESPECES, VIREMENT_BANCAIRE, ORANGE_MONEY, WAVE, AUTRE
- ✅ Date : ≤ aujourd'hui
- ✅ Référence : unique si fournie

## 🔧 Personnalisation

### Ajouter une nouvelle validation

1. **Backend (Zod)**
```typescript
// Dans validation.schemas.ts
export const nouveauSchema = z.object({
  champ: z.string().min(1, "Message d'erreur personnalisé")
});
```

2. **Frontend (Yup)**
```javascript
// Dans validation.schemas.js
export const nouveauValidationSchema = yup.object({
  champ: yup.string().required("Message d'erreur personnalisé")
});
```

### Messages d'erreur personnalisés

Les messages sont centralisés dans la constante `MESSAGES` de chaque fichier et peuvent être facilement modifiés.

## 🚨 Gestion des erreurs

### Types d'erreurs gérées
1. **Erreurs de validation** : Format, longueur, type
2. **Erreurs d'unicité** : Email, téléphone, nom déjà utilisé
3. **Erreurs logiques** : Dates, calculs, relations
4. **Erreurs serveur** : Base de données, réseau

### Format des réponses d'erreur
```json
{
  "errors": {
    "champAvecErreur": "Message d'erreur spécifique"
  },
  "message": "Erreurs de validation"
}
```

## 📱 Intégration avec l'interface utilisateur

### Classes CSS pour les erreurs
```css
.border-red-500 {
  border-color: #ef4444;
}

.text-red-600 {
  color: #dc2626;
}
```

### États de chargement
Les formulaires affichent automatiquement un indicateur de chargement pendant la soumission avec `isSubmitting`.

## 🔍 Tests et débogage

### Tester les validations backend
```bash
# Test avec curl
curl -X POST http://localhost:3000/api/entreprises \
  -H "Content-Type: application/json" \
  -d '{"nom": "A"}' # Erreur : nom trop court
```

### Tester les validations frontend
Les erreurs s'affichent en temps réel lors de la saisie grâce au mode `onChange` de React Hook Form.

## 📈 Bonnes pratiques

1. **Toujours valider côté backend** même si la validation frontend existe
2. **Afficher les erreurs près des champs** concernés
3. **Utiliser des messages clairs** et compréhensibles
4. **Tester l'unicité** avec des données réelles
5. **Gérer les cas d'erreur** de manière gracieuse

## 🎉 Avantages du système

- ✅ **Sécurité** : Validation complète côté serveur
- ✅ **UX optimale** : Validation temps réel côté client
- ✅ **Maintenabilité** : Code centralisé et réutilisable
- ✅ **Consistance** : Messages d'erreur uniformes
- ✅ **Évolutivité** : Facile d'ajouter de nouvelles validations

---

## 📞 Support

Pour toute question sur l'implémentation du système de validation, consultez :
- Les exemples dans `/components/modals/EntrepriseModalValidated.jsx`
- Les exemples dans `/components/forms/EmployeFormValidated.jsx`
- La documentation des hooks dans `/hooks/useValidatedForm.js`