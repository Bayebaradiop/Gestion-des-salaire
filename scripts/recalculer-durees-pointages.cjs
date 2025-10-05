#!/usr/bin/env node

/**
 * Script de migration pour recalculer automatiquement les durées manquantes
 * Usage: node scripts/recalculer-durees-pointages.cjs [entrepriseId]
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Calcule la durée en minutes entre l'heure d'arrivée et l'heure de départ
 */
function calculerDureeMinutes(heureArrivee, heureDepart) {
  if (!heureArrivee || !heureDepart) {
    return null;
  }

  const dateArrivee = new Date(heureArrivee);
  const dateDepart = new Date(heureDepart);

  // Validation : l'heure de départ doit être après l'heure d'arrivée
  if (dateDepart <= dateArrivee) {
    console.warn('⚠️ Heure de départ antérieure ou égale à l\'heure d\'arrivée', {
      heureArrivee: dateArrivee.toISOString(),
      heureDepart: dateDepart.toISOString()
    });
    return null;
  }

  // Calcul de la différence en minutes
  const diffEnMs = dateDepart.getTime() - dateArrivee.getTime();
  const diffEnMinutes = Math.floor(diffEnMs / (1000 * 60));

  // Sécurité : pas de durées négatives ou excessives (plus de 24h = 1440 minutes)
  if (diffEnMinutes < 0 || diffEnMinutes > 1440) {
    console.warn('⚠️ Durée calculée invalide', {
      dureeMinutes: diffEnMinutes,
      heureArrivee: dateArrivee.toISOString(),
      heureDepart: dateDepart.toISOString()
    });
    return null;
  }

  return diffEnMinutes;
}

async function recalculerDurees(entrepriseId = null) {
  try {
    console.log('🔄 Démarrage du recalcul des durées de pointage...');

    // Construire le filtre de recherche
    const where = {
      AND: [
        { dureeMinutes: null },
        { heureArrivee: { not: null } },
        { heureDepart: { not: null } },
      ]
    };

    if (entrepriseId) {
      where.entrepriseId = parseInt(entrepriseId);
      console.log(`📍 Recalcul pour l'entreprise ID: ${entrepriseId}`);
    } else {
      console.log('📍 Recalcul pour toutes les entreprises');
    }

    // Trouver tous les pointages sans durée mais avec heures d'arrivée et départ
    const pointagesSansDuree = await prisma.pointage.findMany({
      where,
      include: {
        employe: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            codeEmploye: true
          }
        },
        entreprise: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    console.log(`📊 ${pointagesSansDuree.length} pointages à recalculer`);

    if (pointagesSansDuree.length === 0) {
      console.log('✅ Aucun pointage à recalculer');
      return 0;
    }

    let nombreMisAJour = 0;
    let nombreErreurs = 0;

    // Traiter chaque pointage
    for (const pointage of pointagesSansDuree) {
      try {
        const dureeCalculee = calculerDureeMinutes(
          pointage.heureArrivee,
          pointage.heureDepart
        );

        if (dureeCalculee !== null) {
          await prisma.pointage.update({
            where: { id: pointage.id },
            data: {
              dureeMinutes: dureeCalculee,
              misAJourLe: new Date()
            }
          });

          console.log(`✅ Pointage ${pointage.id} mis à jour - ${pointage.employe.prenom} ${pointage.employe.nom} (${pointage.entreprise.nom}) - ${dureeCalculee} minutes`);
          nombreMisAJour++;
        } else {
          console.log(`⚠️ Pointage ${pointage.id} ignoré - ${pointage.employe.prenom} ${pointage.employe.nom} (${pointage.entreprise.nom}) - calcul impossible`);
          nombreErreurs++;
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour du pointage ${pointage.id}:`, error);
        nombreErreurs++;
      }
    }

    console.log('\n📈 Résumé du recalcul:');
    console.log(`✅ ${nombreMisAJour} pointages mis à jour avec succès`);
    console.log(`⚠️ ${nombreErreurs} pointages avec erreurs`);
    console.log(`📊 ${pointagesSansDuree.length} pointages traités au total`);

    return nombreMisAJour;
  } catch (error) {
    console.error('❌ Erreur lors du recalcul en masse:', error);
    throw error;
  }
}

async function verifierInconsistances(entrepriseId = null) {
  console.log('\n🔍 Vérification des inconsistances...');

  try {
    // Construire le filtre de recherche
    const where = {
      AND: [
        { heureArrivee: { not: null } },
        { heureDepart: { not: null } },
        { dureeMinutes: { not: null } },
      ]
    };

    if (entrepriseId) {
      where.entrepriseId = parseInt(entrepriseId);
    }

    const pointagesAvecDuree = await prisma.pointage.findMany({
      where,
      include: {
        employe: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            codeEmploye: true
          }
        }
      }
    });

    let inconsistances = 0;

    for (const pointage of pointagesAvecDuree) {
      const dureeCalculee = calculerDureeMinutes(
        pointage.heureArrivee,
        pointage.heureDepart
      );

      if (dureeCalculee !== null && dureeCalculee !== pointage.dureeMinutes) {
        console.log(`⚠️ Inconsistance détectée - Pointage ${pointage.id} (${pointage.employe.prenom} ${pointage.employe.nom})`);
        console.log(`   Durée stockée: ${pointage.dureeMinutes} minutes`);
        console.log(`   Durée calculée: ${dureeCalculee} minutes`);
        inconsistances++;
      }
    }

    if (inconsistances === 0) {
      console.log('✅ Aucune inconsistance détectée');
    } else {
      console.log(`⚠️ ${inconsistances} inconsistances détectées`);
    }

    return inconsistances;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

async function main() {
  try {
    const entrepriseId = process.argv[2]; // Paramètre optionnel

    // Étape 1: Recalculer les durées manquantes
    const nombreMisAJour = await recalculerDurees(entrepriseId);

    // Étape 2: Vérifier les inconsistances
    const inconsistances = await verifierInconsistances(entrepriseId);

    console.log('\n🎉 Migration terminée avec succès!');
    console.log(`📊 Résumé final:`);
    console.log(`   - ${nombreMisAJour} durées recalculées`);
    console.log(`   - ${inconsistances} inconsistances détectées`);

    if (inconsistances > 0) {
      console.log('\n💡 Conseil: Exécutez à nouveau le script pour corriger les inconsistances détectées');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}