import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function creerSuperAdmin() {
  try {
    console.log('🔧 Création d\'un SUPER_ADMIN...\n');

    // Vérifier s'il existe déjà un SUPER_ADMIN
    const existingSuperAdmin = await prisma.utilisateur.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Un SUPER_ADMIN existe déjà:', existingSuperAdmin.email);
      return;
    }

    // Créer le SUPER_ADMIN (sans entreprise)
    const superAdmin = await prisma.utilisateur.create({
      data: {
        email: 'superadmin@paymanager.com',
        motDePasse: bcrypt.hashSync('superadmin123', 10),
        prenom: 'Super',
        nom: 'Administrator',
        role: 'SUPER_ADMIN',
        // Pas d'entrepriseId pour un SUPER_ADMIN
      }
    });

    console.log('✅ SUPER_ADMIN créé avec succès!');
    console.log('\n🔑 Informations de connexion:');
    console.log('   Email: superadmin@paymanager.com');
    console.log('   Mot de passe: superadmin123');
    console.log('   Rôle: SUPER_ADMIN');
    console.log('\n📍 Après connexion, sera redirigé vers: /super-admin');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

creerSuperAdmin();