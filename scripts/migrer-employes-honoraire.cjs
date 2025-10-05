/**
 * Script pour migrer les employés HONORAIRE de salaireBase vers tauxHoraire
 * Usage: node scripts/migrer-employes-honoraire.cjs
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrerEmployesHonoraire() {
  try {
    console.log('🔄 Migration des employés HONORAIRE...');

    // Trouver tous les employés honoraires qui ont salaireBase mais pas tauxHoraire
    const employesHonoraire = await prisma.employe.findMany({
      where: {
        typeContrat: 'HONORAIRE',
        OR: [
          { tauxHoraire: null },
          { tauxHoraire: 0 }
        ],
        salaireBase: {
          not: null,
          gt: 0
        }
      }
    });

    console.log(`📊 ${employesHonoraire.length} employé(s) honoraire(s) à migrer trouvé(s)`);

    for (const employe of employesHonoraire) {
      // Calculer un taux horaire basé sur le salaireBase
      // Supposons 160 heures de travail par mois (8h/jour × 20 jours)
      const HEURES_PAR_MOIS = 160;
      const tauxHoraire = Math.round(employe.salaireBase / HEURES_PAR_MOIS);

      console.log(`🔄 Migration ${employe.prenom} ${employe.nom}:`);
      console.log(`   - Ancien salaire base: ${employe.salaireBase?.toLocaleString()} F CFA/mois`);
      console.log(`   - Nouveau taux horaire: ${tauxHoraire.toLocaleString()} F CFA/h`);

      await prisma.employe.update({
        where: { id: employe.id },
        data: {
          tauxHoraire: tauxHoraire,
          salaireBase: null // Supprimer salaireBase pour les honoraires
        }
      });

      console.log(`   ✅ Migration terminée`);
    }

    // Vérifier les résultats
    const employesHonoraireMisAJour = await prisma.employe.findMany({
      where: {
        typeContrat: 'HONORAIRE'
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        salaireBase: true,
        tauxHoraire: true
      }
    });

    console.log('\n📋 État final des employés HONORAIRE:');
    employesHonoraireMisAJour.forEach(emp => {
      console.log(`   - ${emp.prenom} ${emp.nom}: tauxHoraire=${emp.tauxHoraire || 'NULL'}, salaireBase=${emp.salaireBase || 'NULL'}`);
    });

    console.log(`\n✅ Migration terminée avec succès!`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrerEmployesHonoraire();
}

module.exports = { migrerEmployesHonoraire };