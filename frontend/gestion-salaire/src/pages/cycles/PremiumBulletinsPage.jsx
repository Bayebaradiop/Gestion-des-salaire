import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Card, { StatCard, Badge } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import cyclePaieService from '../../services/cyclePaie.service';
import { 
  ArrowLeft, FileText, Download, DollarSign, Users, CheckCircle2, 
  Clock, AlertTriangle, Eye, Printer, CreditCard, Calendar, 
  Sparkles, TrendingUp, Filter, Search, X, ChevronDown, 
  AlertCircle, Banknote, Wallet, Receipt
} from 'lucide-react';

const PremiumBulletinsPage = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { user, isCaissier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [filteredBulletins, setFilteredBulletins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statutFilter, setStatutFilter] = useState('');
  const [paiementForm, setPaiementForm] = useState({
    montant: '',
    datePaiement: new Date().toISOString().split('T')[0],
    methodePaiement: 'ESPECES',
    referenceTransaction: '',
    numeroRecu: '',
    commentaire: ''
  });

  const loadBulletins = async () => {
    try {
      setLoading(true);
      const response = await cyclePaieService.getBulletinsCycle(cycleId);
      setBulletins(response.data);
      setFilteredBulletins(response.data);
      
      // Charger les informations du cycle
      try {
        setCycle({
          id: cycleId,
          nom: `Cycle de Paie ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          statut: 'APPROUVE',
          mois: new Date().getMonth() + 1,
          annee: new Date().getFullYear()
        });
      } catch (error) {
        console.error('Erreur lors du chargement des infos du cycle:', error);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des bulletins');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBulletins();
  }, [cycleId]);

  // Filtrage et recherche
  useEffect(() => {
    let filtered = [...bulletins];

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(b =>
        `${b.employe?.prenom} ${b.employe?.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.employe?.poste?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statutFilter) {
      filtered = filtered.filter(b => {
        const { status } = getStatutPaiement(b);
        return status === statutFilter;
      });
    }

    setFilteredBulletins(filtered);
  }, [searchTerm, statutFilter, bulletins]);

  // Calcul des statistiques
  const stats = {
    total: bulletins.length,
    payes: bulletins.filter(b => getStatutPaiement(b).status === 'PAYE').length,
    enAttente: bulletins.filter(b => getStatutPaiement(b).status === 'EN_ATTENTE').length,
    partiels: bulletins.filter(b => getStatutPaiement(b).status === 'PARTIEL').length,
    montantTotal: bulletins.reduce((sum, b) => sum + (b.montantNet || 0), 0),
    montantPaye: bulletins.reduce((sum, b) => sum + (b.totalPaye || 0), 0),
    montantRestant: bulletins.reduce((sum, b) => sum + (b.restantAPayer || 0), 0)
  };

  const handleShowPaiementModal = (bulletin) => {
    setSelectedBulletin(bulletin);
    setPaiementForm({
      ...paiementForm,
      montant: bulletin.restantAPayer || bulletin.montantNet
    });
    setShowPaiementModal(true);
  };

  const handlePaiementFormChange = (e) => {
    const { name, value } = e.target;
    setPaiementForm({
      ...paiementForm,
      [name]: value
    });
  };

  const handleEnregistrerPaiement = async (e) => {
    e.preventDefault();
    if (!selectedBulletin) return;
    
    try {
      setLoading(true);
      await cyclePaieService.enregistrerPaiement(selectedBulletin.id, paiementForm);
      toast.success('Paiement enregistré avec succès');
      setShowPaiementModal(false);
      loadBulletins();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour formater les montants en devise
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour déterminer le statut de paiement d'un bulletin
  const getStatutPaiement = (bulletin) => {
    const totalPaye = bulletin.totalPaye || 0;
    const montantNet = bulletin.montantNet || 0;
    
    if (totalPaye === 0) return { status: 'EN_ATTENTE', label: 'En attente', variant: 'danger' };
    if (totalPaye < montantNet) return { status: 'PARTIEL', label: 'Partiel', variant: 'warning' };
    return { status: 'PAYE', label: 'Payé', variant: 'success' };
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatutFilter('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Premium Header Sticky */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b-2 border-indigo-100 dark:border-gray-800 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cycles')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  Bulletins de Paie
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cycle?.nom || 'Gestion des bulletins de paie du cycle'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  showFilters 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtres
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`/api/cycles/${cycleId}/bulletins/pdf`)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </motion.button>
            </div>
          </div>

          {/* Filtres Collapsibles */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Statut de Paiement
                    </label>
                    <select
                      value={statutFilter}
                      onChange={(e) => setStatutFilter(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Tous</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="PARTIEL">Partiel</option>
                      <option value="PAYE">Payé</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* StatCards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Bulletins"
            value={stats.total}
            change={`${filteredBulletins.length} affichés`}
            trend="neutral"
            icon={<FileText className="w-7 h-7" />}
            color="indigo"
          />
          <StatCard
            title="Payés"
            value={stats.payes}
            change={`${((stats.payes / stats.total) * 100 || 0).toFixed(1)}%`}
            trend="up"
            icon={<CheckCircle2 className="w-7 h-7" />}
            color="emerald"
          />
          <StatCard
            title="En Attente"
            value={stats.enAttente}
            change={stats.partiels > 0 ? `${stats.partiels} partiels` : 'Aucun partiel'}
            trend={stats.enAttente > 0 ? "down" : "neutral"}
            icon={<Clock className="w-7 h-7" />}
            color="amber"
          />
          <StatCard
            title="Montant Total"
            value={formatMontant(stats.montantTotal)}
            change={`Reste: ${formatMontant(stats.montantRestant)}`}
            trend={stats.montantRestant > 0 ? "down" : "up"}
            icon={<DollarSign className="w-7 h-7" />}
            color="purple"
          />
        </motion.div>

        {/* Infos Cycle */}
        {cycle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Période
                      </h3>
                      <div className="text-base font-extrabold text-gray-900 dark:text-white">
                        {cycle.titre || cycle.nom}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {cycle.periode || `${cycle.mois}/${cycle.annee}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Statistiques
                      </h3>
                      <div className="text-base font-extrabold text-gray-900 dark:text-white">
                        {stats.total} bulletins
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.payes} payés • {stats.enAttente} en attente
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center gap-3">
                    <Badge 
                      variant={
                        cycle.statut === 'BROUILLON' ? 'default' : 
                        cycle.statut === 'APPROUVE' ? 'primary' : 
                        'success'
                      }
                      className="text-base px-4 py-2"
                    >
                      {cycle.statut === 'BROUILLON' && <FileText className="w-4 h-4 mr-2" />}
                      {cycle.statut === 'APPROUVE' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {cycle.statut === 'CLOTURE' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {cycle.statut === 'BROUILLON' ? 'Brouillon' :
                       cycle.statut === 'APPROUVE' ? 'Approuvé' : 'Clôturé'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Table Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">
                  Chargement des bulletins...
                </p>
              </div>
            ) : filteredBulletins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Aucun bulletin trouvé
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statutFilter 
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Générez des bulletins pour ce cycle"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Montants
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Paiement
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {filteredBulletins.map((bulletin, index) => {
                        const { status, label, variant } = getStatutPaiement(bulletin);
                        
                        return (
                          <motion.tr
                            key={bulletin.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                  {bulletin.employe?.prenom?.charAt(0)}{bulletin.employe?.nom?.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-base font-bold text-gray-900 dark:text-white">
                                    {bulletin.employe?.prenom} {bulletin.employe?.nom}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="w-3 h-3" />
                                    {bulletin.employe?.poste}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {formatMontant(bulletin.montantNet)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Brut: {formatMontant(bulletin.montantBrut)}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <Badge variant={variant}>
                                  {status === 'PAYE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {status === 'EN_ATTENTE' && <Clock className="w-3 h-3 mr-1" />}
                                  {status === 'PARTIEL' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  {label}
                                </Badge>
                                {status === 'PARTIEL' && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">{formatMontant(bulletin.totalPaye || 0)}</span> / {formatMontant(bulletin.montantNet)}
                                  </div>
                                )}
                                {bulletin.restantAPayer > 0 && (
                                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                    Reste: {formatMontant(bulletin.restantAPayer)}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => navigate(`/bulletins/${bulletin.id}`)}
                                  className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-5 h-5" />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => window.open(`/bulletins/${bulletin.id}/pdf`)}
                                  className="p-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                                  title="Télécharger PDF"
                                >
                                  <Printer className="w-5 h-5" />
                                </motion.button>

                                {isCaissier && status !== 'PAYE' && cycle?.statut === 'APPROUVE' && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleShowPaiementModal(bulletin)}
                                    className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
                                    title="Enregistrer un paiement"
                                  >
                                    <CreditCard className="w-5 h-5" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Modal Paiement Premium */}
      <AnimatePresence>
        {showPaiementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaiementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-800"
            >
              {/* Header Modal */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 border-b-2 border-emerald-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                      Enregistrer un Paiement
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPaiementModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content Modal */}
              <form onSubmit={handleEnregistrerPaiement} className="p-6 space-y-6">
                {/* Info Bulletin */}
                {selectedBulletin && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border-2 border-indigo-200 dark:border-gray-600">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                        {selectedBulletin.employe?.prenom?.charAt(0)}{selectedBulletin.employe?.nom?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                          {selectedBulletin.employe?.prenom} {selectedBulletin.employe?.nom}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedBulletin.employe?.poste}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Montant Total
                        </p>
                        <p className="text-base font-extrabold text-gray-900 dark:text-white">
                          {formatMontant(selectedBulletin.montantNet)}
                        </p>
                      </div>
                      {selectedBulletin.totalPaye > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Déjà Payé
                          </p>
                          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatMontant(selectedBulletin.totalPaye)}
                          </p>
                        </div>
                      )}
                      {selectedBulletin.restantAPayer > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Restant à Payer
                          </p>
                          <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                            {formatMontant(selectedBulletin.restantAPayer)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Montant *
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={paiementForm.montant}
                      onChange={handlePaiementFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                      disabled={cycle?.statut !== 'APPROUVE'}
                      required
                    />
                    {cycle?.statut !== 'APPROUVE' && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Le cycle doit être approuvé
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date de Paiement *
                    </label>
                    <input
                      type="date"
                      name="datePaiement"
                      value={paiementForm.datePaiement}
                      onChange={handlePaiementFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                      disabled={cycle?.statut !== 'APPROUVE'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Wallet className="w-4 h-4 inline mr-1" />
                      Méthode de Paiement *
                    </label>
                    <select
                      name="methodePaiement"
                      value={paiementForm.methodePaiement}
                      onChange={handlePaiementFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                      disabled={cycle?.statut !== 'APPROUVE'}
                      required
                    >
                      <option value="ESPECES">💵 Espèces</option>
                      <option value="VIREMENT">🏦 Virement bancaire</option>
                      <option value="CHEQUE">📝 Chèque</option>
                      <option value="MOBILE_MONEY">📱 Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Banknote className="w-4 h-4 inline mr-1" />
                      Référence Transaction
                    </label>
                    <input
                      type="text"
                      name="referenceTransaction"
                      value={paiementForm.referenceTransaction}
                      onChange={handlePaiementFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Ex: VIREMENT-12345"
                      disabled={cycle?.statut !== 'APPROUVE'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Receipt className="w-4 h-4 inline mr-1" />
                      Numéro de Reçu
                    </label>
                    <input
                      type="text"
                      name="numeroRecu"
                      value={paiementForm.numeroRecu}
                      onChange={handlePaiementFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Ex: RECU-001"
                      disabled={cycle?.statut !== 'APPROUVE'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Commentaire
                  </label>
                  <textarea
                    name="commentaire"
                    value={paiementForm.commentaire}
                    onChange={handlePaiementFormChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    placeholder="Commentaire optionnel..."
                  ></textarea>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaiementModal(false)}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-semibold"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || cycle?.statut !== 'APPROUVE'}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all font-bold flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirmer le Paiement
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumBulletinsPage;
