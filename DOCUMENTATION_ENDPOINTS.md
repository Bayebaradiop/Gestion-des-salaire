# 📚 DOCUMENTATION COMPLÈTE DES ENDPOINTS - API GESTION DE PAIE

## 🎯 PRÉSENTATION DU PROJET

Cette API Backend gère un **système de paie d'entreprise** complet permettant de :
- Gérer les entreprises et leurs employés
- Calculer et suivre les salaires
- Générer des bulletins de paie
- Effectuer les paiements
- Fournir des statistiques et tableaux de bord

**Architecture :** Node.js + TypeScript + Prisma + SQLite  
**Sécurité :** JWT avec rôles (SUPER_ADMIN, ADMIN, CAISSIER)

---

## 🔐 AUTHENTIFICATION - Gestion des Utilisateurs

### **POST** `/api/auth/connexion`
**🎯 Objectif :** Permettre aux utilisateurs de se connecter au système  
**💼 Cas d'usage :** Un administrateur RH ou un caissier veut accéder au système  
**🔧 Fonctionnalité :** 
- Vérifie les identifiants (email + mot de passe)
- Retourne un token JWT pour sécuriser les requêtes suivantes
- Identifie le rôle de l'utilisateur (SUPER_ADMIN, ADMIN, CAISSIER)

**📋 Données requises :**
```json
{
  "email": "admin@entreprise.com",
  "motDePasse": "motdepasse123"
}
```

