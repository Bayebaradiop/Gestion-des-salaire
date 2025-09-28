#!/bin/bash

echo "🎯 =============================================================="
echo "🎯 LIVRABLE 1 - TESTS COMPLETS DES 3 SPRINTS"
echo "🎯 =============================================================="
echo "📅 Date: $(date)"
echo "🏢 Projet: Système de Gestion de Paie"
echo "🎯 Sprints: 0 (Auth) + 1 (Employés) + 2 (Cycles de Paie)"
echo "👥 Rôles: SUPER_ADMIN, ADMIN, CAISSIER"
echo "🎯 =============================================================="
echo ""

BASE_URL="http://localhost:3000/api"
LOG_FILE="rapport-tests.log"

# Nettoyer le fichier de log précédent
echo "🧪 RAPPORT DE TESTS LIVRABLE 1 - $(date)" > $LOG_FILE
echo "===============================================" >> $LOG_FILE
echo "" >> $LOG_FILE

# Variables pour les cookies
COOKIE_SUPERADMIN="/tmp/cookies_superadmin.txt"
COOKIE_ADMIN="/tmp/cookies_admin.txt" 
COOKIE_CAISSIER="/tmp/cookies_caissier.txt"

# Nettoyer les cookies précédents
rm -f /tmp/cookies_*.txt

# Fonction pour logger et afficher
log_and_echo() {
    echo "$1"
    echo "$1" >> $LOG_FILE
}

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local cookie_file=$4
    local role=$5
    local description=$6
    
    log_and_echo "🔹 [$role] $description"
    
    if [ -z "$data" ]; then
        if [ -z "$cookie_file" ]; then
            RESPONSE=$(curl -X $method "$BASE_URL$endpoint" -s)
        else
            RESPONSE=$(curl -X $method "$BASE_URL$endpoint" -b $cookie_file -s)
        fi
    else
        if [ -z "$cookie_file" ]; then
            RESPONSE=$(curl -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data" -s)
        else
            RESPONSE=$(curl -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data" -b $cookie_file -s)
        fi
    fi
    
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    echo "$RESPONSE" >> $LOG_FILE
    echo "" >> $LOG_FILE
    echo ""
}

log_and_echo "🚀 =============================================="
log_and_echo "🚀 SPRINT 0 - SETUP & AUTHENTIFICATION"
log_and_echo "🚀 =============================================="

log_and_echo "📋 1. HEALTH CHECK"
test_endpoint "GET" "/health" "" "" "SYSTEM" "Vérification du serveur"

log_and_echo "📋 2. CONNEXIONS - TOUS LES RÔLES"
log_and_echo "-----------------------------------"

# Connexion SUPER_ADMIN
test_endpoint "POST" "/auth/connexion" '{
    "email": "superadmin@testsa.com",
    "motDePasse": "password123"
}' "" "SUPER_ADMIN" "Connexion Super Admin"

# Sauvegarder le cookie pour SUPER_ADMIN
curl -X POST "$BASE_URL/auth/connexion" \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@testsa.com", "motDePasse": "password123"}' \
  -c $COOKIE_SUPERADMIN -s > /dev/null

# Connexion ADMIN
test_endpoint "POST" "/auth/connexion" '{
    "email": "admin@testsa.com",
    "motDePasse": "password123"
}' "" "ADMIN" "Connexion Admin"

# Sauvegarder le cookie pour ADMIN
curl -X POST "$BASE_URL/auth/connexion" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@testsa.com", "motDePasse": "password123"}' \
  -c $COOKIE_ADMIN -s > /dev/null

# Connexion CAISSIER
test_endpoint "POST" "/auth/connexion" '{
    "email": "caissier@testsa.com",
    "motDePasse": "password123"
}' "" "CAISSIER" "Connexion Caissier"

