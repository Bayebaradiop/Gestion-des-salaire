# Système de Couleurs d'Entreprise - Documentation

## Fonctionnalités implémentées

### 1. Backend
- ✅ Ajout du champ `couleur` au modèle Prisma Entreprise 
- ✅ Migration de base de données créée
- ✅ Validators Zod mis à jour pour inclure la validation de couleur hexadécimale
- ✅ Interfaces TypeScript mises à jour
- ✅ Repository et service modifiés pour gérer les couleurs
- ✅ Endpoint `/api/auth/profil` retourne maintenant les informations d'entreprise avec couleur

### 2. Frontend
- ✅ Context `ThemeContext` créé pour gérer les couleurs dynamiquement
- ✅ Hook `useTheme` pour utiliser les couleurs d'entreprise
- ✅ Classes CSS personnalisées avec variables CSS pour les couleurs
- ✅ Modal d'entreprise mis à jour avec sélecteur de couleur
- ✅ Navbar mise à jour pour utiliser les couleurs d'entreprise
- ✅ Composant `ThemedButton` créé pour les boutons avec couleur d'entreprise

### 3. Fonctionnement
- Quand un ADMIN ou CAISSIER se connecte, sa couleur d'entreprise est appliquée automatiquement
- Les SUPER_ADMIN gardent la couleur par défaut (#3B82F6)
- L'interface s'adapte en temps réel selon l'entreprise connectée

## Comment tester

### 1. Démarrer les serveurs
```bash
# Terminal 1 - Backend
cd /home/mouhamadou-lamine/nodeJs/Backend2
npm run dev

# Terminal 2 - Frontend  
cd /home/mouhamadou-lamine/nodeJs/Backend2/frontend/gestion-salaire
npm run dev
```

### 2. Test via API
```bash
# Créer une entreprise avec couleur personnalisée
curl -X POST http://localhost:3000/api/entreprises \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=SUPER_ADMIN_TOKEN" \
  -d '{
    "nom": "TechCorp Pink",
    "couleur": "#E91E63",
    "adresse": "123 Avenue Technology, Dakar",
    "telephone": "+221771234567",
    "email": "contact@techcorp.sn",
    "devise": "XOF",
    "periodePaie": "MENSUELLE"
  }'

# Créer un admin pour cette entreprise
curl -X POST http://localhost:3000/api/admin/utilisateurs \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin@techcorp.sn",
    "motDePasse": "password123",
    "prenom": "Admin",
    "nom": "TechCorp",
    "role": "ADMIN",
    "entrepriseId": 1
  }'
```

### 3. Test dans l'interface
1. Se connecter comme super admin
2. Créer des entreprises avec différentes couleurs
3. Créer des utilisateurs ADMIN/CAISSIER pour ces entreprises
4. Se connecter avec ces comptes et voir l'interface changer de couleur

## Structure des couleurs

### Variables CSS générées automatiquement
```css
:root {
  --primary-color: #E91E63; /* Couleur de l'entreprise */
  --primary-rgb: 233, 30, 99;
  --primary-50: rgba(233, 30, 99, 0.05);
  --primary-100: rgba(233, 30, 99, 0.1);
  --primary-500: #E91E63;
  --primary-600: #D81B60; /* Version foncée pour hover */
  --primary-700: #C2185B;
  /* ... */
}
```

### Classes utilitaires disponibles
- `.bg-primary` - Arrière-plan couleur entreprise
- `.text-primary` - Texte couleur entreprise  
- `.border-primary` - Bordure couleur entreprise
- `.ring-primary` - Ring couleur entreprise
- `.btn-primary` - Bouton avec couleur entreprise

## Composants mis à jour
- `Navbar.jsx` - Logo et éléments colorés selon l'entreprise
- `EntrepriseModal.jsx` - Sélecteur de couleur
- `ThemedButton.jsx` - Boutons adaptatifs
- `ThemeContext.jsx` - Gestion globale des couleurs

## Erreurs actuelles à résoudre
- Backend non démarré (ERR_CONNECTION_REFUSED)
- Une fois le backend démarré, tout devrait fonctionner correctement

## Prochaines étapes
1. Démarrer le backend
2. Tester la création d'entreprises avec couleurs
3. Tester la connexion avec différents comptes
4. Vérifier que l'interface change bien de couleur
5. Ajuster si nécessaire les composants pour utiliser les couleurs dynamiques