**📤 Réponse :**
```json
{
  "utilisateur": {
    "id": 1,
    "email": "admin@entreprise.com",
    "role": "ADMIN",
    "entrepriseId": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **GET** `/api/auth/profil`
**🎯 Objectif :** Récupérer les informations du profil utilisateur connecté  
**💼 Cas d'usage :** Afficher le nom de l'utilisateur dans l'interface  
**🔧 Fonctionnalité :** 
- Utilise le token JWT pour identifier l'utilisateur
- Retourne les informations de profil (nom, rôle, entreprise)

---

## 🏢 ENTREPRISES - Gestion Multi-Entreprise

### **GET** `/api/entreprises`
**🎯 Objectif :** Lister toutes les entreprises du système  
**💼 Cas d'usage :** Un SUPER_ADMIN veut voir toutes les entreprises clientes  
**🔧 Fonctionnalité :** 
- SUPER_ADMIN : Voit toutes les entreprises
- ADMIN/CAISSIER : Voit seulement son entreprise
- Inclut les statistiques (nombre d'employés, masse salariale)

**📤 Réponse :**
```json
[
  {
    "id": 1,
    "nom": "TechCorp SA",
    "adresse": "Dakar, Sénégal",
    "email": "contact@techcorp.sn",
    "nombreEmployes": 25,
    "nombreEmployesActifs": 23,
    "masseSalarialeMensuelle": 15750000
  }
]
```

### **GET** `/api/entreprises/{id}`
**🎯 Objectif :** Obtenir les détails d'une entreprise spécifique  
**💼 Cas d'usage :** Consulter les informations complètes d'une entreprise  
**🔧 Fonctionnalité :** 
- Informations complètes (coordonnées, paramètres de paie)
- Statistiques détaillées des employés
- Vérification des droits d'accès

### **POST** `/api/entreprises`
**🎯 Objectif :** Créer une nouvelle entreprise cliente  
**💼 Cas d'usage :** Un SUPER_ADMIN ajoute un nouveau client au système  
**🔧 Fonctionnalité :** 
- Création avec informations de base
- Configuration par défaut (devise XOF, paie mensuelle)
- Validation de l'unicité du nom

**📋 Données requises :**
```json
{
  "nom": "Nouvelle Entreprise SARL",
  "adresse": "123 Rue de l'Entreprise, Dakar",
  "email": "contact@nouvelle-entreprise.sn",
  "telephone": "+221 33 123 45 67",
  "devise": "XOF",
  "periodePaie": "MENSUELLE"
}
```

### **PUT** `/api/entreprises/{id}`
**🎯 Objectif :** Modifier les informations d'une entreprise  
**💼 Cas d'usage :** Mettre à jour les coordonnées ou paramètres d'une entreprise  
**🔧 Fonctionnalité :** 
- Modification partielle des champs
- Validation des nouveaux paramètres
- Historique des modifications

---

## 👥 EMPLOYÉS - Gestion du Personnel

### **GET** `/api/entreprises/{id}/employes`
**🎯 Objectif :** Lister tous les employés d'une entreprise  
**💼 Cas d'usage :** Un RH veut voir la liste complète du personnel  
**🔧 Fonctionnalité :** 
- Filtrage possible (actifs/inactifs, type de contrat, poste)
- Recherche par nom/prénom/email/code
- Tri par statut puis nom alphabétique

**🔍 Filtres disponibles :**
- `?actif=true` : Seulement les employés actifs
- `?typeContrat=FIXE` : Par type de contrat
- `?poste=Développeur` : Par poste
- `?recherche=jean` : Recherche textuelle

### **POST** `/api/entreprises/{id}/employes`
**🎯 Objectif :** Ajouter un nouvel employé à l'entreprise  
**💼 Cas d'usage :** Un RH recrute un nouveau collaborateur  
**🔧 Fonctionnalité :** 
- **🚨 FIX APPLIQUÉ :** Vérification que l'entreprise existe (résout le problème de clé étrangère)
- Validation du code employé unique dans l'entreprise
- Différents types de contrats : FIXE, JOURNALIER, HONORAIRE
- Calcul automatique selon le type de contrat

**📋 Types de Contrats :**

**FIXE :** Salaire mensuel fixe
```json
{
  "codeEmploye": "DEV001",
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@entreprise.com",
  "poste": "Développeur Senior",
  "typeContrat": "FIXE",
  "salaireBase": 750000,
  "dateEmbauche": "2025-01-15T00:00:00.000Z"
}
```

**JOURNALIER :** Payé au nombre de jours travaillés
```json
{
  "codeEmploye": "OUV001",
  "prenom": "Ahmed",
  "nom": "Diallo",
  "poste": "Ouvrier",
  "typeContrat": "JOURNALIER",
  "tauxJournalier": 25000,
  "dateEmbauche": "2025-01-15T00:00:00.000Z"
}
```

**HONORAIRE :** Consultants/Freelances
```json
{
  "codeEmploye": "CONS001",
  "prenom": "Marie",
  "nom": "Martin",
  "poste": "Consultante Marketing",
  "typeContrat": "HONORAIRE",
  "salaireBase": 500000,
  "dateEmbauche": "2025-01-15T00:00:00.000Z"
}
```

### **GET** `/api/employes/{id}`
**🎯 Objectif :** Obtenir les détails complets d'un employé  
**💼 Cas d'usage :** Consulter le dossier personnel d'un employé  
**🔧 Fonctionnalité :** 
- Informations personnelles et professionnelles
- Historique des modifications de salaire
- Statut actuel (actif/inactif)

### **PUT** `/api/employes/{id}`
**🎯 Objectif :** Modifier les informations d'un employé  
**💼 Cas d'usage :** Promotion, augmentation, changement de poste  
**🔧 Fonctionnalité :** 
- Modification des informations personnelles
- Ajustement de salaire
- Changement de statut (activation/désactivation)

### **GET** `/api/entreprises/{id}/employes/statistiques`
**🎯 Objectif :** Obtenir les statistiques des employés  
**💼 Cas d'usage :** Tableau de bord RH  
**🔧 Fonctionnalité :** 
- Nombre total d'employés
- Répartition actifs/inactifs
- Masse salariale globale

**📤 Réponse :**
```json
{
  "nombreTotal": 25,
  "nombreActifs": 23,
  "nombreInactifs": 2,
  "masseSalarialeTotale": 15750000
}
```

---

## 💰 CYCLES DE PAIE - Gestion des Périodes de Salaire

### **GET** `/api/entreprises/{id}/cycles-paie`
**🎯 Objectif :** Lister tous les cycles de paie d'une entreprise  
**💼 Cas d'usage :** Un comptable veut voir l'historique des paies  
**🔧 Fonctionnalité :** 
- Cycles triés par date (plus récent en premier)
- Statuts : BROUILLON, APPROUVE, CLOTURE
- Totaux calculés (brut, net, payé)

### **POST** `/api/entreprises/{id}/cycles-paie`
**🎯 Objectif :** Créer un nouveau cycle de paie (mois/période)  
**💼 Cas d'usage :** Début du mois, on prépare la paie du mois précédent  
**🔧 Fonctionnalité :** 
- Définition de la période (ex: Janvier 2025)
- Dates de début et fin
- Génération automatique des bulletins pour tous les employés actifs

**📋 Données requises :**
```json
{
  "titre": "Paie Janvier 2025",
  "periode": "2025-01",
  "dateDebut": "2025-01-01T00:00:00.000Z",
  "dateFin": "2025-01-31T23:59:59.999Z"
}
```

### **GET** `/api/cycles-paie/{id}`
**🎯 Objectif :** Obtenir les détails d'un cycle spécifique  
**💼 Cas d'usage :** Consulter les détails d'une paie mensuelle  
**🔧 Fonctionnalité :** 
- Informations du cycle
- Liste des bulletins associés
- Totaux et statistiques

### **POST** `/api/cycles-paie/{id}/generer-bulletins`
**🎯 Objectif :** Générer automatiquement tous les bulletins de paie  
**💼 Cas d'usage :** Calcul automatique des salaires du mois  
**🔧 Fonctionnalité :** 
- Création d'un bulletin par employé actif
- Calcul automatique selon le type de contrat
- Numérotation séquentielle des bulletins

### **POST** `/api/cycles-paie/{id}/approuver`
**🎯 Objectif :** Approuver définitivement un cycle de paie  
**💼 Cas d'usage :** Validation finale par le responsable comptable  
**🔧 Fonctionnalité :** 
- Passage du statut BROUILLON à APPROUVE
- Verrouillage des modifications
- Préparation pour les paiements

---

## 📄 BULLETINS DE PAIE - Détail des Salaires Individuels

### **GET** `/api/cycles-paie/{id}/bulletins`
**🎯 Objectif :** Lister tous les bulletins d'un cycle de paie  
**💼 Cas d'usage :** Voir tous les salaires calculés pour un mois donné  
**🔧 Fonctionnalité :** 
- Bulletins avec détails employés
- Montants calculés (brut, déductions, net)
- Statuts de paiement
- Historique des paiements

### **GET** `/api/bulletins/{id}`
**🎯 Objectif :** Obtenir le détail d'un bulletin de paie spécifique  
**💼 Cas d'usage :** Consulter le bulletin d'un employé particulier  
**🔧 Fonctionnalité :** 
- Détail complet du calcul
- Informations de l'employé
- Historique des paiements effectués

**📤 Structure d'un bulletin :**
```json
{
  "id": 10,
  "numeroBulletin": "BP-00000001-00000002",
  "salaireBrut": 750000,
  "deductions": 75000,
  "salaireNet": 675000,
  "montantPaye": 675000,
  "statut": "PAYE",
  "employe": {
    "codeEmploye": "DEV001",
    "prenom": "Jean",
    "nom": "Dupont",
    "poste": "Développeur Senior"
  },
  "paiements": [
    {
      "montant": 675000,
      "methodePaiement": "VIREMENT_BANCAIRE",
      "reference": "VIR-2025-001"
    }
  ]
}
```

### **PUT** `/api/bulletins/{id}`
**🎯 Objectif :** Modifier un bulletin de paie  
**💼 Cas d'usage :** Ajustement de dernière minute (prime, déduction)  
**🔧 Fonctionnalité :** 
- Modification des montants
- Ajout/retrait de déductions
- Recalcul automatique du net

### **POST** `/api/bulletins/{id}/recalculer`
**🎯 Objectif :** Recalculer automatiquement un bulletin  
**💼 Cas d'usage :** Après modification du salaire de base de l'employé  
**🔧 Fonctionnalité :** 
- Nouveau calcul basé sur les données actuelles
- Mise à jour des montants
- Conservation de l'historique

---

## 💳 PAIEMENTS - Gestion des Versements

### **GET** `/api/bulletins/{id}/paiements`
**🎯 Objectif :** Lister tous les paiements d'un bulletin  
**💼 Cas d'usage :** Voir l'historique des versements d'un salaire  
**🔧 Fonctionnalité :** 
- Historique chronologique des paiements
- Différentes méthodes de paiement
- Statut global du bulletin (EN_ATTENTE, PARTIEL, PAYE)

### **POST** `/api/bulletins/{id}/paiements`
**🎯 Objectif :** Enregistrer un nouveau paiement  
**💼 Cas d'usage :** Un caissier effectue le versement du salaire  
**🔧 Fonctionnalité :** 
- Choix de la méthode de paiement
- Génération automatique du numéro de reçu
- Mise à jour du statut du bulletin
- Calcul du solde restant

**📋 Méthodes de paiement :**
- `ESPECES` : Paiement en liquide
- `VIREMENT_BANCAIRE` : Virement sur compte
- `ORANGE_MONEY` : Mobile Money Orange
- `WAVE` : Mobile Money Wave
- `AUTRE` : Autres méthodes

**📋 Données requises :**
```json
{
  "montant": 675000,
  "methodePaiement": "VIREMENT_BANCAIRE",
  "reference": "VIR-2025-001",
  "notes": "Virement salaire janvier 2025"
}
```

### **GET** `/api/paiements/{id}`
**🎯 Objectif :** Obtenir les détails d'un paiement spécifique  
**💼 Cas d'usage :** Consulter un reçu de paiement  
**🔧 Fonctionnalité :** 
- Détails complets du paiement
- Numéro de reçu pour justification
- Informations de traçabilité

---

## 📊 DASHBOARD - Tableaux de Bord et Statistiques

### **GET** `/api/entreprises/{id}/dashboard/kpis`
**🎯 Objectif :** Obtenir les indicateurs clés de performance RH  
**💼 Cas d'usage :** Dashboard principal pour les dirigeants  
**🔧 Fonctionnalité :** 
- Vue d'ensemble de l'entreprise
- Métriques temps réel
- Indicateurs financiers

**📤 KPIs retournés :**
```json
{
  "nombreEmployes": 25,
  "nombreEmployesActifs": 23,
  "masseSalarialeMensuelle": 15750000,
  "montantPaye": 14200000,
  "montantRestant": 1550000,
  "tauxPaiement": 90.2
}
```

### **GET** `/api/entreprises/{id}/dashboard/evolution-masse-salariale`
**🎯 Objectif :** Suivre l'évolution de la masse salariale sur 6 mois  
**💼 Cas d'usage :** Analyse des tendances RH et budgétaires  
**🔧 Fonctionnalité :** 
- Historique des 6 derniers mois
- Évolution graphique des coûts
- Aide à la planification budgétaire

**📤 Données d'évolution :**
```json
[
  {"mois": "août 2024", "montant": 14500000},
  {"mois": "sept. 2024", "montant": 15200000},
  {"mois": "oct. 2024", "montant": 15750000},
  {"mois": "nov. 2024", "montant": 15750000},
  {"mois": "déc. 2024", "montant": 16100000},
  {"mois": "janv. 2025", "montant": 15750000}
]
```

### **GET** `/api/entreprises/{id}/dashboard/prochains-paiements`
**🎯 Objectif :** Afficher les paiements à effectuer prochainement  
**💼 Cas d'usage :** Planning de trésorerie et rappels de paiement  
**🔧 Fonctionnalité :** 
- Bulletins en attente de paiement
- Paiements partiels à compléter
- Montants et échéances

---

## 🔒 SÉCURITÉ ET CONTRÔLES D'ACCÈS

### **Système de Rôles**

**🔴 SUPER_ADMIN :**
- Accès à toutes les entreprises
- Création/modification d'entreprises
- Gestion globale du système

**🟡 ADMIN :**
- Accès à son entreprise uniquement
- Gestion complète des employés
- Création des cycles de paie
- Validation des bulletins

**🟢 CAISSIER :**
- Accès en lecture à son entreprise
- Consultation des bulletins
- Enregistrement des paiements
- Génération des reçus

### **Middleware de Sécurité**

1. **`authentifier`** : Vérifie la validité du token JWT
2. **`autoriserRoles`** : Contrôle les permissions par rôle
3. **`verifierEntreprise`** : Limite l'accès aux données de l'entreprise de l'utilisateur

---

## 🎯 WORKFLOWS TYPIQUES

### **📅 Workflow Mensuel de Paie**

1. **Création du cycle** (Admin)
   ```
   POST /api/entreprises/1/cycles-paie
   ```

2. **Génération des bulletins** (Admin)
   ```
   POST /api/cycles-paie/5/generer-bulletins
   ```

3. **Révision et ajustements** (Admin)
   ```
   PUT /api/bulletins/15 (si nécessaire)
   ```

4. **Approbation du cycle** (Admin)
   ```
   POST /api/cycles-paie/5/approuver
   ```

5. **Paiements individuels** (Caissier)
   ```
   POST /api/bulletins/15/paiements
   POST /api/bulletins/16/paiements
   ...
   ```

### **👤 Workflow de Gestion d'Employé**

1. **Recrutement** (Admin)
   ```
   POST /api/entreprises/1/employes
   ```

2. **Modifications en cours d'emploi** (Admin)
   ```
   PUT /api/employes/25 (promotion, augmentation)
   ```

3. **Consultation régulière** (Admin/Caissier)
   ```
   GET /api/employes/25
   GET /api/entreprises/1/employes/statistiques
   ```

---

## 💡 POINTS CLÉS DU SYSTÈME

### **🚨 Problème Résolu : Violation de Clé Étrangère**
- **Cause :** Tentative de création d'employé dans une entreprise inexistante
- **Solution :** Validation préalable de l'existence de l'entreprise
- **Impact :** Plus d'erreurs de clé étrangère lors de la création d'employés

### **💰 Calculs Automatiques**
- Salaires calculés selon le type de contrat
- Bulletins générés automatiquement
- Totaux mis à jour en temps réel

### **🔄 Traçabilité Complète**
- Historique de tous les paiements
- Numéros de reçus uniques
- Audit trail des modifications

### **📱 Multi-Entreprise**
- Gestion de plusieurs entreprises clientes
- Isolation des données par entreprise
- Facturation et reporting séparés

---

## 🏁 CONCLUSION

Cette API fournit une **solution complète de gestion de paie** avec :

✅ **Gestion multi-entreprise** sécurisée  
✅ **Calculs automatiques** selon les types de contrats  
✅ **Workflows complets** de paie mensuelle  
✅ **Traçabilité** et audit des paiements  
✅ **Tableaux de bord** avec KPIs en temps réel  
✅ **Sécurité robuste** avec contrôle d'accès par rôles  

**31 endpoints** couvrent tous les besoins d'une solution de paie professionnelle, de la gestion des employés jusqu'aux statistiques avancées.

**Status :** 🟢 Production Ready  
**Dernière mise à jour :** 27 septembre 2025