#!/bin/bash

echo "=== Test du système de couleurs d'entreprise ==="

# 1. Se connecter comme super admin
echo "1. Connexion super admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.com",
    "motDePasse": "password123"
  }' \
  -c cookies.txt)

echo "Réponse connexion: $LOGIN_RESPONSE"

# 2. Créer une entreprise avec couleur personnalisée
echo -e "\n2. Création d'une entreprise avec couleur rose..."
ENTREPRISE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/entreprises \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nom": "TechCorp Pink",
    "couleur": "#E91E63",
    "adresse": "123 Avenue Technology, Dakar",
    "telephone": "+221771234567",
    "email": "contact@techcorp-pink.sn",
    "devise": "XOF",
    "periodePaie": "MENSUELLE"
  }')

echo "Réponse création entreprise: $ENTREPRISE_RESPONSE"

# 3. Créer une autre entreprise avec couleur verte
echo -e "\n3. Création d'une entreprise avec couleur verte..."
ENTREPRISE2_RESPONSE=$(curl -s -X POST http://localhost:3000/api/entreprises \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nom": "EcoTech Green",
    "couleur": "#10B981",
    "adresse": "456 Boulevard Écologie, Dakar",
    "telephone": "+221772345678",
    "email": "contact@ecotech-green.sn",
    "devise": "XOF",
    "periodePaie": "MENSUELLE"
  }')

echo "Réponse création entreprise 2: $ENTREPRISE2_RESPONSE"

# 4. Lister toutes les entreprises
echo -e "\n4. Liste des entreprises..."
ENTREPRISES_LIST=$(curl -s -X GET http://localhost:3000/api/admin/entreprises \
  -b cookies.txt)

echo "Liste entreprises: $ENTREPRISES_LIST"

# 5. Créer un admin pour la première entreprise
echo -e "\n5. Création d'un admin pour TechCorp Pink..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/utilisateurs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email": "admin.techcorp@test.com",
    "motDePasse": "password123",
    "prenom": "Admin",
    "nom": "TechCorp",
    "role": "ADMIN",
    "entrepriseId": 1
  }')

echo "Réponse création admin: $ADMIN_RESPONSE"

# 6. Se connecter comme admin de l'entreprise
echo -e "\n6. Connexion admin TechCorp..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.techcorp@test.com",
    "motDePasse": "password123"
  }' \
  -c admin_cookies.txt)

echo "Réponse connexion admin: $ADMIN_LOGIN_RESPONSE"

# 7. Obtenir le profil admin avec infos entreprise
echo -e "\n7. Profil admin avec couleur d'entreprise..."
PROFIL_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/profil \
  -b admin_cookies.txt)

echo "Profil admin: $PROFIL_RESPONSE"

echo -e "\n=== Test terminé ==="