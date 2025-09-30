#!/bin/bash

# Script de test pour créer une entreprise avec logo base64
BASE_URL="http://localhost:3000"

echo "🔐 1. Connexion en tant que Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@admin.com",
    "motDePasse": "SuperAdmin123!"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extraire le token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de la connexion"
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."

echo ""
echo "🏢 2. Création d'entreprise avec logo base64..."

# Image base64 minimaliste (pixel rouge 1x1)
LOGO_BASE64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAwAAuAAsL+VgIAAAAAElFTkSuQmCC"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/entreprises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"Test Entreprise Logo $(date +%s)\",
    \"logo\": \"$LOGO_BASE64\",
    \"adresse\": \"123 Avenue Test, Ville Test, 12345\",
    \"telephone\": \"+221771234567\",
    \"email\": \"test$(date +%s)@entreprise.com\",
    \"devise\": \"XOF\",
    \"periodePaie\": \"MENSUELLE\"
  }")

echo "Response: $CREATE_RESPONSE"

# Extraire l'ID de l'entreprise créée
ENTREPRISE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$ENTREPRISE_ID" ]; then
  echo "❌ Échec de la création de l'entreprise"
  exit 1
fi

echo "✅ Entreprise créée avec ID: $ENTREPRISE_ID"

echo ""
echo "🔍 3. Vérification de l'entreprise créée..."

GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/entreprises/$ENTREPRISE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_RESPONSE"

# Vérifier si le logo est présent
if echo "$GET_RESPONSE" | grep -q "data:image"; then
  echo "✅ Logo trouvé dans l'entreprise !"
else
  echo "❌ Logo manquant dans l'entreprise"
fi

echo ""
echo "📋 4. Test terminé"