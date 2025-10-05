import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corrigerEmployeJournalier() {
  try {
    console.log('🔧 Correction des données employé journalier...');
    
    // Trouver l'employé Ahmed Diallo (ou EMP003)
    let employe = await prisma.employe.findFirst({
      where: {
        OR: [
          { nom: 'Diallo', prenom: 'Ahmed' },
          { codeEmploye: 'EMP003' }
        ]
      }
    });

    if (!employe) {
      console.log('❌ Employé Ahmed Diallo (EMP003) non trouvé');
      return;
    }

    console.log('✅ Employé trouvé:', {
      id: employe.id,
      nom: employe.nom,
      prenom: employe.prenom,
      codeEmploye: employe.codeEmploye,
      typeContrat: employe.typeContrat,
      tauxJournalier: employe.tauxJournalier
    });

    // Mettre à jour avec un taux journalier
    const employeMisAJour = await prisma.employe.update({
      where: { id: employe.id },
      data: {
        typeContrat: 'JOURNALIER',
        tauxJournalier: 25000, // 25 000 F CFA par jour
        salaireBase: null // Pas de salaire base pour les journaliers
      }
    });

    console.log('✅ Employé mis à jour:', {
      id: employeMisAJour.id,
      typeContrat: employeMisAJour.typeContrat,
      tauxJournalier: employeMisAJour.tauxJournalier
    });

    // Vérifier les pointages existants pour octobre 2025
    const pointages = await prisma.pointage.findMany({
      where: {
        employeId: employe.id,
        date: {
          gte: new Date('2025-10-01'),
          lte: new Date('2025-10-31')
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log(`📊 Pointages trouvés pour octobre 2025: ${pointages.length}`);
    pointages.forEach(p => {
      console.log(`- ${p.date.toISOString().split('T')[0]}: ${p.statut}`);
    });

    // Compter les présences
    const presences = pointages.filter(p => p.statut === 'PRESENT');
    console.log(`✅ Nombre de jours présents: ${presences.length}`);
    console.log(`💰 Salaire calculé: ${presences.length * 25000} F CFA`);

    // Vérifier s'il y a un bulletin pour octobre 2025
    const bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        employeId: employe.id,
        cyclePaie: {
          dateDebut: {
            gte: new Date('2025-10-01')
          },
          dateFin: {
            lte: new Date('2025-10-31')
          }
        }
      },
      include: {
        cyclePaie: true
      }
    });

    if (bulletin) {
      console.log('📋 Bulletin trouvé:', {
        id: bulletin.id,
        salaireBrut: bulletin.salaireBrut,
        salaireNet: bulletin.salaireNet,
        joursTravailes: bulletin.joursTravailes,
        cycle: bulletin.cyclePaie.titre
      });
    } else {
      console.log('⚠️ Aucun bulletin trouvé pour octobre 2025');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigerEmployeJournalier().catch(console.error);