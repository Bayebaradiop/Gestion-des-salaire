# Calcul Automatique des Durées de Pointage - Documentation Technique

## Vue d'ensemble

Cette documentation présente l'implémentation complète du système de calcul automatique des durées de pointage. Le système calcule automatiquement la `dureeMinutes` basée sur `heureArrivee` et `heureDepart`, avec validation et gestion d'erreurs robuste.

## Architecture

### 1. Service Layer (`PointageService`)

#### Méthode de Calcul Core

```typescript
private calculerDureeMinutes(heureArrivee?: Date | null, heureDepart?: Date | null): number | null {
  // Validation des paramètres
  if (!heureArrivee || !heureDepart) {
    return null;
  }

  // Validation logique : départ après arrivée
  if (heureDepart <= heureArrivee) {
    console.warn('⚠️ Heure de départ antérieure ou égale à l\'heure d\'arrivée');
    return null;
  }

  // Calcul en minutes
  const diffEnMs = heureDepart.getTime() - heureArrivee.getTime();
  const diffEnMinutes = Math.floor(diffEnMs / (1000 * 60));

  // Validation de plausibilité (0-24h)
  if (diffEnMinutes < 0 || diffEnMinutes > 1440) {
    console.warn('⚠️ Durée calculée invalide');
    return null;
  }

  return diffEnMinutes;
}
```

#### Fonctionnalités Principales

**1. Départ avec Calcul Automatique**
```typescript
async depart(payload: { entrepriseId: number; employeId: number; notes?: string; date?: string }) {
  // Récupérer le pointage existant
  const existant = await this.repo.trouverParEmployeEtDate(payload.employeId, dateNormalisee);
  
  // Calcul automatique de la durée
  const dureeCalculee = this.calculerDureeMinutes(new Date(existant.heureArrivee), now);
  const dureeMinutes = dureeCalculee || 0; // Fallback sécurisé
  
  // Enregistrer avec durée calculée
  return await this.repo.clockOut({
    employeId: payload.employeId,
    date: dateNormalisee,
    heureDepart: now,
    dureeMinutes,
    notes: payload.notes,
  });
}
```

**2. Mise à Jour avec Recalcul Conditionnel**
```typescript
async mettreAJourPointage(id: number, data: { 
  heureArrivee?: Date; 
  heureDepart?: Date; 
  statut?: StatutPointage; 
  notes?: string;
  dureeMinutes?: number; // Si fourni, ne pas recalculer
}) {
  // Récupérer l'existant
  const pointageExistant = await this.repo.trouverParId(id);
  
  // Combiner données existantes + nouvelles
  const heureArrivee = data.heureArrivee ?? pointageExistant.heureArrivee;
  const heureDepart = data.heureDepart ?? pointageExistant.heureDepart;

  // Recalculer SEULEMENT si heures modifiées et dureeMinutes pas fournie
  let dureeMinutes = data.dureeMinutes ?? null;
  if (dureeMinutes === null && (data.heureArrivee || data.heureDepart)) {
    dureeMinutes = this.calculerDureeMinutes(heureArrivee, heureDepart);
  }
  
  // Conserver ancienne durée si pas de recalcul
  if (dureeMinutes === null && data.dureeMinutes === undefined) {
    dureeMinutes = pointageExistant.dureeMinutes;
  }

  return await this.repo.mettreAJour(id, { /* ... */ });
}
```

**3. Recalcul en Masse**
```typescript
async recalculerToutesLesDurees(entrepriseId?: number): Promise<number> {
  // Trouver pointages sans durée mais avec heures
  const pointagesSansDuree = await this.repo.trouverSansDuree(entrepriseId);
  
  let nombreMisAJour = 0;
  
  for (const pointage of pointagesSansDuree) {
    const dureeCalculee = this.calculerDureeMinutes(
      pointage.heureArrivee,
      pointage.heureDepart
    );
    
    if (dureeCalculee !== null) {
      await this.repo.mettreAJour(pointage.id, { dureeMinutes: dureeCalculee });
      nombreMisAJour++;
    }
  }
  
  return nombreMisAJour;
}
```

