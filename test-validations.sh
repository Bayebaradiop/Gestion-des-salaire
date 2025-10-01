#!/bin/bash

# ====================================
# SCRIPT DE TEST DU SYSTÈME DE VALIDATION
# Application Gestion des Salaires
# ====================================

echo "🧪 Tests du système de validation - Gestion des Salaires"
echo "========================================================"

# Configuration
API_URL="http://localhost:3000/api"
AUTH_TOKEN=""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    local test_name="$1"
    local expected_status="$2"
    local actual_status="$3"
    local response="$4"
    
    if [ "$actual_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        echo -e "   Attendu: $expected_status, Reçu: $actual_status"
        echo -e "   Réponse: $response"
    fi
}

# Fonction pour tester une requête
test_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local test_name="$5"
    
    echo -e "\n${BLUE}🧪 Test:${NC} $test_name"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extraire le code de statut (dernière ligne)
    status_code=$(echo "$response" | tail -n1)
    # Extraire le body (tout sauf la dernière ligne)
    response_body=$(echo "$response" | sed '$d')
    
    print_result "$test_name" "$expected_status" "$status_code" "$response_body"
    
    # Afficher les erreurs de validation si présentes
    if [ "$status_code" -eq 400 ]; then
        echo -e "${YELLOW}📋 Erreurs de validation:${NC}"
        echo "$response_body" | jq -r '.errors // empty | to_entries[] | "   - \(.key): \(.value)"' 2>/dev/null || echo "   $response_body"
    fi
}

echo -e "\n${YELLOW}🔐 Note: Ces tests nécessitent une authentification${NC}"
echo "Pour les tests complets, connectez-vous d'abord avec un super admin."

echo -e "\n${BLUE}===========================================${NC}"
echo -e "${BLUE}🏢 TESTS DE VALIDATION DES ENTREPRISES${NC}"
echo -e "${BLUE}===========================================${NC}"

# Test 1: Création d'entreprise - données valides
test_request "POST" "/entreprises" '{
    "nom": "Entreprise Test",
    "adresse": "123 Rue de la Validation",
    "telephone": "+221701234567",
    "email": "test@entreprise.com",
    "devise": "XOF",
    "periodePaie": "MENSUELLE"
}' 201 "Création entreprise - données valides"

# Test 2: Création d'entreprise - nom trop court
test_request "POST" "/entreprises" '{
    "nom": "A",
    "adresse": "123 Rue de la Validation",
    "telephone": "+221701234567",
    "email": "test@entreprise.com"
}' 400 "Création entreprise - nom trop court"

# Test 3: Création d'entreprise - email invalide
test_request "POST" "/entreprises" '{
    "nom": "Entreprise Test",
    "adresse": "123 Rue de la Validation",
    "telephone": "+221701234567",
    "email": "email-invalide"
}' 400 "Création entreprise - email invalide"

# Test 4: Création d'entreprise - téléphone invalide
test_request "POST" "/entreprises" '{
    "nom": "Entreprise Test",
    "adresse": "123 Rue de la Validation",
    "telephone": "123",
    "email": "test@entreprise.com"
}' 400 "Création entreprise - téléphone invalide"

# Test 5: Création d'entreprise - devise invalide
test_request "POST" "/entreprises" '{
    "nom": "Entreprise Test",
    "adresse": "123 Rue de la Validation",
    "telephone": "+221701234567",
    "email": "test@entreprise.com",
    "devise": "INVALID"
}' 400 "Création entreprise - devise invalide"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}👥 TESTS DE VALIDATION DES EMPLOYÉS${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 6: Création employé - données valides (FIXE)
test_request "POST" "/employes" '{
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@test.com",
    "telephone": "+221701234568",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 750000,
    "dateEmbauche": "2024-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 201 "Création employé FIXE - données valides"

# Test 7: Création employé - données valides (JOURNALIER)
test_request "POST" "/employes" '{
    "prenom": "Marie",
    "nom": "Martin",
    "email": "marie.martin@test.com",
    "telephone": "+221701234569",
    "poste": "Consultante",
    "typeContrat": "JOURNALIER",
    "tauxJournalier": 25000,
    "dateEmbauche": "2024-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 201 "Création employé JOURNALIER - données valides"

# Test 8: Création employé - prénom invalide
test_request "POST" "/employes" '{
    "prenom": "J3an",
    "nom": "Dupont",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 750000,
    "dateEmbauche": "2024-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 400 "Création employé - prénom avec chiffres"

