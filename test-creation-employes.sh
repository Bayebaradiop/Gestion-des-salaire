#!/bin/bash

# Script pour tester la création d'employés avec différents types de contrats

BASE_URL="http://localhost:3000"

echo "🔐 Connexion en tant qu'admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "motDePasse": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de la connexion"
  exit 1
fi

echo "✅ Token obtenu"

# Test 1: Employé avec contrat FIXE
echo ""
echo "👤 Test 1: Création employé avec contrat FIXE..."
RESPONSE1=$(curl -s -X POST "$BASE_URL/api/entreprises/2/employes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@test.com",
    "telephone": "+221771234567",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 250000,
    "dateEmbauche": "2025-01-01",
    "compteBancaire": "SN08 12345678901234567890",
    "entrepriseId": 2,
    "estActif": true
  }')

if echo "$RESPONSE1" | grep -q '"id"'; then
  echo "✅ Employé FIXE créé avec succès"
else
  echo "❌ Erreur création employé FIXE:"
  echo "$RESPONSE1"
fi

# Test 2: Employé avec contrat JOURNALIER
echo ""
echo "👤 Test 2: Création employé avec contrat JOURNALIER..."
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/entreprises/2/employes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prenom": "Marie",
    "nom": "Martin",
    "email": "marie.martin@test.com",
    "telephone": "+221771234568",
    "poste": "Consultante",
    "typeContrat": "JOURNALIER",
    "tauxJournalier": 5000,
    "dateEmbauche": "2025-01-01",
    "compteBancaire": "SN08 09876543210987654321",
    "entrepriseId": 2,
    "estActif": true
  }')

if echo "$RESPONSE2" | grep -q '"id"'; then
  echo "✅ Employé JOURNALIER créé avec succès"
else
  echo "❌ Erreur création employé JOURNALIER:"
  echo "$RESPONSE2"
fi

# Test 3: Employé avec contrat HONORAIRE
echo ""
echo "👤 Test 3: Création employé avec contrat HONORAIRE..."
RESPONSE3=$(curl -s -X POST "$BASE_URL/api/entreprises/2/employes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prenom": "Ahmed",
    "nom": "Diallo",
    "email": "ahmed.diallo@test.com",
    "telephone": "+221771234569",
    "poste": "Expert Comptable",
    "typeContrat": "HONORAIRE",
    "tauxJournalier": 15000,
    "dateEmbauche": "2025-01-01",
    "compteBancaire": "SN08 11111111111111111111",
    "entrepriseId": 2,
    "estActif": true
  }')

if echo "$RESPONSE3" | grep -q '"id"'; then
  echo "✅ Employé HONORAIRE créé avec succès"
else
  echo "❌ Erreur création employé HONORAIRE:"
  echo "$RESPONSE3"
fi

echo ""
echo "📋 Tests terminés - Vous pouvez maintenant tester dans l'interface frontend"