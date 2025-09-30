#!/bin/bash

# Script pour créer plusieurs entreprises avec différents types de logos pour tester l'affichage

BASE_URL="http://localhost:3000"

echo "🔐 Connexion en tant que Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@admin.com",
    "motDePasse": "SuperAdmin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de la connexion"
  exit 1
fi

echo "✅ Token obtenu"

# Logo base64 différents pour les tests
LOGO_BLUE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwABAgF/aihBPgAAAABJRU5ErkJggg=="
LOGO_RED="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8zwAAAgIBAPi9T/MAAAAASUVORK5CYII="
LOGO_GREEN="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAAABAQC7T2rEAAAAAElFTkSuQmCC"

echo ""
echo "🏢 Création d'entreprises de test avec différents logos..."

# Entreprise 1 - Logo bleu
echo "Création Entreprise Bleue..."
curl -s -X POST "$BASE_URL/api/entreprises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"Entreprise Bleue $(date +%s)\",
    \"logo\": \"$LOGO_BLUE\",
    \"adresse\": \"123 Avenue Bleue, Ville Test\",
    \"telephone\": \"+221771234567\",
    \"email\": \"bleu$(date +%s)@test.com\",
    \"devise\": \"XOF\",
    \"periodePaie\": \"MENSUELLE\"
  }" > /dev/null

# Entreprise 2 - Logo rouge  
echo "Création Entreprise Rouge..."
curl -s -X POST "$BASE_URL/api/entreprises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"Entreprise Rouge $(date +%s)\",
    \"logo\": \"$LOGO_RED\",
    \"adresse\": \"456 Avenue Rouge, Ville Test\",
    \"telephone\": \"+221771234568\",
    \"email\": \"rouge$(date +%s)@test.com\",
    \"devise\": \"EUR\",
    \"periodePaie\": \"MENSUELLE\"
  }" > /dev/null

# Entreprise 3 - Logo vert
echo "Création Entreprise Verte..."
curl -s -X POST "$BASE_URL/api/entreprises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"Entreprise Verte $(date +%s)\",
    \"logo\": \"$LOGO_GREEN\",
    \"adresse\": \"789 Avenue Verte, Ville Test\",
    \"telephone\": \"+221771234569\",
    \"email\": \"vert$(date +%s)@test.com\",
    \"devise\": \"USD\",
    \"periodePaie\": \"HEBDOMADAIRE\"
  }" > /dev/null

# Entreprise 4 - Sans logo pour tester le fallback
echo "Création Entreprise Sans Logo..."
curl -s -X POST "$BASE_URL/api/entreprises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"Entreprise Sans Logo $(date +%s)\",
    \"adresse\": \"321 Avenue Test, Ville Test\",
    \"telephone\": \"+221771234570\",
    \"email\": \"sanslogo$(date +%s)@test.com\",
    \"devise\": \"XOF\",
    \"periodePaie\": \"MENSUELLE\"
  }" > /dev/null

echo "✅ Entreprises de test créées !"
echo ""
echo "🌐 Vous pouvez maintenant aller sur http://localhost:3002 pour voir l'affichage des logos"
echo "📋 Les entreprises apparaîtront dans :"
echo "   - Page des entreprises"
echo "   - Dashboard Super Admin"
echo "   - Page de détails d'entreprise"