import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listerSuperAdmins() {
  try {
    const superAdmins = await prisma.utilisateur.findMany({ 
      where: { role: 'SUPER_ADMIN' } 
    }); 
    
    console.log('🔧 SUPER_ADMIN existants:'); 
    superAdmins.forEach(u => {
      console.log(`- Email: ${u.email}`);
      console.log(`  Nom: ${u.prenom} ${u.nom}`);
      console.log(`  ID: ${u.id}`);
      console.log('---');
    });

    if (superAdmins.length === 0) {
      console.log('❌ Aucun SUPER_ADMIN trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listerSuperAdmins();