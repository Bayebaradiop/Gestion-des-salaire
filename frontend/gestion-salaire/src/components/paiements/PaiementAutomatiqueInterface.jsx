import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
  Play,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import paiementAutomatiqueService from '../../services/paiementAutomatique.service';
import cyclePaieService from '../../services/cyclePaie.service';

/**
 * Composant pour la génération automatique des paiements basés sur les pointages
 */
const PaiementAutomatiqueInterface = () => {
  const { user, isAdmin } = useAuth();
  const entrepriseId = user?.entrepriseId;

  // États principaux
  const [etapeActive, setEtapeActive] = useState('configuration');
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState([]);

  // Configuration
  const [configuration, setConfiguration] = useState({
    cyclePaieId: '',
    dateDebut: '',
    dateFin: ''
  });

  // Résultats
  const [validation, setValidation] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [resultatGeneration, setResultatGeneration] = useState(null);

  // Messages
  const [message, setMessage] = useState({ type: '', contenu: '' });

  // Charger les cycles de paie au montage
  useEffect(() => {
    const chargerCycles = async () => {
      if (!entrepriseId) return;
      
      try {
        const cyclesData = await cyclePaieService.listerParEntreprise(entrepriseId);
        setCycles(cyclesData.filter(c => c.statut === 'BROUILLON'));
      } catch (error) {
        console.error('Erreur chargement cycles:', error);
        afficherMessage('error', 'Erreur lors du chargement des cycles de paie');
      }
    };

    chargerCycles();
  }, [entrepriseId]);

  // Initialiser les dates par défaut (mois en cours)
  useEffect(() => {
    const maintenant = new Date();
    const premierJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const dernierJour = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);

    setConfiguration(prev => ({
      ...prev,
      dateDebut: premierJour.toISOString().split('T')[0],
      dateFin: dernierJour.toISOString().split('T')[0]
    }));
  }, []);

  const afficherMessage = (type, contenu) => {
    setMessage({ type, contenu });
    setTimeout(() => setMessage({ type: '', contenu: '' }), 5000);
  };

  const validerConfiguration = () => {
    const erreurs = [];

    if (!configuration.cyclePaieId) {
      erreurs.push('Veuillez sélectionner un cycle de paie');
    }
    if (!configuration.dateDebut) {
      erreurs.push('Veuillez indiquer la date de début');
    }
    if (!configuration.dateFin) {
      erreurs.push('Veuillez indiquer la date de fin');
    }

    if (erreurs.length === 0) {
      const validationPeriode = paiementAutomatiqueService.validerPeriode(
        configuration.dateDebut,
        configuration.dateFin
      );
      
      if (!validationPeriode.valide) {
        erreurs.push(...validationPeriode.erreurs);
      }
    }

    return erreurs;
  };

  const handleValiderPointages = async () => {
    const erreurs = validerConfiguration();
    if (erreurs.length > 0) {
      afficherMessage('error', erreurs.join(', '));
      return;
    }

    setLoading(true);
    try {
      const response = await paiementAutomatiqueService.validerPointages(
        entrepriseId,
        configuration.dateDebut,
        configuration.dateFin
      );

      setValidation(response.data);
      
      if (response.data.valide) {
        setEtapeActive('apercu');
        afficherMessage('success', 'Validation réussie, passage à l\'aperçu');
      } else {
        afficherMessage('warning', `${response.data.erreurs.length} erreur(s) trouvée(s)`);
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      afficherMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleObtenirApercu = async () => {
    setLoading(true);
    try {
      const response = await paiementAutomatiqueService.obtenirApercuCalculs(
        entrepriseId,
        configuration.dateDebut,
        configuration.dateFin
      );

      setApercu(response.data.apercu);
      setValidation(response.data.validation);
      afficherMessage('success', 'Aperçu généré avec succès');
    } catch (error) {
      console.error('Erreur aperçu:', error);
      afficherMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenererBulletins = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir générer les bulletins automatiquement ? Cette action ne peut pas être annulée.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await paiementAutomatiqueService.genererBulletinsAutomatiques(
        entrepriseId,
        parseInt(configuration.cyclePaieId),
        configuration.dateDebut,
        configuration.dateFin
      );

      setResultatGeneration(response.data);
      setEtapeActive('resultat');
      afficherMessage('success', response.data.message);
    } catch (error) {
      console.error('Erreur génération:', error);
      afficherMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const reinitialiser = () => {
    setEtapeActive('configuration');
    setValidation(null);
    setApercu(null);
    setResultatGeneration(null);
    setMessage({ type: '', contenu: '' });
  };

  // Composant pour les étapes
  const EtapeIndicator = ({ etape, active, complete, children }) => (
    <div className={`flex items-center ${active ? 'text-indigo-600' : complete ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
        active ? 'border-indigo-600 bg-indigo-50' : 
        complete ? 'border-green-600 bg-green-50' : 
        'border-gray-300'
      }`}>
        {complete ? <CheckCircle2 className="w-5 h-5" /> : etape}
      </div>
      <span className="font-medium">{children}</span>
    </div>
  );

  // Composant StatCard
  const StatCard = ({ icon: Icon, label, value, subValue, color = 'blue' }) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      orange: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subValue && (
                <p className="text-xs text-gray-500 mt-1">{subValue}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder au paiement automatique.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-indigo-600" />
            Paiement Automatique
          </h1>
          <p className="text-gray-600">
            Génération automatique des bulletins de paie basée sur les pointages
          </p>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {message.contenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border ${
                message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                message.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.contenu}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateurs d'étapes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <EtapeIndicator 
              etape="1" 
              active={etapeActive === 'configuration'} 
              complete={etapeActive !== 'configuration'}
            >
              Configuration
            </EtapeIndicator>
            <div className="flex-1 border-t border-gray-300 mx-4"></div>
            <EtapeIndicator 
              etape="2" 
              active={etapeActive === 'apercu'} 
              complete={etapeActive === 'resultat'}
            >
              Aperçu
            </EtapeIndicator>
            <div className="flex-1 border-t border-gray-300 mx-4"></div>
            <EtapeIndicator 
              etape="3" 
              active={etapeActive === 'resultat'} 
              complete={false}
            >
              Génération
            </EtapeIndicator>
          </div>
        </div>

        {/* Étape 1: Configuration */}
        {etapeActive === 'configuration' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Configuration de la période
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle de paie *
                </label>
                <select
                  value={configuration.cyclePaieId}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, cyclePaieId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner un cycle</option>
                  {cycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.titre} ({cycle.periode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={configuration.dateDebut}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, dateDebut: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={configuration.dateFin}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, dateFin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {configuration.dateDebut && configuration.dateFin && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    Période sélectionnée: {paiementAutomatiqueService.formatPeriode(configuration.dateDebut, configuration.dateFin)}
                  </span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {paiementAutomatiqueService.calculerJoursOuvres(configuration.dateDebut, configuration.dateFin)} jours ouvrés
                </p>
              </div>
            )}

            {/* Validation des pointages */}
            {validation && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-gray-900">Résultat de la validation</h3>
                
                {validation.erreurs.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">Erreurs trouvées</span>
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                      {validation.erreurs.map((erreur, index) => (
                        <li key={index}>• {erreur}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.avertissements.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Avertissements</span>
                    </div>
                    <ul className="text-sm text-amber-600 space-y-1">
                      {validation.avertissements.map((avertissement, index) => (
                        <li key={index}>• {avertissement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.valide && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Validation réussie</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleValiderPointages}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Valider les pointages
              </button>
              
              {validation?.valide && (
                <button
                  onClick={() => { handleObtenirApercu(); setEtapeActive('apercu'); }}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Voir l'aperçu
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Étape 2: Aperçu */}
        {etapeActive === 'apercu' && apercu && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                label="Employés"
                value={apercu.resume.totalEmployes}
                color="blue"
              />
              <StatCard
                icon={DollarSign}
                label="Salaire Brut Total"
                value={paiementAutomatiqueService.formatMontant(apercu.resume.totalSalaireBrut)}
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Salaire Net Total"
                value={paiementAutomatiqueService.formatMontant(apercu.resume.totalSalaireNet)}
                color="purple"
              />
              <StatCard
                icon={Clock}
                label="Jours Travaillés"
                value={apercu.resume.totalJoursTravailes}
                subValue={`${apercu.resume.totalHeuresTravailes}h au total`}
                color="orange"
              />
            </div>

            {/* Détails par employé */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Détail par employé</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calculé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apercu.calculs.map((calcul, index) => {
                      const employe = apercu.employes.find(e => e.id === calcul.employeId);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employe ? `${employe.prenom} ${employe.nom}` : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employe?.codeEmploye}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${paiementAutomatiqueService.getTypeContratColor(calcul.typeContrat)}-100 text-${paiementAutomatiqueService.getTypeContratColor(calcul.typeContrat)}-800`}>
                              {paiementAutomatiqueService.getTypeContratLabel(calcul.typeContrat)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paiementAutomatiqueService.formatMontant(calcul.salaireBase)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paiementAutomatiqueService.formatMontant(calcul.salaireBrut)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {paiementAutomatiqueService.formatMontant(calcul.salaireNet)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {calcul.joursTravailes && `${calcul.joursTravailes}j`}
                            {calcul.heuresTravailes && ` ${calcul.heuresTravailes}h`}
                            {calcul.joursAbsents > 0 && ` (-${calcul.joursAbsents}j abs.)`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapeActive('configuration')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Retour
              </button>
              
              <button
                onClick={handleGenererBulletins}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Générer les bulletins
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Résultat */}
        {etapeActive === 'resultat' && resultatGeneration && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Génération réussie !</h2>
            <p className="text-gray-600 mb-6">{resultatGeneration.message}</p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{resultatGeneration.bulletins} bulletins générés</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={reinitialiser}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Nouvelle génération
              </button>
              
              <button
                onClick={() => window.location.href = '/cycles-paie'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Voir les bulletins
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PaiementAutomatiqueInterface;