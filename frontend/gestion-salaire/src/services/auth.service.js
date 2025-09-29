import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // Nécessaire pour les cookies HTTP-only
    });
    
    // Nous n'avons plus besoin d'injecter le token manuellement car il est envoyé
    // automatiquement via les cookies HTTP-only pour chaque requête grâce à withCredentials: true
    
    // Intercepteur pour gérer les erreurs 401 (non autorisé)
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

  // Nous n'avons plus besoin de cette méthode car le token est géré via cookies HTTP-only
  setAuthToken() {
    // Cette méthode est conservée pour compatibilité mais ne fait plus rien
    // car les tokens sont gérés via cookies HTTP-only
  }

  // Effacer le token d'authentification (méthode maintenue pour compatibilité)
  clearAuthToken() {
    // Ne fait plus rien car les tokens sont gérés via cookies HTTP-only
    // Cette méthode est maintenue pour compatibilité avec le code existant
  }

  // Connexion utilisateur
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