import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, FileText, Check, Lock, Calendar,
  Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle,
  Building2, Filter, Download, Search, Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { StatCard, Badge } from '../components/ui/Card';
import CyclePaieModal from '../components/modals/CyclePaieModal';
import cyclePaieService from '../services/cyclePaie.service';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const CyclesPaiePage = () => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;
  const isAdmin = user?.role === 'ADMIN';

  const [cycles, setCycles] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtenir les noms des mois
  const getMoisName = (mois) => {
    const moisNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNames[mois - 1] || 'Inconnu';
  };

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Chargement des cycles de paie
        if (isAdmin) {
          // Si admin, charger toutes les entreprises
          const entreprisesResponse = await entrepriseService.getEntreprises();
          setEntreprises(entreprisesResponse.data);
          
          // Et tous les cycles de paie
          const cyclesResponse = await cyclePaieService.getCyclesPaie();
          setCycles(cyclesResponse.data);
        } else {
          // Si utilisateur normal, charger seulement les cycles de son entreprise
          const cyclesResponse = await cyclePaieService.getCyclesPaie(entrepriseId);
          setCycles(cyclesResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [entrepriseId, isAdmin]);

  // Ouvrir le modal pour ajouter un cycle
  const handleAddCycle = () => {
    setSelectedCycle(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier un cycle
  const handleEditCycle = (cycle) => {
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  // Supprimer un cycle
  const handleDeleteCycle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cycle de paie ?')) {
      try {
        await cyclePaieService.supprimerCycle(id);
        toast.success('Cycle de paie supprimé avec succès');
        // Mettre à jour la liste des cycles
        setCycles(cycles.filter(c => c.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du cycle:', error);
        toast.error('Impossible de supprimer ce cycle de paie');
      }
    }
  };

  // Générer les bulletins pour un cycle
  const handleGenererBulletins = async (id) => {
    try {
      await cyclePaieService.genererBulletins(id);
      toast.success('Les bulletins de paie ont été générés avec succès');
      // Mettre à jour le cycle dans la liste
      const updatedCycles = cycles.map(c => 
        c.id === id ? { ...c, bulletinsGeneres: true } : c
      );
      setCycles(updatedCycles);
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      toast.error('Impossible de générer les bulletins de paie');
    }
  };

  // Approuver un cycle
  const handleApprouverCycle = async (id) => {
    try {
      await cyclePaieService.approuverCycle(id);
      toast.success('Le cycle de paie a été approuvé avec succès');
      // Mettre à jour le cycle dans la liste
      const updatedCycles = cycles.map(c => 
        c.id === id ? { ...c, estApprouve: true } : c
      );
      setCycles(updatedCycles);
    } catch (error) {
      console.error('Erreur lors de l\'approbation du cycle:', error);
      toast.error('Impossible d\'approuver ce cycle de paie');
    }
  };

  // Clôturer un cycle
  const handleCloturerCycle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer ce cycle de paie ? Cette action est irréversible.')) {
      try {
        await cyclePaieService.cloturerCycle(id);
        toast.success('Le cycle de paie a été clôturé avec succès');
        // Mettre à jour le cycle dans la liste
        const updatedCycles = cycles.map(c => 
          c.id === id ? { ...c, estCloture: true } : c
        );
        setCycles(updatedCycles);
      } catch (error) {
        console.error('Erreur lors de la clôture du cycle:', error);
        toast.error('Impossible de clôturer ce cycle de paie');
      }
    }
  };

  // Après une action réussie (création ou modification)
  const handleSuccess = async () => {
    try {
      // Recharger la liste des cycles
      const response = isAdmin 
        ? await cyclePaieService.getCyclesPaie()
        : await cyclePaieService.getCyclesPaie(entrepriseId);
      setCycles(response.data);
    } catch (error) {
      console.error('Erreur lors du rechargement des cycles:', error);
    }
  };

  // Trouver le nom de l'entreprise pour un cycle
  const getEntrepriseName = (entrepriseId) => {
    const entreprise = entreprises.find(e => e.id === entrepriseId);
    return entreprise ? entreprise.nom : 'Inconnue';
  };

  // Calculer les statistiques
  const stats = {
    total: cycles.length,
    enCours: cycles.filter(c => !c.estCloture && !c.estApprouve).length,
    approuves: cycles.filter(c => c.estApprouve && !c.estCloture).length,
    clotures: cycles.filter(c => c.estCloture).length
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
                <Calendar className="w-8 h-8 text-indigo-600" />
                Gestion des Cycles de Paie
                <Sparkles className="w-6 h-6 text-purple-600" />
              </h1>
              <p className="mt-2 text-base font-semibold text-gray-600 dark:text-gray-400">
                Gérez vos cycles de paie, générez et approuvez les bulletins
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" icon={<Search className="w-5 h-5" />}>
                Rechercher
              </Button>
              <Button variant="outline" size="lg" icon={<Filter className="w-5 h-5" />}>
                Filtrer
              </Button>
              <Button 
                onClick={handleAddCycle}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                Nouveau Cycle
              </Button>
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
            title="Total Cycles"
            value={stats.total}
            change="Tous les cycles"
            trend="neutral"
            icon={<Calendar className="w-7 h-7" />}
            color="indigo"
          />
          <StatCard
            title="En Cours"
            value={stats.enCours}
            change="Non approuvés"
            trend="neutral"
            icon={<Clock className="w-7 h-7" />}
            color="amber"
          />
          <StatCard
            title="Approuvés"
            value={stats.approuves}
            change="En attente clôture"
            trend="up"
            icon={<CheckCircle2 className="w-7 h-7" />}
            color="emerald"
          />
          <StatCard
            title="Clôturés"
            value={stats.clotures}
            change="Finalisés"
            trend="up"
            icon={<Lock className="w-7 h-7" />}
            color="purple"
          />
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
          </div>
        ) : cycles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="gradient" className="p-16 text-center">
              <div className="inline-flex p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl mb-6">
                <Calendar className="w-20 h-20 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                Aucun cycle de paie
              </h2>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Commencez par créer votre premier cycle de paie pour gérer les salaires de vos employés
              </p>
              <Button 
                onClick={handleAddCycle}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                Créer le Premier Cycle
              </Button>
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
                  <Calendar className="w-7 h-7 text-indigo-600" />
                  Liste des Cycles
                </h2>
                <Button variant="outline" size="lg" icon={<Download className="w-5 h-5" />}>
                  Exporter
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Période
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Entreprise
                        </th>
                      )}
                      <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Dates
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
                      {cycles.map((cycle, index) => (
                        <motion.tr
                          key={cycle.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                  {getMoisName(cycle.mois)} {cycle.annee}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                  {getEntrepriseName(cycle.entrepriseId)}
                                </span>
                              </div>
                            </td>
                          )}
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Du {formatDate(cycle.dateDebut)} au {formatDate(cycle.dateFin)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cycle.estCloture ? (
                              <Badge variant="default">
                                <Lock className="w-3 h-3 mr-1" />
                                Clôturé
                              </Badge>
                            ) : cycle.estApprouve ? (
                              <Badge variant="success">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Approuvé
                              </Badge>
                            ) : cycle.bulletinsGeneres ? (
                              <Badge variant="primary">
                                <FileText className="w-3 h-3 mr-1" />
                                Bulletins générés
                              </Badge>
                            ) : (
                              <Badge variant="warning">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {!cycle.estCloture && !cycle.estApprouve && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditCycle(cycle)}
                                  className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                  title="Modifier"
                                >
                                  <Edit className="w-5 h-5" />
                                </motion.button>
                              )}
                              
                              {!cycle.bulletinsGeneres && !cycle.estCloture && !cycle.estApprouve && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteCycle(cycle.id)}
                                  className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </motion.button>
                              )}
                              
                              {!cycle.bulletinsGeneres && !cycle.estCloture && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleGenererBulletins(cycle.id)}
                                  className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                                  title="Générer les bulletins"
                                >
                                  <FileText className="w-5 h-5" />
                                </motion.button>
                              )}
                              
                              {cycle.bulletinsGeneres && !cycle.estApprouve && !cycle.estCloture && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleApprouverCycle(cycle.id)}
                                  className="p-2 text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                                  title="Approuver"
                                >
                                  <Check className="w-5 h-5" />
                                </motion.button>
                              )}
                              
                              {cycle.estApprouve && !cycle.estCloture && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCloturerCycle(cycle.id)}
                                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-all"
                                  title="Clôturer"
                                >
                                  <Lock className="w-5 h-5" />
                                </motion.button>
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

      {/* Modal pour ajouter/éditer un cycle */}
      <CyclePaieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cyclePaie={selectedCycle}
        entreprises={entreprises}
        isAdmin={isAdmin}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CyclesPaiePage;