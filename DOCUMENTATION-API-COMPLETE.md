# Documentation API - Backend Gestion des Salaires

## 📋 Vue d'ensemble

API RESTful pour la gestion des salaires d'entreprise avec authentification JWT, rôles utilisateurs et gestion complète des pointages, bulletins de paie et paiements.

**URL de base**: `http://localhost:3000/api`

## 🔐 Authentification

### Type d'authentification
- **JWT (JSON Web Token)** avec cookies HTTP-only
- Token également accepté dans l'header `Authorization: Bearer <token>`

### Rôles utilisateurs
- `SUPER_ADMIN`: Accès global à toutes les entreprises
- `ADMIN`: Gestion d'une entreprise spécifique
- `CAISSIER`: Consultation et paiements uniquement

### Headers requis
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>  // Optionnel si cookie présent
```

### Format du token
```json
{
  "id": 1,
  "email": "admin@example.com",
  "role": "ADMIN",
  "entrepriseId": 1,
  "iat": 1696512000,
  "exp": 1696598400
}
```

## 🏢 Modèles de Données

### Entreprise
```typescript
{
  id: number
  nom: string
  logo?: string // URL base64 ou chemin
  couleur: string // Code hex (ex: "#3B82F6")
  adresse?: string
  telephone?: string
  email?: string
  devise: string // Par défaut "XOF"
  periodePaie: "JOURNALIERE" | "HEBDOMADAIRE" | "MENSUELLE"
  estActif: boolean
  accesSuperAdminAutorise: boolean
  creeLe: Date
  misAJourLe: Date
}
```

### Utilisateur
```typescript
{
  id: number
  email: string
  prenom: string
  nom: string
  role: "SUPER_ADMIN" | "ADMIN" | "CAISSIER"
  estActif: boolean
  derniereConnexion?: Date
  entrepriseId?: number // null pour SUPER_ADMIN
  creeLe: Date
  misAJourLe: Date
}
```

### Employé
```typescript
{
  id: number
  codeEmploye: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  poste: string
  typeContrat: "JOURNALIER" | "FIXE" | "HONORAIRE" | "HORAIRE"
  salaireBase?: number // Pour FIXE
  tauxJournalier?: number // Pour JOURNALIER
  tauxHoraire?: number // Pour HONORAIRE
  compteBancaire?: string
  estActif: boolean
  dateEmbauche: Date
  entrepriseId: number
  creeLe: Date
  misAJourLe: Date
}
```

### Pointage
```typescript
{
  id: number
  date: Date // Jour du pointage (00:00:00)
  heureArrivee?: Date
  heureDepart?: Date
  dureeMinutes?: number
  statut: "PRESENT" | "ABSENT" | "RETARD" | "CONGE" | "MALADIE" | "TELETRAVAIL"
  notes?: string
  estValide: boolean
  valideParId?: number // ID de l'admin validateur
  dateValidation?: Date
  employeId: number
  entrepriseId: number
  creeLe: Date
  misAJourLe: Date
}
```

### BulletinPaie
```typescript
{
  id: number
  numeroBulletin: string
  // Champs pour journaliers
  joursTravailes?: number
  tauxJournalier?: number
  // Champs pour honoraires
  totalHeuresTravaillees?: number
  tauxHoraire?: number
  // Champs communs
  salaireBrut: number
  deductions: number
  salaireNet: number
  montantPaye: number
  // Champs pour absences (mensuels)
  nombreAbsences?: number
  joursAbsences?: string // JSON array
  montantDeduction?: number
  statut: "EN_ATTENTE" | "PARTIEL" | "PAYE"
  employeId: number
  cyclePaieId: number
  creeLe: Date
  misAJourLe: Date
}
```

### Paiement
```typescript
{
  id: number
  montant: number
  methodePaiement: "ESPECES" | "VIREMENT_BANCAIRE" | "ORANGE_MONEY" | "WAVE" | "AUTRE"
  reference?: string
  notes?: string
  numeroRecu: string // Unique
  bulletinPaieId: number
  traiteParId: number // ID utilisateur
  creeLe: Date
}
```

## 📚 Endpoints API

## 🔐 Authentification (`/api/auth`)

### Connexion
```http
POST /api/auth/login
POST /api/auth/connexion
```
**Body:**
```json
{
  "email": "admin@example.com",
  "motDePasse": "password123"
}
```
**Réponse 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "utilisateur": {
    "id": 1,
    "email": "admin@example.com",
    "prenom": "John",
    "nom": "Doe",
    "role": "ADMIN",
    "entrepriseId": 1
  }
}
```
**Codes de statut:** `200`, `401`, `400`

