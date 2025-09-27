import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCaissier() {
  try {
    console.log('🔍 Vérification des données du caissier...\n');

    // Rechercher le caissier
    const caissier = await prisma.utilisateur.findUnique({
      where: { email: 'caissier@testsa.com' },
      include: {
        entreprise: true
      }
    });

    if (!caissier) {
      console.log('❌ Caissier non trouvé avec l\'email: caissier@testsa.com');
      return;
    }

    console.log('✅ Caissier trouvé:');
    console.log(`   ID: ${caissier.id}`);
    console.log(`   Email: ${caissier.email}`);
    console.log(`   Nom: ${caissier.prenom} ${caissier.nom}`);
    console.log(`   Rôle: ${caissier.role}`);
    console.log(`   Entreprise ID: ${caissier.entrepriseId}`);
    console.log(`   Est actif: ${caissier.estActif}`);

    if (caissier.entreprise) {
      console.log('\n🏢 Entreprise associée:');
      console.log(`   ID: ${caissier.entreprise.id}`);
      console.log(`   Nom: ${caissier.entreprise.nom}`);
      console.log(`   Email: ${caissier.entreprise.email}`);
    } else {
      console.log('\n❌ Aucune entreprise associée');
    }

    // Vérifier toutes les entreprises
    console.log('\n📋 Toutes les entreprises:');
    const entreprises = await prisma.entreprise.findMany();
    entreprises.forEach(e => {
      console.log(`   ID: ${e.id}, Nom: ${e.nom}`);
    });

    // Vérifier tous les utilisateurs
    console.log('\n👥 Tous les utilisateurs:');
    const utilisateurs = await prisma.utilisateur.findMany({
      include: { entreprise: true }
    });
    utilisateurs.forEach(u => {
      console.log(`   ${u.email} (ID: ${u.id}) - Entreprise: ${u.entreprise?.nom || 'Aucune'} (ID: ${u.entrepriseId})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCaissier();