import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Users, UserPlus, Filter, Download, Search, Eye, Edit,
  Check, X, Briefcase, DollarSign, Calendar, Mail,
  Phone, Building2, Sparkles, TrendingUp, AlertCircle,
  CheckCircle2, XCircle, FileText, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card, { StatCard, Badge } from '../../components/ui/Card';
import EmployeDetailsModal from '../../components/modals/EmployeDetailsModal';
import FormulaireAjoutEmploye from '../../components/modals/FormulaireAjoutEmploye';
import employeService from '../../services/employe.service';

const PremiumEmployesPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estActif: '',
    typeContrat: '',
    poste: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Charger les employés
  const loadEmployes = async () => {
    try {
      setLoading(true);
      const entrepriseId = user.entrepriseId || 1;
      const response = await employeService.getEmployes(entrepriseId);
      setEmployes(response.data);
      setFilteredEmployes(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  // Filtrage et recherche
  useEffect(() => {
    let result = [...employes];

    // Recherche
    if (searchTerm) {
      result = result.filter(emp =>
        `${emp.prenom} ${emp.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.codeEmploye.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtres
    if (filters.estActif !== '') {
      result = result.filter(emp => emp.estActif === (filters.estActif === 'true'));
    }
    if (filters.typeContrat) {
      result = result.filter(emp => emp.typeContrat === filters.typeContrat);
    }
    if (filters.poste) {
      result = result.filter(emp => emp.poste === filters.poste);
    }

    setFilteredEmployes(result);
  }, [searchTerm, filters, employes]);

  // Statistiques
  const stats = {
    total: employes.length,
    actifs: employes.filter(e => e.estActif).length,
    inactifs: employes.filter(e => !e.estActif).length,
    masseSalariale: employes
      .filter(e => e.estActif)
      .reduce((sum, e) => sum + (e.salaireBase || 0), 0)
  };

  // Postes uniques pour les filtres
  const uniquePostes = [...new Set(employes.map(emp => emp.poste))];

  // Gestion du statut
  const handleStatusChange = async (employe, activate) => {
    try {
      if (activate) {
        await employeService.activerEmploye(employe.id);
        toast.success(`✅ ${employe.prenom} ${employe.nom} activé`);
      } else {
        await employeService.desactiverEmploye(employe.id);
        toast.success(`❌ ${employe.prenom} ${employe.nom} désactivé`);
      }
      loadEmployes();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setConfirmAction(null);
    }
  };

  // Reset filtres
  const resetFilters = () => {
    setFilters({
      estActif: '',
      typeContrat: '',
      poste: ''
    });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Formater le salaire
  const formatSalaire = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                Gestion des Employés
                <Sparkles className="w-6 h-6 text-purple-600" />
              </h1>
              <p className="mt-2 text-base font-semibold text-gray-600 dark:text-gray-400">
                Gérez votre équipe et leurs informations
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <Button
                variant="outline"
                size="lg"
                icon={<Filter className="w-5 h-5" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              <Button variant="outline" size="lg" icon={<Download className="w-5 h-5" />}>
                Exporter
              </Button>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={() => navigate('/employes/ajouter')}
                >
                  Nouvel Employé
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Employés"
            value={stats.total}
            change={`${filteredEmployes.length} affichés`}
            trend="neutral"
            icon={<Users className="w-7 h-7" />}
            color="indigo"
          />
          <StatCard
            title="Actifs"
            value={stats.actifs}
            change={`${Math.round((stats.actifs / stats.total) * 100)}%`}
            trend="up"
            icon={<CheckCircle2 className="w-7 h-7" />}
            color="emerald"
          />
          <StatCard
            title="Inactifs"
            value={stats.inactifs}
            change={stats.inactifs > 0 ? "À vérifier" : "Tout est ok"}
            trend={stats.inactifs > 0 ? "down" : "up"}
            icon={<XCircle className="w-7 h-7" />}
            color="amber"
          />
          <StatCard
            title="Masse Salariale"
            value={formatSalaire(stats.masseSalariale)}
            change="Mensuelle"
            trend="up"
            icon={<DollarSign className="w-7 h-7" />}
            color="purple"
          />
        </motion.div>

        {/* Filtres Avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card variant="gradient" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={filters.estActif}
                      onChange={(e) => setFilters({ ...filters, estActif: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="">Tous</option>
                      <option value="true">Actifs</option>
                      <option value="false">Inactifs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Type de Contrat
                    </label>
                    <select
                      value={filters.typeContrat}
                      onChange={(e) => setFilters({ ...filters, typeContrat: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="">Tous</option>
                      <option value="FIXE">CDI</option>
                      <option value="HONORAIRE">Honoraire</option>
                      <option value="JOURNALIER">Journalier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Poste
                    </label>
                    <select
                      value={filters.poste}
                      onChange={(e) => setFilters({ ...filters, poste: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="">Tous</option>
                      {uniquePostes.map((poste, index) => (
                        <option key={index} value={poste}>{poste}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full"
                      icon={<X className="w-5 h-5" />}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Premium */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
          </div>
        ) : filteredEmployes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="gradient" className="p-16 text-center">
              <div className="inline-flex p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl mb-6">
                <Users className="w-20 h-20 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                Aucun employé trouvé
              </h2>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || filters.estActif || filters.typeContrat || filters.poste
                  ? "Aucun résultat ne correspond à vos critères de recherche"
                  : "Commencez par ajouter votre premier employé"}
              </p>
              {isAdmin && !searchTerm && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={() => navigate('/employes/ajouter')}
                >
                  Ajouter le Premier Employé
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="gradient" className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <Users className="w-7 h-7 text-indigo-600" />
                  Liste des Employés ({filteredEmployes.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Poste
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Contrat
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Salaire
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y-2 divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {filteredEmployes.map((employe, index) => (
                        <motion.tr
                          key={employe.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-extrabold text-gray-900 dark:text-white">
                              {employe.codeEmploye}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {employe.prenom} {employe.nom}
                                </div>
                                {employe.email && (
                                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {employe.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-base font-bold text-gray-900 dark:text-white">
                                {employe.poste}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                employe.typeContrat === 'FIXE' ? 'primary' :
                                employe.typeContrat === 'HONORAIRE' ? 'success' :
                                'warning'
                              }
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              {employe.typeContrat === 'FIXE' ? 'CDI' :
                               employe.typeContrat === 'HONORAIRE' ? 'Honoraire' :
                               'Journalier'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                {formatSalaire(employe.salaireBase || employe.tauxJournalier || 0)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={employe.estActif ? 'success' : 'danger'}>
                              {employe.estActif ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</>
                              ) : (
                                <><XCircle className="w-3 h-3 mr-1" /> Inactif</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedEmploye(employe);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                title="Voir détails"
                              >
                                <Eye className="w-5 h-5" />
                              </motion.button>
                              {isAdmin && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/employes/modifier/${employe.id}`)}
                                    className="p-2 text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                                    title="Modifier"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setConfirmAction({
                                      employe,
                                      action: employe.estActif ? 'desactiver' : 'activer'
                                    })}
                                    className={`p-2 rounded-lg transition-all ${
                                      employe.estActif
                                        ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                                        : 'text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                    }`}
                                    title={employe.estActif ? 'Désactiver' : 'Activer'}
                                  >
                                    {employe.estActif ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal Confirmation */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${
                  confirmAction.action === 'activer'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <AlertCircle className={`w-8 h-8 ${
                    confirmAction.action === 'activer' ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Confirmation
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Cette action nécessite votre confirmation
                  </p>
                </div>
              </div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-8">
                Êtes-vous sûr de vouloir {confirmAction.action === 'activer' ? 'activer' : 'désactiver'} l'employé{' '}
                <span className="font-extrabold text-gray-900 dark:text-white">
                  {confirmAction.employe.prenom} {confirmAction.employe.nom}
                </span> ?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction(null)}
                  className="flex-1"
                  icon={<X className="w-5 h-5" />}
                >
                  Annuler
                </Button>
                <Button
                  variant={confirmAction.action === 'activer' ? 'success' : 'danger'}
                  onClick={() => handleStatusChange(
                    confirmAction.employe,
                    confirmAction.action === 'activer'
                  )}
                  className="flex-1"
                  icon={<Check className="w-5 h-5" />}
                >
                  Confirmer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détails */}
      <EmployeDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEmploye(null);
        }}
        employe={selectedEmploye}
      />
    </div>
  );
};

export default PremiumEmployesPage;
