import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateEntreprises() {
  console.log('🔄 Vérification des entreprises existantes...');

  try {
    // Vérifier l'état actuel
    const entreprises = await prisma.entreprise.findMany({
      select: {
        id: true,
        nom: true,
        accesSuperAdminAutorise: true
      }
    });

    console.log('📊 État actuel des entreprises:');
    if (entreprises.length === 0) {
      console.log('  Aucune entreprise trouvée');
    } else {
      entreprises.forEach(ent => {
        console.log(`  - ${ent.nom} (ID: ${ent.id}): ${ent.accesSuperAdminAutorise ? '✅ Autorisé' : '❌ Bloqué'}`);
      });
    }

    // Test de mise à jour pour la première entreprise
    if (entreprises.length > 0) {
      const premiereEntreprise = entreprises[0];
      console.log(`\n🧪 Test de mise à jour pour: ${premiereEntreprise.nom}`);
      
      const updated = await prisma.entreprise.update({
        where: { id: premiereEntreprise.id },
        data: { accesSuperAdminAutorise: true },
        select: {
          id: true,
          nom: true,
          accesSuperAdminAutorise: true
        }
      });
      
      console.log(`✅ Test réussi: ${updated.nom} - ${updated.accesSuperAdminAutorise ? 'Autorisé' : 'Bloqué'}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEntreprises();