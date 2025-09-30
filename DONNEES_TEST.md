# 📊 DONNÉES DE TEST - Gestion Automatique des Entreprises

⚠️ **IMPORTANT :** Si vous voulez tester l'application avec des données vraiment VIERGES (aucune donnée fictive), utilisez `prisma/seed-vierge.ts` au lieu de `prisma/seed-complete.ts`.

Ce fichier contient toutes les données d'exemple créées par le script `prisma/seed-complete.ts` pour tester l'application.

## 🚀 Comment utiliser ces données

### Option 1 : Test avec données complètes (recommandé pour développement)
```bash
npx tsx prisma/seed-complete.ts
```

### Option 2 : Test avec données VIERGES (recommandé pour production)
```bash
npx tsx prisma/seed-vierge.ts
```

2. **Démarrer l'application :**
   ```bash
   npm run dev
   ```

3. **Se connecter avec les comptes ci-dessous**

---

## ⚠️ PROBLÈME SIGNALÉ : Données fictives automatiques

**Problème :** Lors de la création d'une entreprise via l'interface Super Admin, des employés et cycles de paie fictifs apparaissaient automatiquement.

**Cause :** Utilisation du seed complet (`seed-complete.ts`) qui crée des données d'exemple.

**Solution :** Utiliser le seed vierge (`seed-vierge.ts`) pour des tests en conditions réelles :

```bash
# Reset complet de la base
npx prisma migrate reset

# Seed vierge (aucune donnée fictive)
npx tsx prisma/seed-vierge.ts

# L'application sera complètement vide
# Créez manuellement vos entreprises et utilisateurs
```

**Comportement attendu :**
- ✅ Tables vides lors de la création d'entreprise
- ✅ Aucun employé automatique
- ✅ Aucun cycle de paie automatique
- ✅ Seules les données créées manuellement sont visibles

---

## 👑 SUPER ADMINISTRATEUR

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `superadmin@gestion-paie.com` | `SuperAdmin123!` |

**Capacités :**
- Gérer toutes les entreprises
- Créer/modifier/supprimer des utilisateurs et employés
- Accéder à toutes les fonctionnalités

---

## 🏢 ENTREPRISES ET COMPTES

### 1. **Tech Solutions Sénégal** 🏢
**Secteur :** Technologies de l'information

**Utilisateurs :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@techsolutions.sn` | `Admin123!` |
| Caissier | `caissier@techsolutions.sn` | `Caissier123!` |

**Employés :**
| Code | Nom | Prénom | Poste | Type Contrat | Salaire/Taux |
|------|-----|--------|-------|--------------|--------------|
| TS001 | Diop | Mamadou | Développeur Full Stack | FIXE | 850,000 XOF |
| TS002 | Fall | Aminata | Chef de Projet | FIXE | 750,000 XOF |
| TS003 | Seck | Ibrahima | Designer Graphique | JOURNALIER | 45,000 XOF/jour |

---

### 2. **OpenAI Sénégal** 🤖
**Secteur :** Intelligence artificielle

**Utilisateurs :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@openai.sn` | `Admin123!` |
| Caissier | `caissier@openai.sn` | `Caissier123!` |

**Employés :**
| Code | Nom | Prénom | Poste | Type Contrat | Salaire/Taux |
|------|-----|--------|-------|--------------|--------------|
| OAI001 | Ndiaye | Fatou | Data Scientist | FIXE | 950,000 XOF |
| OAI002 | Gueye | Cheikh | Ingénieur IA | HONORAIRE | 1,200,000 XOF |

---

### 3. **Global Services SA** 🌐
**Secteur :** Services généraux

**Utilisateurs :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@globalservices.sn` | `Admin123!` |
| Caissier | `caissier@globalservices.sn` | `Caissier123!` |

**Employés :**
| Code | Nom | Prénom | Poste | Type Contrat | Salaire/Taux |
|------|-----|--------|-------|--------------|--------------|
| GS001 | Ba | Khadija | Comptable | FIXE | 500,000 XOF |

---

### 4. **Digital Marketing Pro** 📱
**Secteur :** Marketing digital

**Utilisateurs :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@digitalmarketing.sn` | `Admin123!` |
| Caissier | `caissier@digitalmarketing.sn` | `Caissier123!` |