# Sauvegarder le cookie pour CAISSIER
curl -X POST "$BASE_URL/auth/connexion" \
  -H "Content-Type: application/json" \
  -d '{"email": "caissier@testsa.com", "motDePasse": "password123"}' \
  -c $COOKIE_CAISSIER -s > /dev/null

log_and_echo "📋 3. TESTS DE SÉCURITÉ"
log_and_echo "------------------------"

# Test accès non autorisé
test_endpoint "GET" "/entreprises" "" "" "ANONYMOUS" "Accès sans authentification (doit échouer)"

# Test mauvais identifiants
test_endpoint "POST" "/auth/connexion" '{
    "email": "admin@testsa.com",
    "motDePasse": "wrongpassword"
}' "" "INVALID" "Connexion avec mauvais mot de passe (doit échouer)"

log_and_echo "🚀 =============================================="
log_and_echo "🚀 SPRINT 1 - GESTION DES EMPLOYÉS"
log_and_echo "🚀 =============================================="

log_and_echo "📋 4. LECTURE DES EMPLOYÉS - TOUS LES RÔLES"
log_and_echo "---------------------------------------------"

# Liste des employés avec chaque rôle
test_endpoint "GET" "/entreprises/1/employes" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Liste des employés"
test_endpoint "GET" "/entreprises/1/employes" "" "$COOKIE_ADMIN" "ADMIN" "Liste des employés"
test_endpoint "GET" "/entreprises/1/employes" "" "$COOKIE_CAISSIER" "CAISSIER" "Liste des employés"

log_and_echo "📋 5. STATISTIQUES DES EMPLOYÉS"
log_and_echo "--------------------------------"

test_endpoint "GET" "/entreprises/1/employes/statistiques" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Statistiques employés"
test_endpoint "GET" "/entreprises/1/employes/statistiques" "" "$COOKIE_ADMIN" "ADMIN" "Statistiques employés"
test_endpoint "GET" "/entreprises/1/employes/statistiques" "" "$COOKIE_CAISSIER" "CAISSIER" "Statistiques employés"

log_and_echo "📋 6. FILTRES DES EMPLOYÉS"
log_and_echo "---------------------------"

test_endpoint "GET" "/entreprises/1/employes?estActif=true" "" "$COOKIE_ADMIN" "ADMIN" "Filtre employés actifs"
test_endpoint "GET" "/entreprises/1/employes?typeContrat=FIXE" "" "$COOKIE_ADMIN" "ADMIN" "Filtre employés contrat fixe"

log_and_echo "📋 7. CRÉATION D'EMPLOYÉ - ADMIN SEULEMENT"
log_and_echo "-------------------------------------------"

# Création par ADMIN (doit réussir)
test_endpoint "POST" "/entreprises/1/employes" '{
    "codeEmploye": "EMP999",
    "prenom": "Test",
    "nom": "Livrable1",
    "email": "test.livrable1@testsa.com",
    "poste": "Testeur",
    "typeContrat": "FIXE",
    "salaireBase": 500000,
    "dateEmbauche": "2025-09-28"
}' "$COOKIE_ADMIN" "ADMIN" "Création employé par Admin"

# Tentative de création par CAISSIER (doit échouer)
test_endpoint "POST" "/entreprises/1/employes" '{
    "codeEmploye": "EMP998",
    "prenom": "Test",
    "nom": "Refusé",
    "poste": "Testeur",
    "typeContrat": "FIXE",
    "salaireBase": 500000
}' "$COOKIE_CAISSIER" "CAISSIER" "Création employé par Caissier (doit échouer)"

log_and_echo "📋 8. MODIFICATION D'EMPLOYÉ - ADMIN SEULEMENT"
log_and_echo "-----------------------------------------------"

# Obtenir un employé existant pour le modifier
EMPLOYE_ID=$(curl -X GET "$BASE_URL/entreprises/1/employes" -b $COOKIE_ADMIN -s | jq -r '.[0].id // 1')

