import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import dashboardService from '../../services/dashboard.service';
import { StatCard, Card } from '../../components/ui/PremiumComponents';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PremiumDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    employesActifs: 0,
    employesTotal: 0,
    cyclesEnCours: 0,
    bulletinsEnAttente: 0
  });
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEFAULT_STATS = {
    employesActifs: 0,
    employesTotal: 0,
    cyclesEnCours: 0,
    bulletinsEnAttente: 0
  };

  const DEFAULT_GRAPH_DATA = [
    { mois: 'Jan', masse: 45000, paye: 42000, restant: 3000 },
    { mois: 'Fév', masse: 48000, paye: 46000, restant: 2000 },
    { mois: 'Mar', masse: 52000, paye: 50000, restant: 2000 },
    { mois: 'Avr', masse: 49000, paye: 48000, restant: 1000 },
    { mois: 'Mai', masse: 54000, paye: 52000, restant: 2000 },
    { mois: 'Juin', masse: 58000, paye: 56000, restant: 2000 },
  ];

  useEffect(() => {
    loadDashboard();
  }, [user?.entrepriseId]);

  const loadDashboard = async () => {
    if (!user?.entrepriseId) {
      setStats(DEFAULT_STATS);
      setGraphData(DEFAULT_GRAPH_DATA);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: all } = await dashboardService.getDashboardData(user.entrepriseId);
      if (all) {
        const mapped = (all.graphData || []).map((g) => ({
          mois: g.mois,
          masse: g.masseSalariale ?? 0,
          paye: g.montantPaye ?? 0,
          restant: g.montantRestant ?? 0,
        }));
        setGraphData(mapped.length ? mapped : DEFAULT_GRAPH_DATA);

        const s = all.stats || {};
        setStats({
          employesActifs: s.employesActifs ?? 0,
          employesTotal: s.employesTotal ?? 0,
          cyclesEnCours: s.cyclesEnCours ?? 0,
          bulletinsEnAttente: s.bulletinsEnAttente ?? 0,
        });
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setStats(DEFAULT_STATS);
      setGraphData(DEFAULT_GRAPH_DATA);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-gray-600">
          <p className="font-extrabold text-gray-900 dark:text-white mb-3 text-base">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-base font-bold mb-1" style={{ color: entry.color }}>
              {entry.name}: <span className="font-extrabold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const pieData = [
    { name: 'Payé', value: stats.employesActifs, color: '#10b981' },
    { name: 'En attente', value: stats.bulletinsEnAttente, color: '#f59e0b' },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-base font-extrabold"
        style={{ fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </div>
        {isAdmin && (
          <Link to="/cycles/nouveau">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Nouveau cycle de paie
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Employés Actifs"
          value={stats.employesActifs}
          change="+12% ce mois"
          trend="up"
          icon={<Users className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Total Employés"
          value={stats.employesTotal}
          change={`${stats.employesTotal - stats.employesActifs} inactifs`}
          trend="neutral"
          icon={<Activity className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Cycles en Cours"
          value={stats.cyclesEnCours}
          change="En traitement"
          trend="up"
          icon={<Clock className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Bulletins en Attente"
          value={stats.bulletinsEnAttente}
          change={stats.bulletinsEnAttente > 0 ? "À traiter" : "Tout est à jour"}
          trend={stats.bulletinsEnAttente > 0 ? "down" : "up"}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="rose"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="gradient" className="p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Évolution de la Masse Salariale
              </h3>
              <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                Suivi mensuel des salaires sur 6 mois
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorSalaire" x1="0" y1="0" x2="0" y2="1">
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
                  stroke="#374151"
                  style={{ fontSize: '14px', fontWeight: '700' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="masse" 
                  name="Masse Salariale"
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSalaire)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="p-6 h-full">
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Répartition des Paiements
              </h3>
              <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                État des bulletins
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#ffffff"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-base font-bold text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-extrabold text-lg text-gray-900 dark:text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="p-6">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-indigo-600" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <Link to="/employes">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-600 transition-colors">
                        <Users className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-base text-gray-900 dark:text-white">Gérer les Employés</p>
                        <p className="text-base font-semibold text-gray-500 dark:text-gray-400">Ajouter, modifier ou supprimer</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/cycles">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-600 transition-colors">
                        <DollarSign className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-base text-gray-900 dark:text-white">Cycles de Paie</p>
                        <p className="text-base font-semibold text-gray-500 dark:text-gray-400">Créer et gérer les cycles</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/pointages">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-600 transition-colors">
                        <Clock className="w-5 h-5 text-amber-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-base text-gray-900 dark:text-white">Pointages</p>
                        <p className="text-base font-semibold text-gray-500 dark:text-gray-400">Gérer les présences</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="p-6">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Activity className="w-7 h-7 text-purple-600" />
              Activité Récente
            </h3>
            <div className="space-y-4">
              {[
                { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'Cycle de paie validé', time: 'Il y a 2h' },
                { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: '3 nouveaux employés ajoutés', time: 'Il y a 5h' },
                { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', text: '5 pointages à valider', time: 'Hier' },
                { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'Paiements effectués', time: 'Il y a 2 jours' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`p-2 ${activity.bg} rounded-lg`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{activity.text}</p>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumDashboard;