**Employés :**
| Code | Nom | Prénom | Poste | Type Contrat | Salaire/Taux |
|------|-----|--------|-------|--------------|--------------|
| DMP001 | Sall | Ousmane | Marketing Manager | FIXE | 650,000 XOF |
| DMP002 | Diouf | Adama | Community Manager | JOURNALIER | 35,000 XOF/jour |

---

### 5. **Construction Excellence** 🏗️
**Secteur :** Bâtiment et travaux publics

**Utilisateurs :**
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@construction.sn` | `Admin123!` |
| Caissier | `caissier@construction.sn` | `Caissier123!` |

**Employés :**
| Code | Nom | Prénom | Poste | Type Contrat | Salaire/Taux |
|------|-----|--------|-------|--------------|--------------|
| CE001 | Sy | Moussa | Chef de Chantier | JOURNALIER | 55,000 XOF/jour |

---

## 📈 STATISTIQUES GÉNÉRÉES

### **Cycles de paie :**
- 5 cycles de paie créés (un par entreprise)
- Période : Décembre 2024
- Statut : Brouillon

### **Bulletins de paie :**
- 9 bulletins générés automatiquement
- Calculs basés sur les types de contrat :
  - **FIXE/HONORAIRE** : Salaire brut = salaire de base
  - **JOURNALIER** : Salaire brut = taux journalier × 22 jours

### **Paiements :**
- Aucun paiement initialisé (pour tests manuels)

---

## 🧪 SCÉNARIOS DE TEST RECOMMANDÉS

### **1. Test Super Admin :**
- Connexion avec `superadmin@gestion-paie.com`
- Navigation vers chaque entreprise
- Création d'un nouvel utilisateur pour "Tech Solutions"
- Modification d'un employé existant
- Suppression d'un utilisateur

### **2. Test Admin Entreprise :**
- Connexion avec `admin@techsolutions.sn`
- Gestion des employés de son entreprise uniquement
- Création d'un nouveau bulletin de paie
- Validation des paiements

### **3. Test Caissier :**
- Connexion avec `caissier@techsolutions.sn`
- Consultation des bulletins de paie
- Enregistrement des paiements
- Génération des reçus

### **4. Test Types de Contrat :**
- **FIXE** : Salaire mensuel fixe (Mamadou Diop)
- **JOURNALIER** : Paiement au jour (Ibrahima Seck)
- **HONORAIRE** : Contrat de prestation (Cheikh Gueye)

### **5. Test Validations :**
- Tentative de création d'utilisateur avec email existant
- Saisie de salaire négatif
- Modification de données sensibles

---

## 🔧 COMMANDES UTILES

```bash
# 🔄 RESET COMPLET DE LA BASE
npx prisma migrate reset

# 🌱 SEED AVEC DONNÉES VIERGES (recommandé pour tests réels)
npx tsx prisma/seed-vierge.ts

# 🌱 SEED AVEC DONNÉES COMPLETES (recommandé pour développement)
npx tsx prisma/seed-complete.ts

# 🌱 SEED AVEC DONNÉES DE BASE (1 entreprise avec employés)
npx tsx prisma/seed.ts

# 🚀 Démarrer le serveur backend
npm run dev

# 💻 Démarrer le frontend
cd frontend/gestion-salaire && npm run dev

# 👀 Voir les données en base
npx prisma studio
```

### 📋 WORKFLOW RECOMMANDÉ

```bash
# 1. Reset complet
npx prisma migrate reset

# 2. Seed vierge pour tests en conditions réelles
npx tsx prisma/seed-vierge.ts

# 3. Lancer l'application
npm run dev

# 4. Créer manuellement vos entreprises et utilisateurs
```

---

## 📝 NOTES TECHNIQUES

- **Base de données :** MySQL avec Prisma ORM
- **Authentification :** JWT avec bcrypt pour le hashage
- **Validation :** Zod pour la validation frontend/backend
- **Frontend :** React avec hooks, modals pour CRUD
- **Types de contrat :** FIXE, JOURNALIER, HONORAIRE
- **Rôles utilisateur :** SUPER_ADMIN, ADMIN, CAISSIER

Ces données permettent de tester exhaustivement toutes les fonctionnalités de l'application de gestion automatique des entreprises et des salaires.