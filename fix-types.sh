#!/bin/bash

# Script pour convertir automatiquement tous les types ID de string vers number

echo "🔄 Conversion des types ID de string vers number..."

# Définir les patterns de remplacement
declare -A replacements=(
  # Paramètres des méthodes
  ["async trouverParId(id: string)"]="async trouverParId(id: number)"
  ["async modifier(id: string,"]="async modifier(id: number,"
  ["async supprimer(id: string)"]="async supprimer(id: number)"
  ["async mettreAJourMontantPaye(id: string)"]="async mettreAJourMontantPaye(id: number)"
  ["async mettreAJourDerniereConnexion(id: string)"]="async mettreAJourDerniereConnexion(id: number)"
  ["async activer(id: string)"]="async activer(id: number)"
  ["async desactiver(id: string)"]="async desactiver(id: number)"
  ["async listerParEntreprise(entrepriseId: string)"]="async listerParEntreprise(entrepriseId: number)"
  ["async listerParCycle(cyclePaieId: string)"]="async listerParCycle(cyclePaieId: number)"
  ["async obtenirStatistiques(id: string)"]="async obtenirStatistiques(id: number)"
  ["async mettreAJourTotaux(id: string)"]="async mettreAJourTotaux(id: number)"
  ["async listerActifsParEntreprise(entrepriseId: string)"]="async listerActifsParEntreprise(entrepriseId: number)"
  ["async listerParEntreprise(entrepriseId: string)"]="async listerParEntreprise(entrepriseId: number)"
  
  # Dans les services
  ["obtenirProfil(id: string)"]="obtenirProfil(id: number)"
  ["listerParCycle(cyclePaieId: string)"]="listerParCycle(cyclePaieId: number)"
  ["trouverParId(id: string)"]="trouverParId(id: number)"
  ["obtenirDetailAvecCalculs(id: string)"]="obtenirDetailAvecCalculs(id: number)"
  ["modifier(id: string,"]="modifier(id: number,"
  ["calculerSalaireBrut(id: string)"]="calculerSalaireBrut(id: number)"
  ["supprimer(id: string)"]="supprimer(id: number)"
  ["genererBullein(id: string)"]="genererBullein(id: number)"
  ["mettreAJourJoursTravailes(id: string,"]="mettreAJourJoursTravailes(id: number,"
  
  # Interfaces
  ["employeId: string"]="employeId: number"
  ["cyclePaieId: string"]="cyclePaieId: number"
  ["bulletinPaieId: string"]="bulletinPaieId: number"
  ["entrepriseId: string"]="entrepriseId: number"
  ["traiteParId: string"]="traiteParId: number"
  ["id: string"]="id: number"
)

# Appliquer les remplacements
for pattern in "${!replacements[@]}"; do
  replacement="${replacements[$pattern]}"
  echo "  🔧 Remplacement: '$pattern' -> '$replacement'"
  
  # Chercher et remplacer dans tous les fichiers TypeScript
  find src -name "*.ts" -type f -exec sed -i "s/$pattern/$replacement/g" {} \;
done

echo "✅ Conversion terminée!"