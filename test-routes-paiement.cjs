const http = require('http');

// Test des routes de paiement
const testRoutes = [
  {
    method: 'POST',
    path: '/api/paiements/calculer/1',
    data: JSON.stringify({
      dateDebut: '2024-01-01',
      dateFin: '2024-01-31'
    })
  }
];

function testRoute(route) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: route.path,
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': route.data ? Buffer.byteLength(route.data) : 0
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n=== Test de ${route.method} ${route.path} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Response:`, data);
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      console.error(`Erreur pour ${route.path}:`, err.message);
      reject(err);
    });

    if (route.data) {
      req.write(route.data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test des routes de paiement automatisé...\n');
  
  for (const route of testRoutes) {
    try {
      await testRoute(route);
    } catch (error) {
      console.error('Erreur lors du test:', error.message);
    }
  }
}

runTests();