import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Info, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import autorisationService from '../../services/autorisation.service';

/**
 * Page de gestion des autorisations d'accès Super-Admin
 */
const GestionAutorisationsPage = () => {
  const { user, isAdmin } = useAuth();
  const entrepriseId = user?.entrepriseId;

  // États principaux
  const [etatAcces, setEtatAcces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger l'état actuel des autorisations
  const chargerEtatAcces = async () => {
    if (!entrepriseId) {
      setError('ID d\'entreprise manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await autorisationService.obtenirEtatAcces(entrepriseId);
      // Assurer que accesSuperAdminAutorise est booléen
      setEtatAcces({
        ...data,
        accesSuperAdminAutorise: !!data.accesSuperAdminAutorise,
      });
    } catch (err) {
      console.error('Erreur chargement autorisations:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Impossible de charger les autorisations'
      );
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    console.log('useEffect debug:', { isAdmin, entrepriseId, user });
    
    if (isAdmin && entrepriseId) {
      chargerEtatAcces();
    } else if (isAdmin && !entrepriseId) {
      setError('Utilisateur sans entreprise associée');
    }
  }, [isAdmin, entrepriseId]);

  // Mettre à jour l'autorisation
  const handleToggleAutorisation = async (nouvelleValeur) => {
    if (!entrepriseId) {
      setError('ID d\'entreprise manquant');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Mise à jour autorisation:', { entrepriseId, nouvelleValeur });
      
      const resultat = await autorisationService.mettreAJourAutorisation(
        entrepriseId, 
        nouvelleValeur
      );
      
      // Mettre à jour l'état local avec conversion booléenne
      setEtatAcces(prev => ({
        ...prev,
        accesSuperAdminAutorise: !!nouvelleValeur,
        derniereMiseAJour: new Date().toISOString()
      }));
      
      setSuccess(
        resultat.message || 
        (nouvelleValeur ? '✅ Accès Super-Admin autorisé' : '❌ Accès Super-Admin bloqué')
      );
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erreur mise à jour autorisation:', err);
      setError(
        err.response?.data?.message || 
        err.message ||
        'Erreur lors de la mise à jour des autorisations'
      );
    } finally {
      setSaving(false);
    }
  };

  // Vérification des permissions
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Restreint</h2>
            <p className="text-gray-600">
              Cette page est réservée aux administrateurs d'entreprise.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Autorisations
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Contrôlez l'accès des Super-Administrateurs aux données de votre entreprise
          </p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Chargement des autorisations...</p>
          </motion.div>
        ) : etatAcces ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            
            {/* Informations sur l'entreprise */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations Entreprise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nom de l'entreprise</span>
                  <p className="text-lg font-semibold text-gray-900">{etatAcces.nomEntreprise}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Dernière mise à jour</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(etatAcces.derniereMiseAJour).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle d'autorisation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ToggleSwitch
                enabled={etatAcces.accesSuperAdminAutorise}
                onChange={handleToggleAutorisation}
                loading={saving}
                label="Accès Super-Administrateur"
                enabledText="Autorisé"
                disabledText="Bloqué"
              />
            </motion.div>

            {/* Informations explicatives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-xl border border-blue-200 p-6"
            >
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    À propos des autorisations Super-Admin
                  </h3>
                  <div className="space-y-2 text-blue-800">
                    <p className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✅ Autorisé :</span>
                      Les Super-Administrateurs peuvent consulter et gérer les données de votre entreprise (employés, paie, pointages, etc.)
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">❌ Bloqué :</span>
                      Les Super-Administrateurs ne peuvent pas accéder aux données de votre entreprise
                    </p>
                    <p className="text-sm text-blue-700 mt-4 p-3 bg-blue-100 rounded-lg">
                      <strong>Note :</strong> Cette fonctionnalité vous permet de contrôler qui peut accéder aux informations sensibles de votre entreprise. Vous pouvez modifier ce paramètre à tout moment.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <button
                onClick={chargerEtatAcces}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </motion.div>

          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Données indisponibles</h2>
            <p className="text-gray-600 mb-4">
              Impossible de charger les informations d'autorisation.
            </p>
            <button
              onClick={chargerEtatAcces}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default GestionAutorisationsPage;