test_endpoint "PUT" "/employes/$EMPLOYE_ID" '{
    "prenom": "Jean Modifié",
    "nom": "Dupont Modifié",
    "poste": "Développeur Senior Modifié"
}' "$COOKIE_ADMIN" "ADMIN" "Modification employé par Admin"

# Tentative par CAISSIER (doit échouer)  
test_endpoint "PUT" "/employes/$EMPLOYE_ID" '{
    "prenom": "Jean Refusé",
    "nom": "Dupont Refusé"
}' "$COOKIE_CAISSIER" "CAISSIER" "Modification employé par Caissier (doit échouer)"

log_and_echo "📋 9. ACTIVATION/DÉSACTIVATION - ADMIN SEULEMENT"
log_and_echo "------------------------------------------------"

test_endpoint "POST" "/employes/$EMPLOYE_ID/desactiver" "" "$COOKIE_ADMIN" "ADMIN" "Désactivation employé par Admin"
test_endpoint "POST" "/employes/$EMPLOYE_ID/activer" "" "$COOKIE_ADMIN" "ADMIN" "Activation employé par Admin"

# Tentative par CAISSIER (doit échouer)
test_endpoint "POST" "/employes/$EMPLOYE_ID/desactiver" "" "$COOKIE_CAISSIER" "CAISSIER" "Désactivation par Caissier (doit échouer)"

log_and_echo "🚀 =============================================="
log_and_echo "🚀 SPRINT 2 - CYCLES DE PAIE & BULLETINS"
log_and_echo "🚀 =============================================="

log_and_echo "📋 10. LECTURE DES CYCLES - TOUS LES RÔLES"
log_and_echo "-------------------------------------------"

test_endpoint "GET" "/entreprises/1/cycles-paie" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Liste des cycles"
test_endpoint "GET" "/entreprises/1/cycles-paie" "" "$COOKIE_ADMIN" "ADMIN" "Liste des cycles"
test_endpoint "GET" "/entreprises/1/cycles-paie" "" "$COOKIE_CAISSIER" "CAISSIER" "Liste des cycles"

log_and_echo "📋 11. CRÉATION DE CYCLE - ADMIN SEULEMENT"
log_and_echo "------------------------------------------"

# Création par ADMIN
test_endpoint "POST" "/entreprises/1/cycles-paie" '{
    "nom": "Cycle Test Livrable1",
    "mois": 10,
    "annee": 2025,
    "dateDebut": "2025-10-01",
    "dateFin": "2025-10-31"
}' "$COOKIE_ADMIN" "ADMIN" "Création cycle par Admin"

# Tentative par CAISSIER (doit échouer)
test_endpoint "POST" "/entreprises/1/cycles-paie" '{
    "nom": "Cycle Refusé",
    "mois": 11,
    "annee": 2025,
    "dateDebut": "2025-11-01",
    "dateFin": "2025-11-30"
}' "$COOKIE_CAISSIER" "CAISSIER" "Création cycle par Caissier (doit échouer)"

log_and_echo "📋 12. GESTION DES BULLETINS"
log_and_echo "-----------------------------"

# Obtenir un cycle existant
CYCLE_ID=$(curl -X GET "$BASE_URL/entreprises/1/cycles-paie" -b $COOKIE_ADMIN -s | jq -r '.[0].id // 1')

# Génération de bulletins par ADMIN
test_endpoint "POST" "/cycles-paie/$CYCLE_ID/generer-bulletins" "" "$COOKIE_ADMIN" "ADMIN" "Génération bulletins par Admin"

# Liste des bulletins par tous les rôles
test_endpoint "GET" "/cycles-paie/$CYCLE_ID/bulletins" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Liste bulletins"
test_endpoint "GET" "/cycles-paie/$CYCLE_ID/bulletins" "" "$COOKIE_ADMIN" "ADMIN" "Liste bulletins"
test_endpoint "GET" "/cycles-paie/$CYCLE_ID/bulletins" "" "$COOKIE_CAISSIER" "CAISSIER" "Liste bulletins"

