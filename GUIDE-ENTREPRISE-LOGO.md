# Guide d'utilisation du composant EntrepriseLogo

## Vue d'ensemble

Le composant `EntrepriseLogo` est un composant React réutilisable pour afficher le logo d'une entreprise avec un fallback automatique vers une initiale stylisée si le logo n'existe pas ou ne peut pas être chargé.

## Import

```jsx
import EntrepriseLogo from '../components/ui/EntrepriseLogo';
```

## Utilisation de base

```jsx
<EntrepriseLogo 
  entreprise={entreprise} 
  size="md"
/>
```

## Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `entreprise` | Object | **Requis** | Objet entreprise avec `nom` et `logo` |
| `size` | String | `'md'` | Taille du logo: `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `className` | String | `''` | Classes CSS supplémentaires |
| `showFallback` | Boolean | `true` | Afficher le fallback en cas d'erreur |

## Tailles disponibles

- **sm**: 32x32px (w-8 h-8)
- **md**: 48x48px (w-12 h-12) 
- **lg**: 64x64px (w-16 h-16)
- **xl**: 80x80px (w-20 h-20)

## Types de logos supportés

1. **URLs complètes**: `https://example.com/logo.png`
2. **Chemins relatifs**: `/uploads/logo.jpg` (automatiquement préfixé avec l'URL de l'API)
3. **Base64**: `data:image/png;base64,iVBORw0KGgo...`

## Exemples d'utilisation

### Dans une liste d'entreprises
```jsx
{entreprises.map((entreprise) => (
  <div key={entreprise.id} className="flex items-center space-x-3">
    <EntrepriseLogo 
      entreprise={entreprise} 
      size="md"
    />
    <div>
      <h3>{entreprise.nom}</h3>
      <p>{entreprise.email}</p>
    </div>
  </div>
))}
```

### Dans un header de page
```jsx
<div className="flex items-center space-x-4">
  <EntrepriseLogo 
    entreprise={entreprise} 
    size="lg"
    className="shadow-lg"
  />
  <div>
    <h1>{entreprise.nom}</h1>
    <p>{entreprise.adresse}</p>
  </div>
</div>
```

### Dans un tableau compact
```jsx
<td className="px-6 py-4">
  <div className="flex items-center">
    <EntrepriseLogo 
      entreprise={entreprise} 
      size="sm"
    />
    <span className="ml-3">{entreprise.nom}</span>
  </div>
</td>
```

## Comportement du fallback

Si le logo ne peut pas être chargé (erreur réseau, fichier manquant, etc.), le composant affiche automatiquement :

- Un cercle avec un dégradé bleu-violet
- La première lettre du nom de l'entreprise en blanc
- Taille et style adaptés à la prop `size`

## Gestion des erreurs

Le composant gère automatiquement :
- ✅ Images base64 invalides
- ✅ URLs d'images brisées  
- ✅ Chemins de fichiers manquants
- ✅ Entreprises sans logo défini

## Configuration de l'environnement

Le composant utilise la variable d'environnement `VITE_API_URL` pour construire les URLs des images uploadées. 

Dans votre `.env` :
```env
VITE_API_URL=http://localhost:3000
```

## Intégration avec le backend

Le backend doit servir les fichiers statiques dans le dossier `/uploads` :

```javascript
// Dans index.ts/js
app.use('/uploads', express.static('uploads'));
```

## Styles personnalisés

Vous pouvez ajouter des styles personnalisés via la prop `className` :

```jsx
<EntrepriseLogo 
  entreprise={entreprise} 
  size="lg"
  className="shadow-xl border-2 border-gray-300 hover:scale-105 transition-transform"
/>
```

## Performance

- ✅ Lazy loading automatique des images
- ✅ Fallback immédiat sans flash
- ✅ Gestion d'erreur silencieuse
- ✅ Pas de re-render inutile