# Test 9: Création employé - email invalide
test_request "POST" "/employes" '{
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "email-invalide",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 750000,
    "dateEmbauche": "2024-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 400 "Création employé - email invalide"

# Test 10: Création employé - salaire négatif
test_request "POST" "/employes" '{
    "prenom": "Jean",
    "nom": "Dupont",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": -1000,
    "dateEmbauche": "2024-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 400 "Création employé - salaire négatif"

# Test 11: Création employé - date future
test_request "POST" "/employes" '{
    "prenom": "Jean",
    "nom": "Dupont",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "salaireBase": 750000,
    "dateEmbauche": "2030-01-01T00:00:00.000Z",
    "entrepriseId": 1
}' 400 "Création employé - date embauche future"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}💰 TESTS DE VALIDATION DES PAIEMENTS${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 12: Création paiement - données valides
test_request "POST" "/paiements" '{
    "bulletinPaieId": 1,
    "montant": 750000,
    "methodePaiement": "VIREMENT_BANCAIRE",
    "reference": "PAY-2024-001",
    "traiteParId": 1
}' 201 "Création paiement - données valides"

# Test 13: Création paiement - montant négatif
test_request "POST" "/paiements" '{
    "bulletinPaieId": 1,
    "montant": -1000,
    "methodePaiement": "ESPECES",
    "traiteParId": 1
}' 400 "Création paiement - montant négatif"

# Test 14: Création paiement - méthode invalide
test_request "POST" "/paiements" '{
    "bulletinPaieId": 1,
    "montant": 750000,
    "methodePaiement": "BITCOIN",
    "traiteParId": 1
}' 400 "Création paiement - méthode invalide"

echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}🔐 TESTS DE VALIDATION AUTH${NC}"
echo -e "${BLUE}======================================${NC}"

# Test 15: Connexion - email invalide
test_request "POST" "/auth/connexion" '{
    "email": "email-invalide",
    "motDePasse": "password123"
}' 400 "Connexion - email invalide"

# Test 16: Connexion - mot de passe manquant
test_request "POST" "/auth/connexion" '{
    "email": "test@example.com"
}' 400 "Connexion - mot de passe manquant"

echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}📊 TESTS DE VALIDATION CYCLES DE PAIE${NC}"
echo -e "${BLUE}======================================${NC}"

# Test 17: Création cycle - données valides
test_request "POST" "/cycles-paie" '{
    "titre": "Paie Janvier 2024",
    "periode": "2024-01",
    "dateDebut": "2024-01-01T00:00:00.000Z",
    "dateFin": "2024-01-31T23:59:59.000Z",
    "joursOuvrables": 22,
    "entrepriseId": 1
}' 201 "Création cycle paie - données valides"

# Test 18: Création cycle - période invalide
test_request "POST" "/cycles-paie" '{
    "titre": "Paie Janvier 2024",
    "periode": "2024/01",
    "dateDebut": "2024-01-01T00:00:00.000Z",
    "dateFin": "2024-01-31T23:59:59.000Z",
    "joursOuvrables": 22,
    "entrepriseId": 1
}' 400 "Création cycle paie - format période invalide"

# Test 19: Création cycle - dates incohérentes
test_request "POST" "/cycles-paie" '{
    "titre": "Paie Janvier 2024",
    "periode": "2024-01",
    "dateDebut": "2024-01-31T00:00:00.000Z",
    "dateFin": "2024-01-01T23:59:59.000Z",
    "joursOuvrables": 22,
    "entrepriseId": 1
}' 400 "Création cycle paie - date fin avant début"

echo -e "\n${GREEN}✅ Tests terminés!${NC}"
echo -e "\n${YELLOW}📋 Résumé:${NC}"
echo "- Tests de validation des champs obligatoires"
echo "- Tests de format des données (email, téléphone, dates)"
echo "- Tests de cohérence logique (dates, montants)"
echo "- Tests des énumérations (devises, types, statuts)"
echo "- Tests de contraintes métier (salaires, périodes)"

echo -e "\n${BLUE}🔧 Pour des tests complets:${NC}"
echo "1. Démarrez le serveur backend: npm run dev"
echo "2. Créez un super admin: node scripts/createSuperAdmin.cjs"
echo "3. Obtenez un token d'authentification"
echo "4. Relancez ce script avec l'authentification"

echo -e "\n${YELLOW}💡 Note:${NC} Certains tests peuvent échouer si les données existent déjà"
echo "ou si l'authentification n'est pas configurée."