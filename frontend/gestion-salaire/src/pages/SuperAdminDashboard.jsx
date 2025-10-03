import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, TrendingUp, FileText, Plus, Trash2, Settings,
  Eye, Play, Pause, AlertTriangle, History, Shield, Calendar,
  CreditCard, Sparkles, Activity, BarChart3, PieChart as PieChartIcon,
  Search, Filter, Download, RefreshCw, ChevronRight, Lock, Unlock
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Button, Card, StatCard } from '../components/ui/PremiumComponents';
import EntrepriseLogo from '../components/ui/EntrepriseLogo';
import EntrepriseModal from '../components/modals/EntrepriseModal';
import entrepriseService from '../services/entreprise.service';
import dashboardService from '../services/dashboard.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entreprises, setEntreprises] = useState([]);
  const [stats, setStats] = useState({
    totalEntreprises: 0,
    totalUtilisateurs: 0,
    totalEmployes: 0,
    masseSalarialeTotale: 0,
    montantTotalPaye: 0,
    montantTotalRestant: 0,
    totalBulletins: 0
  });
  const [chartData, setChartData] = useState({
    evolution: [],
    repartition: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch enterprises list
        const entreprisesResponse = await entrepriseService.getEntreprises();
        const entreprisesData = entreprisesResponse.data;
        setEntreprises(entreprisesData);

        // Fetch global dashboard data
        const globalDataResponse = await dashboardService.getGlobalDashboardData();
        const { stats: globalStats, evolution, repartition } = globalDataResponse.data;

        setStats({
          totalEntreprises: globalStats.totalEntreprises,
          totalUtilisateurs: globalStats.totalEmployesActifs, // Using active employees as total users
          totalEmployes: globalStats.totalEmployesActifs,
          masseSalarialeTotale: globalStats.masseSalarialeTotale,
          montantTotalPaye: globalStats.montantTotalPaye,
          montantTotalRestant: globalStats.montantTotalRestant,
          totalBulletins: globalStats.totalBulletinsGeneres
        });

        setChartData({
          evolution,
          repartition
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données du dashboard');

        // Fallback to basic enterprise data if global stats fail
        try {
          const response = await entrepriseService.getEntreprises();
          const entreprisesData = response.data;
          setEntreprises(entreprisesData);

          const totalEntreprises = entreprisesData.length;
          const totalEmployes = entreprisesData.reduce((sum, e) => sum + (e.nombreEmployesActifs || 0), 0);

          setStats(prev => ({
            ...prev,
            totalEntreprises,
            totalEmployes,
            totalUtilisateurs: totalEmployes
          }));
        } catch (fallbackError) {
          console.error('Erreur lors du chargement des données de fallback:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Actions pour les entreprises
  const handleAddEntreprise = () => {
    setSelectedEntreprise(null);
    setIsModalOpen(true);
  };

  const handleEditEntreprise = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setIsModalOpen(true);
  };

  const handleDeleteEntreprise = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      try {
        await entrepriseService.supprimerEntreprise(id);
        toast.success('Entreprise supprimée avec succès');
        setEntreprises(entreprises.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer l\'entreprise');
      }
    }
  };

  const handleManageEntreprise = (entrepriseId) => {
    navigate(`/super-admin/entreprises/${entrepriseId}`);
  };

  const handleToggleEntrepriseStatus = async (entreprise) => {
    try {
      await entrepriseService.toggleStatutEntreprise(entreprise.id);
      toast.success(`Entreprise ${entreprise.estActif ? 'suspendue' : 'activée'} avec succès`);
      // Recharger les données
      const response = await entrepriseService.getEntreprises();
      setEntreprises(response.data);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Impossible de changer le statut de l\'entreprise');
    }
  };

  const handleSuccess = async () => {
    try {
      const response = await entrepriseService.getEntreprises();
      setEntreprises(response.data);
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    }
  };

  // Vérifier que l'utilisateur est SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex p-6 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6">
            <Shield className="w-20 h-20 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Accès Refusé</h2>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Vous devez être Super Administrateur pour accéder à cette page.</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  Super Admin
                  <Sparkles className="w-7 h-7 text-indigo-600" />
                </h1>
                <p className="text-base font-bold text-gray-600 dark:text-gray-400 mt-1">Gestion globale des entreprises et salaires</p>
              </div>
            </div>
            <Button
              onClick={handleAddEntreprise}
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
            >
              Nouvelle Entreprise
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl p-2 shadow-lg border-2 border-gray-200 dark:border-gray-800">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                { id: 'companies', label: 'Entreprises', icon: Building2 },
                { id: 'admins', label: 'Administrateurs', icon: Shield },
                { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
                { id: 'logs', label: 'Logs', icon: History }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Premium Key Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Entreprises"
                  value={stats.totalEntreprises}
                  change="+12% ce mois"
                  trend="up"
                  icon={<Building2 className="w-7 h-7" />}
                  color="indigo"
                />
                <StatCard
                  title="Employés Actifs"
                  value={stats.totalEmployes}
                  change="+8% ce mois"
                  trend="up"
                  icon={<Users className="w-7 h-7" />}
                  color="emerald"
                />
                <StatCard
                  title="Masse Salariale"
                  value={`${stats.masseSalarialeTotale.toLocaleString()} XOF`}
                  change="+15% ce mois"
                  trend="up"
                  icon={<TrendingUp className="w-7 h-7" />}
                  color="purple"
                />
                <StatCard
                  title="Bulletins"
                  value={stats.totalBulletins}
                  change={`${stats.totalBulletins} générés`}
                  trend="neutral"
                  icon={<FileText className="w-7 h-7" />}
                  color="amber"
                />
              </div>

              {/* Premium Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary Evolution Chart */}
                <Card variant="gradient" className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                      <BarChart3 className="w-7 h-7 text-indigo-600" />
                      Évolution de la Masse Salariale
                    </h3>
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                      Suivi mensuel des salaires
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.evolution}>
                      <defs>
                        <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeWidth={1.5} />
                      <XAxis 
                        dataKey="mois"
                        stroke="#374151"
                        style={{ fontSize: '14px', fontWeight: '700' }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        stroke="#374151"
                        style={{ fontSize: '14px', fontWeight: '700' }}
                      />
                      <Tooltip
                        formatter={(value) => [new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          minimumFractionDigits: 0
                        }).format(value), 'Masse Salariale']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '12px',
                          fontWeight: '700'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="montant"
                        name="Masse salariale"
                        stroke="#6366f1"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorMontant)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Employee Distribution */}
                <Card variant="gradient" className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                      <PieChartIcon className="w-7 h-7 text-emerald-600" />
                      Répartition des Employés
                    </h3>
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                      Par entreprise
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.repartition}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ nom, employesActifs }) => `${nom}: ${employesActifs}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="employesActifs"
                        strokeWidth={3}
                        stroke="#ffffff"
                      >
                        {chartData.repartition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Employés actifs']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '12px',
                          fontWeight: '700'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Payment Comparison */}
              <Card variant="gradient" className="p-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <CreditCard className="w-7 h-7 text-purple-600" />
                  Comparaison des Paiements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">
                      {stats.montantTotalPaye.toLocaleString()} <span className="text-2xl">XOF</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Montant Payé</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border-2 border-red-200 dark:border-red-800"
                  >
                    <div className="text-5xl font-extrabold text-red-600 dark:text-red-400 mb-3">
                      {stats.montantTotalRestant.toLocaleString()} <span className="text-2xl">XOF</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Montant Restant</p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'companies' && (
            <motion.div
              key="companies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="gradient" className="overflow-hidden">
                <div className="px-8 py-6 border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                      <Building2 className="w-7 h-7 text-indigo-600" />
                      Gestion des Entreprises
                    </h3>
                    <div className="flex gap-3">
                      <button className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
                        <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      Entreprise
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      NINEA
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      Statut
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      Inscription
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {entreprises.map((entreprise, index) => (
                    <motion.tr 
                      key={entreprise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <EntrepriseLogo 
                              entreprise={entreprise} 
                              size="sm"
                            />
                          </div>
                          <div>
                            <div className="text-base font-extrabold text-gray-900 dark:text-white">{entreprise.nom}</div>
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {entreprise.nombreEmployesActifs || 0} employés
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-gray-900 dark:text-white">
                        {entreprise.ninea || 'N/A'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base font-semibold text-gray-700 dark:text-gray-300">
                        {entreprise.email}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold rounded-xl border-2 ${
                          entreprise.estActif 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
                        }`}>
                          {entreprise.estActif ? (
                            <>
                              <Unlock className="w-4 h-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Suspendue
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base font-semibold text-gray-600 dark:text-gray-400">
                        {new Date(entreprise.creeLe).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleManageEntreprise(entreprise.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Gérer"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditEntreprise(entreprise)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Settings className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleEntrepriseStatus(entreprise)}
                            className={`p-2 rounded-lg transition-colors ${
                              entreprise.estActif 
                                ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" 
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                            title={entreprise.estActif ? "Suspendre" : "Activer"}
                          >
                            {entreprise.estActif ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteEntreprise(entreprise.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="gradient" className="p-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-purple-600" />
                  Gestion des Administrateurs
                </h3>
                <div className="text-center py-16">
                  <div className="inline-flex p-6 bg-purple-100 dark:bg-purple-900/30 rounded-3xl mb-6">
                    <Shield className="w-16 h-16 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Fonctionnalité de gestion des administrateurs</p>
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">À implémenter avec les APIs appropriées</p>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="gradient" className="p-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                  Alertes et Notifications
                </h3>
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl"
                  >
                    <div className="p-3 bg-yellow-500 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-extrabold text-yellow-900 dark:text-yellow-100">Entreprise ABC en retard de paiement</p>
                      <p className="text-base font-semibold text-yellow-700 dark:text-yellow-300">Paiement dû depuis 15 jours</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-yellow-600" />
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-2xl"
                  >
                    <div className="p-3 bg-red-500 rounded-xl">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-extrabold text-red-900 dark:text-red-100">Tentative d'accès non autorisée</p>
                      <p className="text-base font-semibold text-red-700 dark:text-red-300">IP: 192.168.1.100 - 3 tentatives échouées</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-red-600" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="gradient" className="p-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <History className="w-7 h-7 text-gray-600" />
                  Logs et Suivi d'Activité
                </h3>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-extrabold text-gray-900 dark:text-white">Nouvelle entreprise créée</p>
                      <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Entreprise "Tech Solutions" ajoutée par Super Admin</p>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-500 mt-1">Il y a 2 heures</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-extrabold text-gray-900 dark:text-white">Connexion administrateur</p>
                      <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Admin de "Global Corp" s'est connecté</p>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-500 mt-1">Il y a 4 heures</p>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal pour ajouter/éditer une entreprise */}
      <EntrepriseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entreprise={selectedEntreprise}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SuperAdminDashboard;