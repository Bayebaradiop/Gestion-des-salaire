# 🚀 API Backend - Guide de Tests Postman

## 📋 Table des Matières
- [Configuration Initiale](#configuration-initiale)
- [Variables d'Environnement](#variables-denvironnement)
- [Tests d'Authentification](#tests-dauthentification)
- [Tests des Entreprises](#tests-des-entreprises)
- [Tests des Employés](#tests-des-employés)
- [Tests des Cycles de Paie](#tests-des-cycles-de-paie)
- [Tests des Bulletins de Paie](#tests-des-bulletins-de-paie)
- [Tests du Dashboard](#tests-du-dashboard)
- [Tests des Paiements](#tests-des-paiements)
- [Collection Postman](#collection-postman)

---

## 🛠 Configuration Initiale

### Pré-requis
1. Serveur démarré sur `http://localhost:3000`
2. Base de données seedée avec les données de test
3. Postman installé

### Démarrage du serveur
```bash
cd /home/mouhamadou-lamine/nodeJs/Backend
npm run dev
```

---

## 🔧 Variables d'Environnement

Créez un environnement Postman avec ces variables :

| Variable | Valeur |
|----------|---------|
| `base_url` | `http://localhost:3000` |
| `token` | *(sera rempli automatiquement après connexion)* |
| `entreprise_id` | `1` |
| `employe_id` | `1` |
| `cycle_id` | `1` |
| `bulletin_id` | `9` |

---

## 🔐 Tests d'Authentification

### 1. Connexion Super Admin
**POST** `{{base_url}}/api/auth/connexion`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "superadmin@testsa.com",
  "motDePasse": "password123"
}
```

**Tests Postman:**
```javascript
pm.test("Connexion réussie", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('token');
    pm.expect(responseJson).to.have.property('utilisateur');
    
    // Sauvegarder le token pour les requêtes suivantes
    pm.environment.set("token", responseJson.token);
});
```

### 2. Connexion Admin
**POST** `{{base_url}}/api/auth/connexion`

**Body (JSON):**
```json
{
  "email": "admin@testsa.com",
  "motDePasse": "password123"
}
```

### 3. Connexion Caissier
**POST** `{{base_url}}/api/auth/connexion`

**Body (JSON):**
```json
{
  "email": "caissier@testsa.com",
  "motDePasse": "password123"
}
```

### 4. Profil Utilisateur
**GET** `{{base_url}}/api/auth/profil`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 5. Connexion Échouée
**POST** `{{base_url}}/api/auth/connexion`

**Body (JSON):**
```json
{
  "email": "wrong@email.com",
  "motDePasse": "wrongpassword"
}
```

**Tests Postman:**
```javascript
pm.test("Connexion échouée - 401", function () {
    pm.response.to.have.status(401);
});
```

---

## 🏢 Tests des Entreprises

### 1. Lister Toutes les Entreprises
**GET** `{{base_url}}/api/entreprises`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Tests Postman:**
```javascript
pm.test("Liste des entreprises", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('array');
    pm.expect(responseJson.length).to.be.greaterThan(0);
    
    // Vérifier la structure
    responseJson.forEach(entreprise => {
        pm.expect(entreprise).to.have.property('id');
        pm.expect(entreprise).to.have.property('nom');
        pm.expect(entreprise).to.have.property('nombreEmployes');
    });
});
```

### 2. Obtenir Entreprise par ID
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 3. Créer Nouvelle Entreprise
**POST** `{{base_url}}/api/entreprises`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nom": "Nouvelle Entreprise Postman",
  "adresse": "123 Rue Test Postman",
  "email": "postman@test.com",
  "telephone": "+221123456789",
  "devise": "XOF",
  "periodePaie": "MENSUELLE"
}
```

**Tests Postman:**
```javascript
pm.test("Entreprise créée", function () {
    pm.response.to.have.status(201);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('id');
    pm.expect(responseJson.nom).to.eql("Nouvelle Entreprise Postman");
    
    // Sauvegarder l'ID pour les tests suivants
    pm.environment.set("nouvelle_entreprise_id", responseJson.id);
});
```

### 4. Modifier Entreprise
**PUT** `{{base_url}}/api/entreprises/{{entreprise_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nom": "Entreprise Modifiée Postman",
  "telephone": "+221987654321"
}
```

### 5. Entreprise Inexistante (Test d'erreur)
**GET** `{{base_url}}/api/entreprises/999`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Tests Postman:**
```javascript
pm.test("Entreprise inexistante - 404", function () {
    pm.response.to.have.status(404);
});
```

---

## 👥 Tests des Employés

### 1. Lister Employés d'une Entreprise
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Tests Postman:**
```javascript
pm.test("Liste des employés", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('array');
    
    if (responseJson.length > 0) {
        pm.expect(responseJson[0]).to.have.property('codeEmploye');
        pm.expect(responseJson[0]).to.have.property('prenom');
        pm.expect(responseJson[0]).to.have.property('nom');
    }
});
```

### 2. Lister Employés avec Filtres
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes?actif=true&typeContrat=FIXE`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 3. Créer Nouvel Employé
**POST** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "codeEmploye": "POST001",
  "prenom": "Postman",
  "nom": "Test",
  "email": "postman.test@example.com",
  "telephone": "+221 77 999 88 77",
  "poste": "Testeur API",
  "typeContrat": "FIXE",
  "salaireBase": 450000,
  "dateEmbauche": "2025-01-01T00:00:00.000Z",
  "compteBancaire": "SN987654321"
}
```

**Tests Postman:**
```javascript
pm.test("Employé créé", function () {
    pm.response.to.have.status(201);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('id');
    pm.expect(responseJson.codeEmploye).to.eql("POST001");
    pm.expect(responseJson.prenom).to.eql("Postman");
    
    // Sauvegarder l'ID
    pm.environment.set("nouvel_employe_id", responseJson.id);
});
```

### 4. Créer Employé Journalier
**POST** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes`

**Body (JSON):**
```json
{
  "codeEmploye": "JOUR001",
  "prenom": "Travailleur",
  "nom": "Journalier",
  "poste": "Ouvrier",
  "typeContrat": "JOURNALIER",
  "tauxJournalier": 25000,
  "dateEmbauche": "2025-01-01T00:00:00.000Z"
}
```

### 5. Obtenir Employé par ID
**GET** `{{base_url}}/api/employes/{{employe_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 6. Modifier Employé
**PUT** `{{base_url}}/api/employes/{{employe_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "prenom": "Jean Modifié",
  "salaireBase": 850000,
  "poste": "Développeur Senior Lead"
}
```

### 7. Statistiques des Employés
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes/statistiques`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 8. Test d'Erreur - Code Employé Existant
**POST** `{{base_url}}/api/entreprises/{{entreprise_id}}/employes`

**Body (JSON):**
```json
{
  "codeEmploye": "EMP001",
  "prenom": "Test",
  "nom": "Doublon",
  "poste": "Test",
  "typeContrat": "FIXE",
  "salaireBase": 400000,
  "dateEmbauche": "2025-01-01T00:00:00.000Z"
}
```

**Tests Postman:**
```javascript
pm.test("Code employé existant - Erreur", function () {
    pm.response.to.have.status(400);
});
```

---

## 💰 Tests des Cycles de Paie

### 1. Lister Cycles de Paie
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/cycles-paie`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 2. Créer Nouveau Cycle
**POST** `{{base_url}}/api/entreprises/{{entreprise_id}}/cycles-paie`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "titre": "Paie Postman Octobre 2025",
  "periode": "2025-10",
  "dateDebut": "2025-10-01T00:00:00.000Z",
  "dateFin": "2025-10-31T23:59:59.999Z"
}
```

### 3. Obtenir Cycle par ID
**GET** `{{base_url}}/api/cycles-paie/{{cycle_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 4. Générer Bulletins pour un Cycle
**POST** `{{base_url}}/api/cycles-paie/{{cycle_id}}/generer-bulletins`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 5. Approuver un Cycle
**POST** `{{base_url}}/api/cycles-paie/{{cycle_id}}/approuver`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📄 Tests des Bulletins de Paie

### 1. Lister Bulletins d'un Cycle
**GET** `{{base_url}}/api/cycles-paie/{{cycle_id}}/bulletins`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Tests Postman:**
```javascript
pm.test("Liste des bulletins", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('array');
    
    if (responseJson.length > 0) {
        pm.expect(responseJson[0]).to.have.property('numeroBulletin');
        pm.expect(responseJson[0]).to.have.property('employe');
        pm.expect(responseJson[0]).to.have.property('salaireBrut');
    }
});
```

### 2. Obtenir Bulletin par ID
**GET** `{{base_url}}/api/bulletins/{{bulletin_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 3. Modifier Bulletin
**PUT** `{{base_url}}/api/bulletins/{{bulletin_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "joursTravailes": 22,
  "deductions": 50000
}
```

### 4. Recalculer Bulletin
**POST** `{{base_url}}/api/bulletins/{{bulletin_id}}/recalculer`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 Tests du Dashboard

### 1. KPIs de l'Entreprise
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/dashboard/kpis`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Tests Postman:**
```javascript
pm.test("KPIs Dashboard", function () {
    pm.response.to.have.status(200);
    
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('nombreEmployes');
    pm.expect(responseJson).to.have.property('nombreEmployesActifs');
    pm.expect(responseJson).to.have.property('masseSalarialeMensuelle');
});
```

### 2. Évolution Masse Salariale
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/dashboard/evolution-masse-salariale`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 3. Prochains Paiements
**GET** `{{base_url}}/api/entreprises/{{entreprise_id}}/dashboard/prochains-paiements`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 💳 Tests des Paiements

### 1. Lister Paiements d'un Bulletin
**GET** `{{base_url}}/api/bulletins/{{bulletin_id}}/paiements`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 2. Créer Paiement
**POST** `{{base_url}}/api/bulletins/{{bulletin_id}}/paiements`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "montant": 600000,
  "methodePaiement": "VIREMENT_BANCAIRE",
  "reference": "VIR-2025-001",
  "notes": "Paiement salaire octobre"
}
```

### 3. Obtenir Paiement par ID
**GET** `{{base_url}}/api/paiements/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🔒 Tests de Sécurité

### 1. Accès Sans Token
**GET** `{{base_url}}/api/entreprises`

*(Sans header Authorization)*

**Tests Postman:**
```javascript
pm.test("Accès refusé sans token", function () {
    pm.response.to.have.status(401);
});
```

### 2. Token Invalide
**GET** `{{base_url}}/api/entreprises`

**Headers:**
```
Authorization: Bearer token_invalide
```

### 3. Accès à Entreprise Non Autorisée
*(Connecté avec admin@testsa.com qui a entrepriseId=1)*

**GET** `{{base_url}}/api/entreprises/4/employes`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📁 Collection Postman

### Import JSON pour Postman

```json
{
  "info": {
    "name": "API Backend Tests",
    "description": "Collection complète de tests pour l'API Backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Auto-login si pas de token",
          "if (!pm.environment.get('token')) {",
          "    pm.sendRequest({",
          "        url: pm.environment.get('base_url') + '/api/auth/connexion',",
          "        method: 'POST',",
          "        header: {",
          "            'Content-Type': 'application/json'",
          "        },",
          "        body: {",
          "            mode: 'raw',",
          "            raw: JSON.stringify({",
          "                email: 'superadmin@testsa.com',",
          "                motDePasse: 'password123'",
          "            })",
          "        }",
          "    }, function (err, response) {",
          "        if (response.json().token) {",
          "            pm.environment.set('token', response.json().token);",
          "        }",
          "    });",
          "}"
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 🚀 Guide d'Utilisation Rapide

### 1. Configuration Initiale
1. Importez la collection dans Postman
2. Créez un environnement avec les variables listées
3. Démarrez le serveur : `npm run dev`

### 2. Workflow de Test
1. **Authentification** : Testez d'abord la connexion
2. **Entreprises** : Créez/modifiez des entreprises
3. **Employés** : Ajoutez des employés aux entreprises
4. **Cycles** : Créez des cycles de paie
5. **Bulletins** : Générez et modifiez les bulletins
6. **Dashboard** : Vérifiez les statistiques
7. **Paiements** : Testez les paiements

### 3. Tests Automatisés
Chaque requête inclut des tests automatiques qui vérifient :
- Le code de statut HTTP
- La structure des réponses
- Les propriétés requises
- La sauvegarde des IDs pour les tests suivants

---

## ✅ Checklist de Tests

- [ ] Authentification (3 utilisateurs)
- [ ] CRUD Entreprises (5 endpoints)
- [ ] CRUD Employés (8 endpoints)
- [ ] Cycles de paie (5 endpoints)
- [ ] Bulletins de paie (4 endpoints)
- [ ] Dashboard (3 endpoints)
- [ ] Paiements (3 endpoints)
- [ ] Tests de sécurité (3 scenarios)

**Total : 31 tests à effectuer**

---

## 📞 Support

En cas de problème :
1. Vérifiez que le serveur est démarré
2. Vérifiez la base de données (seedée)
3. Vérifiez les variables d'environnement
4. Consultez les logs du serveur

**API Status :** 🟢 Opérationnelle  
**Dernière mise à jour :** 27 septembre 2025