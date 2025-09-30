import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true 
    });
    
    
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // On ne redirige vers login QUE si l'utilisateur était authentifié et que le token a expiré
        // pour les routes protégées, PAS pour les vérifications d'état d'auth
        if (error.response && error.response.status === 401) {
          // On vérifie si la requête n'est PAS /api/auth/me (vérification d'auth normale)
          const isAuthCheckRequest = error.config && (
            error.config.url === '/auth/me' || 
            error.config.url === '/auth/profil'
          );
          
          if (!isAuthCheckRequest) {
            // Si ce n'est pas une vérification d'auth, on nettoie et on redirige
            localStorage.removeItem('user');
            // On utilise history.push au lieu de window.location pour éviter un rafraîchissement complet
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  login(email, motDePasse) {
    console.log('Tentative de connexion avec:', { email });
    return this.axios.post('/auth/connexion', { email, motDePasse })
      .then(response => {
        console.log('Réponse de connexion:', response.data);
        // Le token est stocké dans un cookie HTTP-only par le serveur
        // On stocke uniquement les informations utilisateur dans localStorage si nécessaire
        if (response.data.utilisateur) {
          localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
        }
        return response;
      })
      .catch(error => {
        console.error('Erreur de connexion:', error.response?.data || error.message);
        throw error;
      });
  }
  
  // Déconnexion utilisateur
  logout() {
    return this.axios.post('/auth/deconnexion')
      .then(() => {
        // Supprimer uniquement les données utilisateur locales
        localStorage.removeItem('user');
        // Le cookie sera effacé par le serveur
      });
  }
  
  // Vérifier l'état de l'authentification
  checkAuthStatus() {
    return this.axios.get('/auth/me');
  }
}

const authService = new AuthService();
export default authService;