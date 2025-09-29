import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est authentifié au chargement
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    
    // Si on a des infos utilisateur en local storage, on les utilise d'abord
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    // Vérifier l'authentification avec le serveur (via cookies HTTP-only)
    const checkAuth = async () => {
      try {
        const response = await authService.checkAuthStatus();
        if (response.data.utilisateur) {
          setUser(response.data.utilisateur);
          localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
        }
      } catch (error) {
        // Si erreur d'auth (401), c'est normal si l'utilisateur n'est pas connecté
        // On ne fait rien de spécial, on nettoie simplement le state si nécessaire
        if (error.response && error.response.status === 401) {
          // L'utilisateur n'est pas authentifié, c'est un état normal
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Autre erreur réseau ou serveur
          console.error("Erreur lors de la vérification de l'authentification:", error);
        }
      } finally {
        // Dans tous les cas, on arrête le chargement
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, motDePasse) => {
    try {
      setLoading(true);
      const response = await authService.login(email, motDePasse);
      const { utilisateur: userData } = response.data;
      
      // Stocker uniquement les infos utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Mettre à jour le contexte
      setUser(userData);
      // Le token est géré par les cookies HTTP-only
      
      toast.success(`Bienvenue, ${userData.prenom} ${userData.nom}`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Appeler l'API pour supprimer le cookie côté serveur
      await authService.logout();
      // Supprimer les données locales
      localStorage.removeItem('user');
      setUser(null);
      toast.info('Vous avez été déconnecté');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
      // Même en cas d'erreur, on nettoie côté client
      localStorage.removeItem('user');
      setUser(null);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Valeurs à exposer dans le contexte
  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: user ? ['ADMIN', 'SUPER_ADMIN'].includes(user.role) : false,
    isCaissier: user ? user.role === 'CAISSIER' : false,
    isSuperAdmin: user ? user.role === 'SUPER_ADMIN' : false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};