### Inscription (SUPER_ADMIN uniquement)
```http
POST /api/auth/inscription
```
**Body:**
```json
{
  "email": "superadmin@example.com",
  "motDePasse": "password123",
  "prenom": "Super",
  "nom": "Admin",
  "role": "SUPER_ADMIN"
}
```
**Réponse 201:** Même format que connexion
**Codes de statut:** `201`, `400`, `409`

### Profil utilisateur
```http
GET /api/auth/profil
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`
**Réponse 200:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "prenom": "John",
  "nom": "Doe",
  "role": "ADMIN",
  "entrepriseId": 1,
  "entreprise": {
    "id": 1,
    "nom": "Mon Entreprise",
    "couleur": "#3B82F6"
  }
}
```
**Codes de statut:** `200`, `401`, `404`

### Déconnexion
```http
POST /api/auth/deconnexion
```
**Réponse 200:**
```json
{
  "message": "Déconnexion réussie"
}
```

## 👥 Gestion des Employés (`/api/employes`, `/api/entreprises/:id/employes`)

### Lister les employés d'une entreprise
```http
GET /api/entreprises/:entrepriseId/employes
```
**Params:** `entrepriseId` (number)
**Query optionnels:**
- `page` (number): Page (défaut: 1)
- `limit` (number): Limite par page (défaut: 10)
- `search` (string): Recherche par nom/prénom
- `typeContrat` (string): Filtrer par type
- `estActif` (boolean): Filtrer par statut

**Réponse 200:**
```json
{
  "employes": [
    {
      "id": 1,
      "codeEmploye": "EMP001",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@example.com",
      "poste": "Développeur",
      "typeContrat": "FIXE",
      "salaireBase": 500000,
      "estActif": true,
      "dateEmbauche": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`, `CAISSIER`
**Codes de statut:** `200`, `401`, `403`, `404`

### Créer un employé
```http
POST /api/entreprises/:entrepriseId/employes
POST /api/employes (utilise entrepriseId du token)
```
**Body:**
```json
{
  "codeEmploye": "EMP002",
  "prenom": "Marie",
  "nom": "Martin",
  "email": "marie.martin@example.com",
  "telephone": "+221771234567",
  "poste": "Comptable",
  "typeContrat": "FIXE",
  "salaireBase": 450000,
  "dateEmbauche": "2024-10-01"
}
```
**Réponse 201:**
```json
{
  "message": "Employé créé avec succès",
  "employe": {
    "id": 2,
    "codeEmploye": "EMP002",
    "prenom": "Marie",
    "nom": "Martin",
    // ... autres champs
  }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`
**Codes de statut:** `201`, `400`, `401`, `403`, `409`

### Obtenir un employé
```http
GET /api/employes/:id
```
**Réponse 200:**
```json
{
  "id": 1,
  "codeEmploye": "EMP001",
  // ... tous les champs de l'employé
  "entreprise": {
    "id": 1,
    "nom": "Mon Entreprise"
  }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`, `CAISSIER`
**Codes de statut:** `200`, `401`, `403`, `404`

### Modifier un employé
```http
PUT /api/employes/:id
```
**Body:** Champs à modifier (format identique à la création)
**Réponse 200:**
```json
{
  "message": "Employé modifié avec succès",
  "employe": { /* employé modifié */ }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`
**Codes de statut:** `200`, `400`, `401`, `403`, `404`

### Supprimer un employé
```http
DELETE /api/employes/:id
```
**Réponse 200:**
```json
{
  "message": "Employé supprimé avec succès"
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`
**Codes de statut:** `200`, `401`, `403`, `404`

### Activer/Désactiver un employé
```http
POST /api/employes/:id/activer
POST /api/employes/:id/desactiver
PUT /api/employes/:id/toggle
```
**Réponse 200:**
```json
{
  "message": "Statut employé modifié avec succès",
  "employe": { /* employé avec nouveau statut */ }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`

## ⏰ Gestion des Pointages (`/api/pointages`)

### Enregistrer une arrivée
```http
POST /api/pointages/arrivee
```
**Body:**
```json
{
  "entrepriseId": 1,
  "employeId": 5,
  "notes": "Arrivée normale",
  "date": "2025-10-05" // Optionnel, défaut: aujourd'hui
}
```
**Réponse 201:**
```json
{
  "message": "Arrivée enregistrée avec succès",
  "pointage": {
    "id": 123,
    "employeId": 5,
    "date": "2025-10-05T00:00:00.000Z",
    "heureArrivee": "2025-10-05T08:15:30.000Z",
    "statut": "PRESENT"
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`
**Codes de statut:** `201`, `400`, `401`, `403`, `409`

### Enregistrer un départ
```http
POST /api/pointages/depart
```
**Body:**
```json
{
  "entrepriseId": 1,
  "employeId": 5,
  "notes": "Fin de journée",
  "date": "2025-10-05"
}
```
**Réponse 200:**
```json
{
  "message": "Départ enregistré avec succès",
  "pointage": {
    "id": 123,
    "employeId": 5,
    "heureArrivee": "2025-10-05T08:15:30.000Z",
    "heureDepart": "2025-10-05T17:30:00.000Z",
    "dureeMinutes": 554, // Calculé automatiquement
    "statut": "PRESENT"
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`
**Codes de statut:** `200`, `400`, `401`, `403`, `404`

### Créer une absence
```http
POST /api/pointages/absence
```
**Body:**
```json
{
  "entrepriseId": 1,
  "employeId": 5,
  "date": "2025-10-05",
  "statut": "ABSENT", // ou "CONGE", "MALADIE"
  "notes": "Congé maladie"
}
```
**Réponse 201:**
```json
{
  "message": "Absence enregistrée avec succès",
  "pointage": {
    "id": 124,
    "employeId": 5,
    "date": "2025-10-05T00:00:00.000Z",
    "statut": "ABSENT",
    "heureArrivee": null,
    "heureDepart": null,
    "dureeMinutes": 0
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`

### Lister les pointages d'une entreprise
```http
GET /api/entreprises/:entrepriseId/pointages
```
**Query optionnels:**
- `du` (date): Date début (YYYY-MM-DD)
- `au` (date): Date fin (YYYY-MM-DD)
- `employeId` (number): Filtrer par employé
- `statut` (string): Filtrer par statut

**Réponse 200:**
```json
{
  "pointages": [
    {
      "id": 123,
      "date": "2025-10-05T00:00:00.000Z",
      "heureArrivee": "2025-10-05T08:15:30.000Z",
      "heureDepart": "2025-10-05T17:30:00.000Z",
      "dureeMinutes": 554,
      "statut": "PRESENT",
      "employe": {
        "id": 5,
        "prenom": "Jean",
        "nom": "Dupont",
        "codeEmploye": "EMP005"
      }
    }
  ]
}
```
**Rôles:** `ADMIN`, `SUPER_ADMIN`

### Mettre à jour un pointage
```http
PUT /api/pointages/:id
```
**Body:**
```json
{
  "heureArrivee": "2025-10-05T08:00:00.000Z",
  "heureDepart": "2025-10-05T17:00:00.000Z",
  "statut": "PRESENT",
  "notes": "Horaires corrigés"
}
```
**Réponse 200:**
```json
{
  "message": "Pointage mis à jour avec succès",
  "pointage": {
    // pointage mis à jour avec dureeMinutes recalculée
  }
}
```
**Rôles:** `ADMIN`

### Recalculer la durée d'un pointage
```http
POST /api/pointages/:id/recalculer-duree
```
**Réponse 200:**
```json
{
  "message": "Durée recalculée avec succès",
  "pointage": {
    "id": 123,
    "dureeMinutes": 540, // Nouvelle durée calculée
    // autres champs...
  }
}
```
**Rôles:** `ADMIN`

## 💰 Gestion des Paiements (`/api/paiements`, `/api/bulletins`)

### Lister tous les paiements
```http
GET /api/paiements
```
**Query optionnels:**
- `page` (number): Numéro de page
- `limit` (number): Limite par page
- `entrepriseId` (number): Filtrer par entreprise
- `methodePaiement` (string): Filtrer par méthode
- `dateDebut` (date): Date début
- `dateFin` (date): Date fin

**Réponse 200:**
```json
{
  "paiements": [
    {
      "id": 1,
      "montant": 500000,
      "methodePaiement": "VIREMENT_BANCAIRE",
      "reference": "VIR-2025-001",
      "numeroRecu": "REC-2025-001",
      "creeLe": "2025-10-05T10:30:00.000Z",
      "bulletinPaie": {
        "numeroBulletin": "BULL-2025-001",
        "employe": {
          "prenom": "Jean",
          "nom": "Dupont"
        }
      },
      "traitePar": {
        "prenom": "Admin",
        "nom": "User"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`, `CAISSIER`

### Créer un paiement
```http
POST /api/bulletins/:bulletinId/paiements
```
**Body:**
```json
{
  "montant": 500000,
  "methodePaiement": "ESPECES",
  "reference": "ESP-2025-001",
  "notes": "Paiement en espèces"
}
```
**Réponse 201:**
```json
{
  "message": "Paiement créé avec succès",
  "paiement": {
    "id": 10,
    "montant": 500000,
    "methodePaiement": "ESPECES",
    "numeroRecu": "REC-2025-010",
    "bulletinPaieId": 5,
    "traiteParId": 1,
    "creeLe": "2025-10-05T14:30:00.000Z"
  }
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`, `CAISSIER`
**Codes de statut:** `201`, `400`, `401`, `403`, `404`

### Générer un reçu PDF
```http
GET /api/paiements/:id/recu
```
**Réponse 200:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=recu-REC-2025-001.pdf`

**Rôles:** `SUPER_ADMIN`, `ADMIN`, `CAISSIER`

## 📊 Calcul des Salaires (`/api/calculSalaire`)

### Calculer le salaire d'un employé
```http
GET /api/employes/:employeId/cycles/:cyclePaieId/calculer-salaire
```
**Réponse 200:**
```json
{
  "success": true,
  "message": "Salaire calculé avec succès",
  "data": {
    "typeContrat": "HONORAIRE",
    "heuresTravaillees": 42.5,
    "tauxHoraire": 2500,
    "salaireBrut": 106250,
    "deductions": 0,
    "salaireNet": 106250,
    "montantAPayer": 106250,
    "details": {
      "nombreJoursTravailles": 8,
      "joursPresents": ["01/10/2025", "02/10/2025"],
      "pointagesDetailles": [
        {
          "date": "01/10/2025",
          "heureArrivee": "08:00:00",
          "heureDepart": "17:00:00",
          "dureeMinutes": 540,
          "heuresCalculees": 9.0
        }
      ]
    }
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`
**Codes de statut:** `200`, `400`, `401`, `403`, `404`

### Recalculer et mettre à jour un bulletin
```http
POST /api/bulletins/:bulletinId/calculer-et-mettre-a-jour
```
**Réponse 200:**
```json
{
  "success": true,
  "message": "Bulletin de paie calculé et mis à jour avec succès",
  "data": {
    "bulletin": {
      "id": 5,
      "numeroBulletin": "BULL-2025-005",
      "salaireBrut": 106250,
      "salaireNet": 106250,
      "totalHeuresTravaillees": 42.5,
      "tauxHoraire": 2500
    },
    "calculs": {
      // Structure identique à l'endpoint de calcul
    }
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`

### Obtenir les détails de calcul d'un bulletin
```http
GET /api/bulletins/:bulletinId/details-calcul
```
**Réponse 200:**
```json
{
  "success": true,
  "message": "Détails de calcul obtenus avec succès",
  "data": {
    "bulletin": {
      "id": 5,
      "numeroBulletin": "BULL-2025-005",
      "statut": "EN_ATTENTE"
    },
    "calculs": {
      // Structure de calcul complète
    },
    "comparaison": {
      "salaireBrutStocke": 100000,
      "salaireBrutCalcule": 106250,
      "salaireNetStocke": 100000,
      "salaireNetCalcule": 106250,
      "tauxHoraireStocke": 0,
      "tauxHoraireCalcule": 2500,
      "heuresStockees": 0,
      "heuresCalculees": 42.5
    }
  }
}
```
**Rôles:** `ADMIN`, `CAISSIER`

## 📈 Dashboard et Statistiques (`/api/dashboard`)

### Statistiques générales d'une entreprise
```http
GET /api/entreprises/:entrepriseId/dashboard
```
**Réponse 200:**
```json
{
  "entreprise": {
    "id": 1,
    "nom": "Mon Entreprise"
  },
  "statistiques": {
    "totalEmployes": 25,
    "employesActifs": 23,
    "employesInactifs": 2,
    "totalBulletins": 150,
    "bulletinsEnAttente": 10,
    "bulletinsPaies": 140,
    "totalPaiements": 1250000,
    "paiementsCeMois": 850000
  },
  "repartitionContrats": {
    "FIXE": 15,
    "JOURNALIER": 8,
    "HONORAIRE": 2
  },
  "evolutionPaiements": [
    { "mois": "2025-08", "montant": 1100000 },
    { "mois": "2025-09", "montant": 1200000 },
    { "mois": "2025-10", "montant": 850000 }
  ]
}
```
**Rôles:** `SUPER_ADMIN`, `ADMIN`

## ⚙️ Variables d'Environnement Frontend

```env
# URL de l'API Backend
VITE_API_URL=http://localhost:3000/api

# URL pour les fichiers uploadés (logos, etc.)
VITE_UPLOADS_URL=http://localhost:3000/uploads

# Configuration optionnelle
VITE_APP_NAME=Gestion des Salaires
VITE_APP_VERSION=1.0.0

# Pour le développement
VITE_DEBUG=true
```

## 🚨 Codes d'Erreur Standard

### Codes de statut HTTP
- `200`: Succès
- `201`: Créé avec succès
- `400`: Requête invalide (données manquantes/incorrectes)
- `401`: Non authentifié (token manquant/invalide)
- `403`: Non autorisé (permissions insuffisantes)
- `404`: Ressource non trouvée
- `409`: Conflit (données déjà existantes)
- `500`: Erreur serveur interne

### Format des erreurs
```json
{
  "message": "Description de l'erreur",
  "errors": {
    "field1": {
      "_errors": ["Champ requis"]
    },
    "field2": {
      "_errors": ["Format invalide"]
    }
  }
}
```

## 📝 Notes d'Utilisation

### Pagination
La plupart des endpoints de listing supportent la pagination avec les paramètres :
- `page`: Numéro de page (défaut: 1)
- `limit`: Éléments par page (défaut: 10, max: 100)

### Filtres de date
Les dates doivent être au format ISO 8601 : `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ss.sssZ`

### Gestion des erreurs côté frontend
```javascript
try {
  const response = await fetch('/api/employes', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Erreur API:', error.message);
  throw error;
}
```

### Calcul automatique des durées
Les durées de pointage sont calculées automatiquement :
1. **Priorité 1** : Utilisation du champ `dureeMinutes` si renseigné
2. **Priorité 2** : Calcul `(heureDepart - heureArrivee)` en minutes
3. **Exclusion** : Les pointages sans `heureDepart` sont ignorés

### Types de contrats et calculs
- **FIXE** : `salaireBase - (absences × 15,000 F CFA)`
- **JOURNALIER** : `joursPresents × tauxJournalier`
- **HONORAIRE** : `heuresTravaillees × tauxHoraire`

Cette documentation couvre tous les aspects principaux de l'API. Pour des détails spécifiques ou des cas d'usage particuliers, consultez les contrôleurs et services dans le code source.