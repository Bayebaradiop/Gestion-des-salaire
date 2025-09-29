# Dashboard de Gestion des Salaires

## 🎯 Fonctionnalités

### 1. **4 KPI Cards**
- **Masse Salariale Totale** : Montant total des salaires pour la période
- **Montant Déjà Payé** : Somme des paiements effectués
- **Montant Restant** : Solde à payer
- **Nombre d'Employés Actifs** : Effectif actuellement actif

Chaque KPI affiche :
- ✅ Valeur actuelle formatée
- ✅ Variation par rapport à la période précédente
- ✅ Icône et couleur spécifiques
- ✅ Animation au survol

### 2. **3 Graphiques Interactifs**

#### **Line Chart - Évolution Masse Salariale**
- Graphique en ligne montrant l'évolution sur 6 mois
- Couleur : Bleu (#3b82f6)
- Points interactifs avec tooltip

#### **Bar Chart - Montant Payé par Mois**
- Graphique en barres des paiements mensuels
- Couleur : Vert (#10b981)
- Barres arrondies

#### **Area Chart - Montant Restant à Payer**
- Graphique en aire des montants restants
- Couleur : Orange (#f59e0b)
- Dégradé de couleur

### 3. **Tableau des Prochains Paiements**
- Liste des employés avec paiements en attente
- Colonnes : Nom, Montant, Date prévue, Statut, Priorité
- Badges colorés pour les statuts :
  - 🔵 **Approuvé** : Prêt à payer
  - ⚪ **Brouillon** : En cours de préparation
  - 🟠 **Payé Partiel** : Partiellement payé
- Badges de priorité :
  - 🔴 **Urgent** : À traiter en priorité
  - 🟡 **Moyen** : Traitement normal
  - 🟢 **Normal** : Pas d'urgence

## 🚀 Installation & Utilisation

### Prérequis
```bash
npm install recharts react-icons
```

### Import du composant
```jsx
import DashboardSalaire from './components/dashboard/DashboardSalaire';

function App() {
  return (
    <div>
      <DashboardSalaire />
    </div>
  );
}
```

### Intégration avec React Router
```jsx
// Dans App.jsx
import DashboardSalairePage from './pages/dashboard/DashboardSalairePage';

<Route path="/dashboard-salaire" element={<DashboardSalairePage />} />
```

## 📊 Données Mock Incluses

Le composant utilise des données mock réalistes :

### KPI
- Masse salariale : 25,650,000 XOF
- Montant payé : 18,420,000 XOF  
- Montant restant : 7,230,000 XOF
- Employés actifs : 124

### Données historiques
- 6 mois de données pour les graphiques
- Montants en francs CFA (XOF)
- Évolution réaliste

### Paiements en attente
- 5 employés avec statuts différents
- Priorités et dates variables
- Montants réalistes

## 🎨 Design & Responsive

### Couleurs
- **Bleu** : Masse salariale, graphiques principaux
- **Vert** : Montants payés, succès
- **Orange** : Montants restants, alertes
- **Violet** : Employés, ressources humaines
- **Rouge** : Urgences, priorités hautes

### Breakpoints Responsive
- **Mobile** : Stack vertical des KPI
- **Tablet** : 2 colonnes pour les KPI
- **Desktop** : 4 colonnes complètes

### Animations
- Hover effects sur les cartes KPI
- Loading spinner au chargement
- Transitions fluides

## 🔄 Intégration avec API Réelle

Pour connecter à votre API, remplacez les données mock dans `useEffect` :

```jsx
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    
    try {
      // Remplacez par vos appels API
      const kpiResponse = await dashboardService.getKPI();
      const chartResponse = await dashboardService.getChartData();
      const paiementsResponse = await dashboardService.getProchainsPaiements();
      
      setKpiData(kpiResponse.data);
      setChartData(chartResponse.data);
      setProchainsPaiements(paiementsResponse.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

## 📱 Captures d'écran

Le dashboard inclut :
- ✅ État de chargement avec spinner
- ✅ Design moderne et professionnel
- ✅ Formatage automatique des montants
- ✅ Tooltips informatifs
- ✅ Responsive design complet
- ✅ Accessibilité optimisée

## 🛠 Personnalisation

### Changer les couleurs
Modifiez les classes Tailwind dans le composant :
```jsx
// Exemple pour changer la couleur des KPI
color="bg-purple-500"  // Changez purple-500
```

### Ajouter des KPI
Ajoutez de nouvelles cartes dans la grille :
```jsx
<KpiCard
  title="Nouveau KPI"
  value={nouvelleValeur}
  variation={nouvelleVariation}
  icon={NouvelleIcone}
  color="bg-indigo-500"
  bgColor="bg-white"
  textColor="text-gray-900"
/>
```

### Modifier les graphiques
Recharts offre de nombreuses options de personnalisation :
- Couleurs des graphiques
- Types de graphiques
- Animations
- Légendes personnalisées

## 🎯 Prêt à l'emploi !

Ce composant est entièrement fonctionnel et peut être intégré directement dans votre application React avec Tailwind CSS et Recharts.