import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useTheme } from '../../context/AdvancedThemeContext';
import { Button } from '../ui/AdvancedButton';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const PremiumDashboard = () => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSalaries, setShowSalaries] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 156,
    activeEmployees: 142,
    totalPayroll: 45670000,
    pendingPayments: 12,
    monthlyGrowth: 8.5,
    payrollTrend: [
      { month: 'Jan', amount: 42000000 },
      { month: 'Fév', amount: 43200000 },
      { month: 'Mar', amount: 44100000 },
      { month: 'Avr', amount: 45670000 },
      { month: 'Mai', amount: 46200000 },
      { month: 'Jun', amount: 47800000 }
    ],
    employeesByContract: [
      { name: 'CDI', value: 89, color: '#3B82F6' },
      { name: 'Journalier', value: 45, color: '#10B981' },
      { name: 'Honoraire', value: 22, color: '#F59E0B' }
    ],
    recentActivities: [
      { id: 1, type: 'payment', message: 'Paiement de Janvier traité', time: '2 min' },
      { id: 2, type: 'employee', message: 'Nouvel employé ajouté', time: '15 min' },
      { id: 3, type: 'update', message: 'Salaire mis à jour', time: '1h' }
    ]
  });

  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulation de rafraîchissement
    setTimeout(() => setRefreshing(false), 2000);
  };

  const formatCurrency = (amount) => {
    if (!showSalaries) return '••••••••';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const StatCard = ({ title, value, icon: Icon, change, color = "primary", delay = 0 }) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay }}
      className={`
        relative overflow-hidden rounded-2xl p-6 
        ${isDark ? 'bg-gray-800/50' : 'bg-white'} 
        backdrop-blur-sm border border-white/20 shadow-xl
        ${isDark ? 'shadow-gray-900/20' : 'shadow-gray-200/50'}
        group hover:shadow-2xl transition-all duration-300
      `}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br from-${color}-500 to-${color}-700`} />
      
      {/* Icône flottante */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-500">
                +{change}%
              </span>
              <span className={`ml-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        <div className={`
          p-3 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600
          shadow-lg shadow-${color}-500/25 group-hover:shadow-${color}-500/40
          transform group-hover:scale-110 transition-all duration-300
        `}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
      >
        <div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Dashboard
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Vue d'ensemble de votre gestion des salaires
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={showSalaries ? <EyeOff /> : <Eye />}
            onClick={() => setShowSalaries(!showSalaries)}
          >
            {showSalaries ? 'Masquer' : 'Afficher'} montants
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter />}
          >
            Filtrer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={refreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Actualiser
          </Button>
          
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Download />}
          >
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employés"
          value={dashboardData.totalEmployees}
          icon={Users}
          change={dashboardData.monthlyGrowth}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="Employés Actifs"
          value={dashboardData.activeEmployees}
          icon={TrendingUp}
          color="green"
          delay={0.2}
        />
        <StatCard
          title="Masse Salariale"
          value={formatCurrency(dashboardData.totalPayroll)}
          icon={DollarSign}
          change={5.2}
          color="yellow"
          delay={0.3}
        />
        <StatCard
          title="Paiements en Attente"
          value={dashboardData.pendingPayments}
          icon={Calendar}
          color="red"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution de la masse salariale */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`
            p-6 rounded-2xl 
            ${isDark ? 'bg-gray-800/50' : 'bg-white'} 
            backdrop-blur-sm border border-white/20 shadow-xl
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Évolution Masse Salariale
            </h3>
            <LineChart className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={dashboardData.payrollTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                stroke={isDark ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDark ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickFormatter={(value) => showSalaries ? `${value / 1000000}M` : '•••'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [showSalaries ? formatCurrency(value) : '•••••••', 'Montant']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Répartition par type de contrat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className={`
            p-6 rounded-2xl 
            ${isDark ? 'bg-gray-800/50' : 'bg-white'} 
            backdrop-blur-sm border border-white/20 shadow-xl
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Répartition par Contrat
            </h3>
            <PieChart className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dashboardData.employeesByContract}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.employeesByContract.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          {/* Légende personnalisée */}
          <div className="flex justify-center space-x-6 mt-4">
            {dashboardData.employeesByContract.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activités récentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`
          p-6 rounded-2xl 
          ${isDark ? 'bg-gray-800/50' : 'bg-white'} 
          backdrop-blur-sm border border-white/20 shadow-xl
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Activités Récentes
          </h3>
          <Bell className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {dashboardData.recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center p-4 rounded-xl
                  ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} 
                  hover:${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} 
                  transition-colors duration-200
                `}
              >
                <div className={`
                  p-2 rounded-lg mr-4
                  ${activity.type === 'payment' ? 'bg-green-100 text-green-600' : 
                    activity.type === 'employee' ? 'bg-blue-100 text-blue-600' : 
                    'bg-yellow-100 text-yellow-600'}
                `}>
                  {activity.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                   activity.type === 'employee' ? <Users className="h-4 w-4" /> :
                   <Settings className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {activity.message}
                  </p>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  il y a {activity.time}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumDashboard;