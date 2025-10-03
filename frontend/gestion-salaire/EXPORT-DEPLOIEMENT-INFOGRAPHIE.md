# 📤 Guide d'Export & Déploiement - Infographie Pointage

## 🖼️ Export PNG/SVG Haute Résolution

### Option 1 : Export Navigateur (Simple & Rapide)

#### A. **Screenshot HTML → PNG (1920×1080)**

```bash
# 1. Ouvrir l'infographie dans le navigateur
open http://localhost:3001/infographie-pointage.html

# 2. Ouvrir DevTools (F12)
# 3. Console → Exécuter ce script:
```

```javascript
// Script d'export PNG haute résolution
async function exportToPNG() {
  const container = document.body;
  
  // Import html2canvas dynamiquement
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  document.head.appendChild(script);
  
  script.onload = async () => {
    // Attendre le chargement des fonts
    await document.fonts.ready;
    
    // Capturer en haute résolution
    const canvas = await html2canvas(container, {
      scale: 2,  // 2x résolution (3840×2160 pour Retina)
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 1920,
      height: 1080,
      windowWidth: 1920,
      windowHeight: 1080
    });
    
    // Télécharger
    const link = document.createElement('a');
    link.download = `infographie-pointage-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);  // Qualité max
    link.click();
    
    console.log('✅ Export PNG réussi !');
  };
}

exportToPNG();
```

#### B. **Export SVG (Vectoriel, Poids Léger)**

```javascript
// Script d'export SVG (scalable sans perte)
function exportToSVG() {
  const container = document.querySelector('.max-w-7xl');  // Container principal
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${container.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;
  
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `infographie-pointage-${Date.now()}.svg`;
  link.href = url;
  link.click();
  
  console.log('✅ Export SVG réussi !');
}

exportToSVG();
```

---

### Option 2 : Export Headless (Automatisé, CI/CD)

#### A. **Puppeteer** (Node.js)

Créer `scripts/export-infographie.js` :

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function exportInfographie() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Viewport 1920×1080 (Full HD)
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2  // Retina
  });
  
  // Charger la page
  await page.goto('http://localhost:3001/infographie-pointage.html', {
    waitUntil: 'networkidle0'  // Attendre toutes les ressources
  });
  
  // Attendre les animations (si nécessaire)
  await page.waitForTimeout(2000);
  
  // Export PNG
  const outputPath = path.join(__dirname, '../exports', `infographie-${Date.now()}.png`);
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    type: 'png'
  });
  
  console.log(`✅ Export réussi : ${outputPath}`);
  
  // Export PDF (bonus)
  const pdfPath = path.join(__dirname, '../exports', `infographie-${Date.now()}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  console.log(`✅ Export PDF réussi : ${pdfPath}`);
  
  await browser.close();
}

exportInfographie().catch(console.error);
```

**Installation** :
```bash
npm install --save-dev puppeteer
node scripts/export-infographie.js
```

#### B. **Playwright** (Plus moderne, cross-browser)

```javascript
const { chromium } = require('playwright');

async function exportInfographie() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:3001/infographie-pointage.html');
  
  // Attendre chargement complet
  await page.waitForLoadState('networkidle');
  
  // Screenshot
  await page.screenshot({
    path: `exports/infographie-${Date.now()}.png`,
    fullPage: true
  });
  
  // Export PDF haute qualité
  await page.pdf({
    path: `exports/infographie-${Date.now()}.pdf`,
    format: 'A3',  // Plus grand pour infographie
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  console.log('✅ Export terminé');
}

exportInfographie();
```

---

### Option 3 : API d'Export Backend (Production)

Ajouter à l'API Node.js :

```javascript
// src/api/export.api.js
const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

/**
 * POST /api/export/infographie
 * Génère et télécharge l'infographie en PNG/PDF
 * Body: { format: 'png' | 'pdf', darkMode: boolean }
 */
router.post('/infographie', async (req, res) => {
  const { format = 'png', darkMode = false } = req.body;
  
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    // Charger la page avec paramètres
    const url = `http://localhost:3001/infographie?darkMode=${darkMode}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    if (format === 'png') {
      const buffer = await page.screenshot({ fullPage: true, type: 'png' });
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="infographie-pointage.png"`
      });
      res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await page.pdf({
        format: 'A3',
        landscape: true,
        printBackground: true
      });
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="infographie-pointage.pdf"`
      });
      res.send(buffer);
    }
    
    await browser.close();
  } catch (error) {
    console.error('Erreur export:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

module.exports = router;
```

**Usage frontend** :
```javascript
// Service export
export const exporterInfographie = async (format = 'png', darkMode = false) => {
  const response = await fetch('http://localhost:3000/api/export/infographie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, darkMode })
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `infographie-pointage.${format}`;
  a.click();
};
```

---

## 🚀 Déploiement Production

### 🌐 Frontend (React + Vite)

#### Option A : **Netlify** (Recommandé, Simple)

```bash
# 1. Build
cd frontend/gestion-salaire
npm run build

# 2. Créer netlify.toml
```

**`netlify.toml`** :
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
  VITE_API_BASE_URL = "https://api.gestion-salaire.com"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "public, max-age=31536000, immutable"
```

**Déploiement** :
```bash
# Via CLI Netlify
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**URL finale** : `https://gestion-salaire.netlify.app`

---

#### Option B : **Vercel** (Alternative, Edge Functions)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Déployer
cd frontend/gestion-salaire
vercel --prod
```

**`vercel.json`** :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://api.gestion-salaire.vercel.app"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

### 🔧 Backend (Node.js + Express)

#### Option A : **Render** (Gratuit, PostgreSQL inclus)

**1. Créer `render.yaml`** :
```yaml
services:
  - type: web
    name: gestion-salaire-api
    env: node
    region: frankfurt  # ou oregon
    plan: free  # ou starter ($7/mois)
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: gestion-salaire-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000

databases:
  - name: gestion-salaire-db
    databaseName: gestion_salaire
    plan: free  # 1GB storage
```

**2. Déployer** :
```bash
# Via Render Dashboard
git push origin main  # Auto-deploy activé

# Ou via CLI
npm install -g render-cli
render deploy
```

---

#### Option B : **Railway** (Alternative moderne)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Init & Deploy
railway login
railway init
railway up
```

**`railway.json`** :
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

#### Option C : **Docker** (Portable, Self-Hosted)

**`Dockerfile`** (Backend) :
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
```

**`docker-compose.yml`** :
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/gestion_salaire
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=gestion_salaire
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  frontend:
    build: ./frontend/gestion-salaire
    ports:
      - "3001:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/api
    restart: unless-stopped

volumes:
  postgres_data:
```

**Déploiement** :
```bash
# Build & Run
docker-compose up -d

# Migrations
docker-compose exec backend npx prisma migrate deploy

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📊 Monitoring & Analytics

### Frontend

**1. Google Analytics 4** :
```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-XXXXXXXXXX');
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({ category, action, label });
};
```

**2. Sentry (Error Tracking)** :
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "https://xxx@xxx.ingest.sentry.io/xxx",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

### Backend

**1. Winston (Logging)** :
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

**2. Prometheus + Grafana** :
```javascript
const promClient = require('prom-client');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware Express
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});

// Endpoint metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 🔒 Sécurité Production

### Checklist

```bash
# 1. Variables d'environnement sécurisées
✅ JWT_SECRET avec au moins 32 caractères aléatoires
✅ DATABASE_URL avec mot de passe fort
✅ Pas de .env commité dans Git

# 2. HTTPS obligatoire
✅ Certificat SSL (Let's Encrypt gratuit)
✅ Redirect HTTP → HTTPS automatique
✅ HSTS header activé

# 3. Headers de sécurité
✅ helmet.js installé
✅ CORS configuré (origine spécifique)
✅ Rate limiting (express-rate-limit)

# 4. Protection CSRF
✅ csurf middleware
✅ Cookies HttpOnly + Secure + SameSite

# 5. Validation entrées
✅ express-validator sur tous les endpoints
✅ Sanitization XSS (xss-clean)
✅ SQL Injection prevention (Prisma ORM)

# 6. Monitoring
✅ Logs centralisés (Papertrail / Loggly)
✅ Alertes sur erreurs critiques
✅ Backup DB automatique quotidien
```

---

## 📦 Packages.json Scripts

**Backend `package.json`** :
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "echo 'No build needed for Node.js'",
    "migrate": "npx prisma migrate deploy",
    "seed": "npx prisma db seed",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "export": "node scripts/export-infographie.js"
  }
}
```

**Frontend `package.json`** :
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## 🎉 Checklist Finale Déploiement

```
Frontend:
  [x] npm run build sans erreurs
  [x] Variables d'environnement configurées
  [x] HTTPS activé
  [x] CDN configuré (Cloudflare)
  [x] Analytics installé (GA4)
  [x] Error tracking (Sentry)
  [x] Lighthouse score > 90

Backend:
  [x] Database migrée (Prisma)
  [x] Seed data créé
  [x] API endpoints testés (Postman)
  [x] Rate limiting activé
  [x] Logs configurés (Winston)
  [x] Backup DB automatique
  [x] Monitoring (Prometheus)

Infographie:
  [x] Export PNG 1920×1080 testé
  [x] Export PDF A3 landscape testé
  [x] Dark mode fonctionnel
  [x] Responsive mobile/desktop
  [x] Accessibilité WCAG AA validée
  [x] Animations réduites si prefers-reduced-motion

Documentation:
  [x] README.md à jour
  [x] API documentation (Swagger)
  [x] Rationale UX rédigé
  [x] Guide d'intégration complet
```

---

## 📞 Support & Maintenance

**Contact** : Dr. Full-Stack Developer  
**Email** : support@gestion-salaire.com  
**Slack** : #gestion-salaire-support  
**SLA** : Réponse < 4h ouvrées

**Monitoring Dashboard** : https://status.gestion-salaire.com  
**Uptime Target** : 99.9% (8.76h downtime/an max)

---

*Guide d'export et déploiement créé en Octobre 2025*  
*Conforme aux meilleures pratiques DevOps et CI/CD*
