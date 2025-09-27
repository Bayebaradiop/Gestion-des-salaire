#!/bin/bash

# Script de test pour tous les endpoints de l'API
echo "🚀 Test de tous les endpoints de l'API"
echo "======================================="

# URL de base
BASE_URL="http://localhost:3000"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local auth="$5"
    
    echo -e "\n${BLUE}=== TEST: $name ===${NC}"
    echo "Method: $method"
    echo "URL: $url"
    
    if [ -n "$data" ]; then
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$url" \
                -H "Authorization: Bearer $auth")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$url")
        fi
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
    elif [[ $http_code -ge 400 && $http_code -lt 500 ]]; then
        echo -e "${YELLOW}⚠️  CLIENT ERROR (HTTP $http_code)${NC}"
    else
        echo -e "${RED}❌ ERROR (HTTP $http_code)${NC}"
    fi
    
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
}

# 1. AUTHENTIFICATION
echo -e "\n${YELLOW}🔐 TESTS D'AUTHENTIFICATION${NC}"

# Connexion
test_endpoint "Connexion Super Admin" "POST" "$BASE_URL/api/auth/connexion" \
    '{"email":"superadmin@testsa.com","motDePasse":"password123"}'

# Obtenir le token pour les autres tests
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/connexion" \
    -H "Content-Type: application/json" \
    -d '{"email":"superadmin@testsa.com","motDePasse":"password123"}' | jq -r '.token')

echo -e "\n${GREEN}Token obtenu pour les tests suivants${NC}"

# Profil
test_endpoint "Profil utilisateur" "GET" "$BASE_URL/api/auth/profil" "" "$TOKEN"

# Connexion avec mauvais credentials
test_endpoint "Connexion échec" "POST" "$BASE_URL/api/auth/connexion" \
    '{"email":"wrong@email.com","motDePasse":"wrongpass"}'

# 2. ENTREPRISES
echo -e "\n${YELLOW}🏢 TESTS ENTREPRISES${NC}"

# Lister toutes les entreprises
test_endpoint "Lister entreprises" "GET" "$BASE_URL/api/entreprises" "" "$TOKEN"

# Obtenir une entreprise par ID
test_endpoint "Obtenir entreprise par ID" "GET" "$BASE_URL/api/entreprises/1" "" "$TOKEN"

# Créer une nouvelle entreprise
test_endpoint "Créer entreprise" "POST" "$BASE_URL/api/entreprises" \
    '{"nom":"Nouvelle Entreprise Test","adresse":"123 Rue Test","email":"test@nouvelle.com","telephone":"+221123456789"}' "$TOKEN"

# Modifier une entreprise (on utilise l'ID 1)
test_endpoint "Modifier entreprise" "PUT" "$BASE_URL/api/entreprises/1" \
    '{"nom":"Entreprise Modifiée","telephone":"+221987654321"}' "$TOKEN"

# 3. EMPLOYÉS
echo -e "\n${YELLOW}👥 TESTS EMPLOYÉS${NC}"

# Lister les employés d'une entreprise
test_endpoint "Lister employés entreprise 1" "GET" "$BASE_URL/api/entreprises/1/employes" "" "$TOKEN"

# Créer un nouvel employé
test_endpoint "Créer employé" "POST" "$BASE_URL/api/entreprises/1/employes" \
    '{"codeEmploye":"TEST001","prenom":"Test","nom":"Employé","email":"test.employe@test.com","telephone":"+221 77 123 45 67","poste":"Testeur","typeContrat":"FIXE","salaireBase":400000,"dateEmbauche":"2025-01-01T00:00:00.000Z"}' "$TOKEN"

# Obtenir un employé par ID
test_endpoint "Obtenir employé par ID" "GET" "$BASE_URL/api/employes/1" "" "$TOKEN"

# Modifier un employé
test_endpoint "Modifier employé" "PUT" "$BASE_URL/api/employes/1" \
    '{"prenom":"Jean Modifié","salaireBase":800000}' "$TOKEN"

# Statistiques des employés
test_endpoint "Statistiques employés" "GET" "$BASE_URL/api/entreprises/1/employes/statistiques" "" "$TOKEN"

# 4. CYCLES DE PAIE
echo -e "\n${YELLOW}💰 TESTS CYCLES DE PAIE${NC}"

# Lister les cycles de paie
test_endpoint "Lister cycles de paie" "GET" "$BASE_URL/api/entreprises/1/cycles-paie" "" "$TOKEN"

# Créer un nouveau cycle de paie
test_endpoint "Créer cycle de paie" "POST" "$BASE_URL/api/entreprises/1/cycles-paie" \
    '{"titre":"Paie Test Septembre 2025","periode":"2025-09","dateDebut":"2025-09-01T00:00:00.000Z","dateFin":"2025-09-30T23:59:59.999Z"}' "$TOKEN"

# 5. BULLETINS DE PAIE
echo -e "\n${YELLOW}📄 TESTS BULLETINS DE PAIE${NC}"

# Lister les bulletins de paie
test_endpoint "Lister bulletins de paie" "GET" "$BASE_URL/api/bulletins-paie" "" "$TOKEN"

# 6. PAIEMENTS
echo -e "\n${YELLOW}💳 TESTS PAIEMENTS${NC}"

# Lister les paiements
test_endpoint "Lister paiements" "GET" "$BASE_URL/api/paiements" "" "$TOKEN"

# 7. DASHBOARD
echo -e "\n${YELLOW}📊 TESTS DASHBOARD${NC}"

# Statistiques du dashboard
test_endpoint "Dashboard statistiques" "GET" "$BASE_URL/api/dashboard/statistiques" "" "$TOKEN"

# 8. TESTS D'ERREURS
echo -e "\n${YELLOW}❌ TESTS D'ERREURS${NC}"

# Accès sans token
test_endpoint "Accès sans token" "GET" "$BASE_URL/api/entreprises"

# Ressource inexistante
test_endpoint "Entreprise inexistante" "GET" "$BASE_URL/api/entreprises/999" "" "$TOKEN"

# Employé inexistant
test_endpoint "Employé inexistant" "GET" "$BASE_URL/api/employes/999" "" "$TOKEN"

echo -e "\n${GREEN}🎉 Tests terminés !${NC}"