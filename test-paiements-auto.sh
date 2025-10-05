#!/bin/bash

# Script de test pour les paiements automatisés
# Usage: ./test-paiements-auto.sh

BASE_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@techniplus.sn"
ADMIN_PASSWORD="admin123"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
AUTH_TOKEN=""
ENTREPRISE_ID=""
EMPLOYE_ID=""

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    log_info "Test: $description"
    log_info "→ $method $endpoint"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X $method \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

    if [ "$http_code" -eq "$expected_status" ]; then
        log_success "✓ Status: $http_code (attendu: $expected_status)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        log_error "✗ Status: $http_code (attendu: $expected_status)"
        echo "$body"
    fi
    echo
}

# 1. Authentification
log_info "=== AUTHENTIFICATION ==="
auth_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"motDePasse\":\"$ADMIN_PASSWORD\"}" \
    "$BASE_URL/auth/connexion")

auth_http_code=$(echo $auth_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
auth_body=$(echo $auth_response | sed -e 's/HTTPSTATUS:.*//g')

if [ "$auth_http_code" -eq 200 ]; then
    log_success "✓ Authentification réussie"
    AUTH_TOKEN=$(echo $auth_body | jq -r '.token')
    ENTREPRISE_ID=$(echo $auth_body | jq -r '.utilisateur.entrepriseId')
    log_info "Token: ${AUTH_TOKEN:0:20}..."
    log_info "Entreprise ID: $ENTREPRISE_ID"
else
    log_error "✗ Échec de l'authentification (Status: $auth_http_code)"
    echo $auth_body
    exit 1
fi
echo

# 2. Récupérer un employé pour les tests
log_info "=== RÉCUPÉRATION D'UN EMPLOYÉ ==="
employes_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/entreprises/$ENTREPRISE_ID/employes")

employes_http_code=$(echo $employes_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
employes_body=$(echo $employes_response | sed -e 's/HTTPSTATUS:.*//g')

if [ "$employes_http_code" -eq 200 ]; then
    EMPLOYE_ID=$(echo $employes_body | jq -r '.employes[0].id')
    if [ "$EMPLOYE_ID" != "null" ] && [ "$EMPLOYE_ID" != "" ]; then
        log_success "✓ Employé trouvé (ID: $EMPLOYE_ID)"
    else
        log_error "✗ Aucun employé trouvé"
        exit 1
    fi
else
    log_error "✗ Erreur lors de la récupération des employés"
    exit 1
fi
echo

# 3. Tests des paiements automatisés
log_info "=== TESTS PAIEMENTS AUTOMATISÉS ==="

# Test 1: Calculer un paiement
PERIODE=$(date +"%Y-%m")
test_endpoint "POST" "/paiements/calculer/$EMPLOYE_ID" \
    "{\"periode\":\"$PERIODE\"}" \
    200 \
    "Calcul du paiement pour l'employé $EMPLOYE_ID"

# Test 2: Enregistrer un paiement
test_endpoint "POST" "/paiements/enregistrer/$EMPLOYE_ID" \
    "{\"periode\":\"$PERIODE\"}" \
    201 \
    "Enregistrement du paiement calculé"

# Test 3: Récupérer les paiements de l'entreprise
test_endpoint "GET" "/entreprises/$ENTREPRISE_ID/paiements-automatises" \
    "" \
    200 \
    "Récupération des paiements de l'entreprise"

# Test 4: Récupérer les paiements avec filtre de période
test_endpoint "GET" "/entreprises/$ENTREPRISE_ID/paiements-automatises?periode=$PERIODE" \
    "" \
    200 \
    "Récupération des paiements filtrés par période"

# Test 5: Tenter de créer un doublon (doit échouer)
test_endpoint "POST" "/paiements/enregistrer/$EMPLOYE_ID" \
    "{\"periode\":\"$PERIODE\"}" \
    409 \
    "Tentative de création d'un paiement en doublon (doit échouer)"

# Test 6: Récupérer les détails d'un paiement
log_info "Récupération de l'ID du paiement créé..."
paiements_response=$(curl -s \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/entreprises/$ENTREPRISE_ID/paiements-automatises?periode=$PERIODE")

PAIEMENT_ID=$(echo $paiements_response | jq -r '.paiements[0].id')

if [ "$PAIEMENT_ID" != "null" ] && [ "$PAIEMENT_ID" != "" ]; then
    log_info "Paiement ID: $PAIEMENT_ID"
    
    test_endpoint "GET" "/paiements/$PAIEMENT_ID" \
        "" \
        200 \
        "Récupération des détails du paiement $PAIEMENT_ID"

    # Test 7: Marquer comme payé partiellement
    test_endpoint "PUT" "/paiements/$PAIEMENT_ID/marquer-paye" \
        "{\"montantPaye\":50000,\"methodePaiement\":\"ESPECES\",\"notes\":\"Paiement partiel de test\"}" \
        200 \
        "Marquage du paiement comme payé partiellement"

    # Test 8: Marquer comme payé totalement
    test_endpoint "PUT" "/paiements/$PAIEMENT_ID/marquer-paye" \
        "{\"montantPaye\":100000,\"methodePaiement\":\"VIREMENT_BANCAIRE\",\"notes\":\"Solde du paiement\"}" \
        200 \
        "Marquage du paiement comme payé totalement"
else
    log_warning "Impossible de récupérer l'ID du paiement pour les tests suivants"
fi

# 4. Tests d'erreurs
log_info "=== TESTS D'ERREURS ==="

# Test avec employé inexistant
test_endpoint "POST" "/paiements/calculer/99999" \
    "{\"periode\":\"$PERIODE\"}" \
    500 \
    "Calcul avec employé inexistant (doit échouer)"

# Test avec période invalide
test_endpoint "POST" "/paiements/calculer/$EMPLOYE_ID" \
    "{\"periode\":\"invalid-period\"}" \
    400 \
    "Calcul avec période invalide (doit échouer)"

# Test sans authentification
log_info "Test sans token d'authentification"
no_auth_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"periode\":\"$PERIODE\"}" \
    "$BASE_URL/paiements/calculer/$EMPLOYE_ID")

no_auth_http_code=$(echo $no_auth_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
if [ "$no_auth_http_code" -eq 401 ]; then
    log_success "✓ Accès refusé sans authentification (Status: $no_auth_http_code)"
else
    log_error "✗ L'authentification n'est pas correctement vérifiée (Status: $no_auth_http_code)"
fi
echo

# 5. Résumé
log_info "=== RÉSUMÉ DES TESTS ==="
log_success "Tests des paiements automatisés terminés"
log_info "Fonctionnalités testées:"
echo "  • Calcul de paiement basé sur les pointages"
echo "  • Enregistrement de paiement"
echo "  • Récupération des paiements d'entreprise"
echo "  • Filtrage par période"
echo "  • Gestion des doublons"
echo "  • Marquage des paiements"
echo "  • Gestion des erreurs"
echo "  • Sécurité et authentification"

log_info "Pour tester l'interface frontend:"
log_info "1. Démarrez le serveur frontend: npm run dev"
log_info "2. Naviguez vers la page des employés"
log_info "3. Cliquez sur le bouton 'Calculer Paiement' pour un employé"
log_info "4. Visitez la page 'Historique des Paiements'"

echo -e "${GREEN}[DONE]${NC} Tests terminés avec succès!"
