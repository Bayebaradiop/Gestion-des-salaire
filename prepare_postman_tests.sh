#!/bin/bash

echo "🚀 Préparation des tests Postman pour l'API Backend"
echo "=================================================="

# Vérification que le serveur est démarré
echo "🔍 Vérification de l'état du serveur..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Serveur opérationnel sur http://localhost:3000"
else
    echo "❌ Serveur non disponible. Démarrage..."
    npm run dev &
    echo "⏳ Attente du démarrage du serveur..."
    sleep 5
    
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ Serveur démarré avec succès"
    else
        echo "❌ Impossible de démarrer le serveur"
        exit 1
    fi
fi

# Test de connexion rapide
echo -e "\n🔐 Test de connexion..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@testsa.com","motDePasse":"password123"}' | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Authentification OK - Token obtenu"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo "❌ Problème d'authentification"
    exit 1
fi

# Vérification de la base de données
echo -e "\n🗄️  Vérification de la base de données..."
ENTREPRISES=$(curl -s -X GET http://localhost:3000/api/entreprises \
  -H "Authorization: Bearer $TOKEN" | jq '. | length' 2>/dev/null)

if [ "$ENTREPRISES" -gt 0 ]; then
    echo "✅ Base de données OK - $ENTREPRISES entreprises trouvées"
else
    echo "❌ Problème avec la base de données"
    exit 1
fi

echo -e "\n📁 Fichiers Postman disponibles:"
echo "   📋 README_TESTS_POSTMAN.md - Guide complet"
echo "   📦 API_Backend_Tests.postman_collection.json - Collection à importer"
echo "   🌍 API_Backend_Environment.postman_environment.json - Environnement à importer"

echo -e "\n🎯 Instructions pour Postman:"
echo "1. Importez la collection: API_Backend_Tests.postman_collection.json"
echo "2. Importez l'environnement: API_Backend_Environment.postman_environment.json"
echo "3. Sélectionnez l'environnement 'API Backend - Environment'"
echo "4. Lancez les tests depuis la collection importée"

echo -e "\n✨ Configuration automatique:"
echo "   • Auto-connexion activée (pas besoin de token manuel)"
echo "   • Variables d'environnement pré-configurées"
echo "   • Tests automatisés inclus"

echo -e "\n🚀 Prêt pour les tests Postman!"
echo "   API: http://localhost:3000"
echo "   Health: http://localhost:3000/health"
echo "   Collections: 31 endpoints à tester"

# Affichage des utilisateurs disponibles
echo -e "\n👥 Utilisateurs de test disponibles:"
echo "   🔑 Super Admin: superadmin@testsa.com / password123"
echo "   👤 Admin: admin@testsa.com / password123"
echo "   💳 Caissier: caissier@testsa.com / password123"