/**
 * Script pour créer un employé honoraire de test
 * Usage: node scripts/creer-employe-honoraire.cjs
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function creerEmployeHonoraire() {
  try {
    console.log('🚀 Création d\'un employé honoraire de test...');

    // Trouver la première entreprise active
    const entreprise = await prisma.entreprise.findFirst({
      where: { estActif: true }
    });

    if (!entreprise) {
      console.error('❌ Aucune entreprise active trouvée');
      return;
    }

    console.log(`📊 Entreprise trouvée: ${entreprise.nom} (ID: ${entreprise.id})`);

    // Créer l'employé honoraire
    const employe = await prisma.employe.create({
      data: {
        codeEmploye: `EMP-HON${Date.now()}`,
        prenom: 'Marie',
        nom: 'Dupont',
        email: 'marie.dupont@example.com',
        telephone: '+221771234567',
        poste: 'Consultante IT',
        typeContrat: 'HONORAIRE',
        tauxHoraire: 15000, // 15,000 F CFA par heure
        compteBancaire: 'FR1420041010050500013M02606',
        dateEmbauche: new Date('2024-01-15'),
        entrepriseId: entreprise.id,
        estActif: true
      }
    });

    console.log(`✅ Employé honoraire créé avec succès!`);
    console.log(`   - Code: ${employe.codeEmploye}`);
    console.log(`   - Nom: ${employe.prenom} ${employe.nom}`);
    console.log(`   - Type: ${employe.typeContrat}`);
    console.log(`   - Taux horaire: ${employe.tauxHoraire?.toLocaleString()} F CFA/h`);
    console.log(`   - ID: ${employe.id}`);

    // Créer quelques pointages de test pour le mois d'octobre 2025
    const pointages = [
      {
        date: new Date('2025-10-01'),
        heureArrivee: new Date('2025-10-01T08:00:00'),
        heureDepart: new Date('2025-10-01T17:00:00'), // 9h de travail
        statut: 'PRESENT'
      },
      {
        date: new Date('2025-10-02'),
        heureArrivee: new Date('2025-10-02T09:00:00'),
        heureDepart: new Date('2025-10-02T18:00:00'), // 9h de travail
        statut: 'PRESENT'
      },
      {
        date: new Date('2025-10-03'),
        heureArrivee: new Date('2025-10-03T08:30:00'),
        heureDepart: new Date('2025-10-03T16:30:00'), // 8h de travail
        statut: 'PRESENT'
      }
    ];

    for (const pointageData of pointages) {
      await prisma.pointage.create({
        data: {
          ...pointageData,
          employeId: employe.id,
          entrepriseId: entreprise.id
        }
      });
    }

    console.log(`📍 ${pointages.length} pointages de test créés pour octobre 2025`);
    console.log(`   - Total heures attendues: 26h (9h + 9h + 8h)`);
    console.log(`   - Salaire attendu: ${(26 * 15000).toLocaleString()} F CFA`);

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  creerEmployeHonoraire();
}

module.exports = { creerEmployeHonoraire };