### 2. Repository Layer (`PointageRepository`)

#### Nouvelles Méthodes

**1. Mise à Jour Générique**
```typescript
async mettreAJour(id: number, data: {
  heureArrivee?: Date | null;
  heureDepart?: Date | null;
  dureeMinutes?: number | null;
  statut?: StatutPointage;
  notes?: string;
}) {
  return this.prisma.pointage.update({
    where: { id },
    data: {
      ...data,
      misAJourLe: new Date(),
    },
    include: { employe: true, entreprise: true }
  });
}
```

**2. Recherche de Pointages Sans Durée**
```typescript
async trouverSansDuree(entrepriseId?: number) {
  const where = {
    AND: [
      { dureeMinutes: null },
      { heureArrivee: { not: null } },
      { heureDepart: { not: null } },
    ]
  };
  
  if (entrepriseId) {
    where.entrepriseId = entrepriseId;
  }
  
  return this.prisma.pointage.findMany({ where, /* ... */ });
}
```

### 3. API Layer (`PointageController`)

#### Nouvelles Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| PUT | `/pointages/:id` | Mise à jour avec recalcul automatique |
| POST | `/pointages/:id/recalculer-duree` | Recalcul forcé d'un pointage |
| POST | `/entreprises/:id/pointages/recalculer-durees` | Recalcul en masse |
| GET | `/employes/:id/statistiques` | Statistiques de pointage |

#### Exemple d'Usage API

```bash
# Mise à jour d'un pointage avec recalcul automatique
curl -X PUT http://localhost:3000/api/pointages/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "heureDepart": "2025-10-05T17:30:00.000Z",
    "notes": "Travail supplémentaire"
  }'

# Recalcul en masse pour une entreprise
curl -X POST http://localhost:3000/api/entreprises/1/pointages/recalculer-durees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Règles de Calcul

### 1. Conditions de Calcul

- ✅ **heureArrivee** ET **heureDepart** doivent être non-null
- ✅ **heureDepart** > **heureArrivee** (validation temporelle)
- ✅ Durée calculée entre **0 et 1440 minutes** (0-24h)

### 2. Formule de Calcul

```javascript
dureeMinutes = Math.floor((heureDepart - heureArrivee) / (1000 * 60))
```

### 3. Cas Spéciaux

| Cas | Comportement |
|-----|-------------|
| `heureArrivee` ou `heureDepart` NULL | `dureeMinutes` = NULL |
| `heureDepart` ≤ `heureArrivee` | `dureeMinutes` = NULL + warning |
| Durée > 24h | `dureeMinutes` = NULL + warning |
| `dureeMinutes` déjà fournie | Pas de recalcul automatique |

### 4. Stratégies de Fallback

```typescript
// 1. Priorité à la valeur fournie explicitement
if (data.dureeMinutes !== undefined) {
  dureeMinutes = data.dureeMinutes;
}

// 2. Recalcul si heures modifiées
else if (data.heureArrivee || data.heureDepart) {
  dureeMinutes = this.calculerDureeMinutes(heureArrivee, heureDepart);
}

// 3. Conserver ancienne valeur
else {
  dureeMinutes = pointageExistant.dureeMinutes;
}
```

## Migration des Données

### Script de Migration

Le script `scripts/recalculer-durees-pointages.cjs` permet de :

1. **Identifier** les pointages sans durée mais avec heures
2. **Calculer** les durées manquantes avec validation
3. **Mettre à jour** la base de données
4. **Détecter** les inconsistances existantes

#### Usage

```bash
# Recalcul pour toutes les entreprises
node scripts/recalculer-durees-pointages.cjs

# Recalcul pour une entreprise spécifique
node scripts/recalculer-durees-pointages.cjs 1

# Via l'API (authentification requise)
curl -X POST http://localhost:3000/api/entreprises/1/pointages/recalculer-durees
```

#### Exemple de Sortie

```
🔄 Démarrage du recalcul des durées de pointage...
📍 Recalcul pour l'entreprise ID: 1
📊 15 pointages à recalculer