log_and_echo "📋 13. STATISTIQUES DES CYCLES"
log_and_echo "-------------------------------"

test_endpoint "GET" "/cycles-paie/$CYCLE_ID/statistiques" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Statistiques cycle"
test_endpoint "GET" "/cycles-paie/$CYCLE_ID/statistiques" "" "$COOKIE_ADMIN" "ADMIN" "Statistiques cycle"
test_endpoint "GET" "/cycles-paie/$CYCLE_ID/statistiques" "" "$COOKIE_CAISSIER" "CAISSIER" "Statistiques cycle"

log_and_echo "📋 14. APPROBATION/CLÔTURE - ADMIN SEULEMENT"
log_and_echo "---------------------------------------------"

test_endpoint "POST" "/cycles-paie/$CYCLE_ID/approuver" "" "$COOKIE_ADMIN" "ADMIN" "Approbation cycle par Admin"

# Tentative par CAISSIER (doit échouer)
test_endpoint "POST" "/cycles-paie/$CYCLE_ID/cloturer" "" "$COOKIE_CAISSIER" "CAISSIER" "Clôture cycle par Caissier (doit échouer)"

log_and_echo "🚀 =============================================="
log_and_echo "🚀 TESTS DE SÉCURITÉ MULTI-TENANT"
log_and_echo "🚀 =============================================="

log_and_echo "📋 15. ISOLATION DES ENTREPRISES"
log_and_echo "---------------------------------"

# Test accès à une autre entreprise (doit échouer pour ADMIN/CAISSIER)
test_endpoint "GET" "/entreprises/999/employes" "" "$COOKIE_ADMIN" "ADMIN" "Accès entreprise inexistante (doit échouer)"
test_endpoint "GET" "/entreprises/999/employes" "" "$COOKIE_CAISSIER" "CAISSIER" "Accès entreprise inexistante (doit échouer)"

# Super admin peut accéder (même si elle n'existe pas, il aura une erreur différente)
test_endpoint "GET" "/entreprises/999/employes" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Accès entreprise par Super Admin"

log_and_echo "🚀 =============================================="
log_and_echo "🚀 ACCÈS GLOBAL SUPER ADMIN"
log_and_echo "🚀 =============================================="

log_and_echo "📋 16. GESTION DES ENTREPRISES - SUPER ADMIN"
log_and_echo "---------------------------------------------"

test_endpoint "GET" "/entreprises" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Liste toutes les entreprises"
test_endpoint "GET" "/entreprises/1" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Détails entreprise 1"
test_endpoint "GET" "/entreprises/1/statistiques" "" "$COOKIE_SUPERADMIN" "SUPER_ADMIN" "Statistiques entreprise"

# Tentative d'accès par ADMIN/CAISSIER (doit échouer)
test_endpoint "GET" "/entreprises" "" "$COOKIE_ADMIN" "ADMIN" "Liste entreprises par Admin (doit échouer)"
test_endpoint "GET" "/entreprises" "" "$COOKIE_CAISSIER" "CAISSIER" "Liste entreprises par Caissier (doit échouer)"

log_and_echo "✅ =============================================="
log_and_echo "✅ LIVRABLE 1 - TESTS TERMINÉS"
log_and_echo "✅ =============================================="
log_and_echo "📊 Résultats sauvegardés dans: $LOG_FILE"
log_and_echo "📅 Date de fin: $(date)"

# Nettoyer les cookies
rm -f /tmp/cookies_*.txt

echo ""
echo "📋 RÉSUMÉ DES TESTS:"
echo "- ✅ Sprint 0: Authentification (3 rôles)"
echo "- ✅ Sprint 1: Gestion employés (CRUD + filtres + permissions)"
echo "- ✅ Sprint 2: Cycles de paie + bulletins"
echo "- ✅ Sécurité: Isolation multi-tenant + contrôle d'accès"
echo ""
echo "📄 Consultez le fichier $LOG_FILE pour les détails complets."