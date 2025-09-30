// Test d'upload de logo pour l'entreprise ID=1
// Usage: node test-upload.js

import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

async function testUploadLogo() {
  try {
    console.log('🧪 Test d\'upload de logo...');

    // D'abord, se connecter pour obtenir un token
    console.log('🔐 Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'superadmin@testsa.com',
      motDePasse: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenu');

    // Créer un fichier test simple
    const testImagePath = './test-logo.jpg';
    if (!fs.existsSync(testImagePath)) {
      // Créer un fichier de test simple (mais avec du contenu qui ressemble à une image)
      const fakeImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(testImagePath, fakeImageBuffer);
      console.log('📄 Fichier de test créé:', testImagePath);
    }

    // Préparer le FormData
    const form = new FormData();
    form.append('logo', fs.createReadStream(testImagePath));

    // Configuration de la requête
    const config = {
      method: 'POST',
      url: 'http://localhost:3000/api/entreprises/1/logo',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      data: form
    };

    console.log('📤 Envoi de la requête...');
    console.log('URL:', config.url);

    const response = await axios(config);

    console.log('✅ Succès!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ Erreur:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testUploadLogo();