✅ Pointage 1 mis à jour - Jean Dupont (Entreprise ABC) - 480 minutes
✅ Pointage 2 mis à jour - Marie Martin (Entreprise ABC) - 420 minutes
⚠️ Pointage 3 ignoré - Pierre Durant (Entreprise ABC) - calcul impossible

📈 Résumé du recalcul:
✅ 14 pointages mis à jour avec succès
⚠️ 1 pointages avec erreurs
📊 15 pointages traités au total
```

## Intégration avec le Système de Paie

### 1. Employés HONORAIRE

Le calcul automatique des durées est crucial pour les employés payés à l'heure :

```typescript
// Dans AbsenceService.calculerSalaireHonoraire()
const totalMinutes = pointages
  .filter(p => p.dureeMinutes !== null)
  .reduce((sum, p) => sum + p.dureeMinutes, 0);

const totalHeures = totalMinutes / 60;
const salaireNet = totalHeures * tauxHoraire;
```

### 2. Statistiques de Performance

```typescript
const stats = await pointageService.obtenirStatistiquesPointage(
  employeId, 
  new Date('2025-10-01'), 
  new Date('2025-10-31')
);

// Résultat :
{
  periode: { debut: "2025-10-01", fin: "2025-10-31" },
  totalJours: 22,
  joursPresents: 20,
  joursAbsents: 2,
  totalMinutes: 9600,
  totalHeures: 160,
  moyenneMinutesParJour: 480,
  moyenneHeuresParJour: 8
}
```

## Tests et Validation

### 1. Script de Test

```bash
./test-durees-pointages.sh
```

Le script vérifie :
- ✅ Compilation TypeScript sans erreurs
- ✅ Exécution du script de migration
- ✅ État de la base de données
- ✅ Cohérence des données

### 2. Tests Unitaires Recommandés

```typescript
describe('PointageService.calculerDureeMinutes', () => {
  it('should calculate duration correctly', () => {
    const arrivee = new Date('2025-10-05T08:00:00Z');
    const depart = new Date('2025-10-05T17:00:00Z');
    const duree = service.calculerDureeMinutes(arrivee, depart);
    expect(duree).toBe(540); // 9h = 540 min
  });

  it('should return null for invalid times', () => {
    const arrivee = new Date('2025-10-05T17:00:00Z');
    const depart = new Date('2025-10-05T08:00:00Z'); // Inversé
    const duree = service.calculerDureeMinutes(arrivee, depart);
    expect(duree).toBeNull();
  });
});
```

## Monitoring et Maintenance

### 1. Indicateurs à Surveiller

- **Pointages sans durée** : `SELECT COUNT(*) FROM pointages WHERE dureeMinutes IS NULL AND heureArrivee IS NOT NULL AND heureDepart IS NOT NULL`
- **Durées incohérentes** : Via `trouverDureesInconsistantes()`
- **Durées excessives** : `SELECT COUNT(*) FROM pointages WHERE dureeMinutes > 1440`

### 2. Actions de Maintenance Recommandées

1. **Hebdomadaire** : Vérifier les inconsistances
2. **Mensuel** : Recalcul des durées manquantes
3. **Après migration** : Exécution du script de recalcul complet

### 3. Logs à Surveiller

```typescript
// Warnings automatiques dans les logs
⚠️ Heure de départ antérieure ou égale à l'heure d'arrivée
⚠️ Durée calculée invalide
✅ Départ enregistré avec durée calculée
✅ Durée recalculée
```

## Conclusion

L'implémentation fournit :

✅ **Calcul automatique** des durées de pointage  
✅ **Validation robuste** avec gestion d'erreurs  
✅ **Recalcul conditionnel** lors des mises à jour  
✅ **Migration en masse** des données existantes  
✅ **API complète** pour la gestion programmatique  
✅ **Intégration** avec le système de paie existant  

Le système garantit que `dureeMinutes` est toujours cohérent avec `heureArrivee` et `heureDepart`, tout en évitant les erreurs de données et en fournissant une base solide pour les calculs de paie automatisés.