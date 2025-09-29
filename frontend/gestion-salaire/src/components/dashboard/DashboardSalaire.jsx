import React, { useState, useEffect } from 'react';
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
  ResponsiveContainer
} from 'recharts';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaExclamationTriangle,
  FaBuilding,
  FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const DashboardSalaire = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({});
  const [chartData, setChartData] = useState([]);

  // Données mock
  const mockKpiData = {
    employesActifs: 42,
    employesTotal: 45,
    cyclesEnCours: 2,
    bulletinsEnAttente: 12,
    nomEntreprise: user?.entreprise?.nom || 'Entreprise'
  };

  const mockChartData = [
    {
      mois: 'Avr 2025',
      masseSalariale: 24500000,
      montantPaye: 22100000,
      montantRestant: 2400000
    },
    {
      mois: 'Mai 2025',
      masseSalariale: 24800000,
      montantPaye: 23200000,
      montantRestant: 1600000
    },
    {
      mois: 'Juin 2025',
      masseSalariale: 25200000,
      montantPaye: 24800000,
      montantRestant: 400000
    },
    {
      mois: 'Juil 2025',
      masseSalariale: 25400000,
      montantPaye: 19200000,
      montantRestant: 6200000
    },
    {
      mois: 'Août 2025',
      masseSalariale: 25100000,
      montantPaye: 16800000,
      montantRestant: 8300000
    },
    {
      mois: 'Sep 2025',
      masseSalariale: 25650000,
      montantPaye: 18420000,
      montantRestant: 7230000
    }
  ];

  const mockProchainsPaiements = [
    {
      id: 1,
      employe: 'Amadou Diallo',
      poste: 'Développeur Senior',
      montant: 850000,
      datePrevue: '2025-10-05',
      statut: 'APPROUVE',
      priorite: 'haute'
    },
    {
      id: 2,
      employe: 'Fatou Sow',
      poste: 'Chef de Projet',
      montant: 750000,
      datePrevue: '2025-10-05',
      statut: 'APPROUVE',
      priorite: 'haute'
    },
    {
      id: 3,
      employe: 'Moussa Kane',
      poste: 'Comptable',
      montant: 650000,
      datePrevue: '2025-10-10',
      statut: 'BROUILLON',
      priorite: 'moyenne'
    },
    {
      id: 4,
      employe: 'Aissatou Ba',
      poste: 'Secrétaire',
      montant: 450000,
      datePrevue: '2025-10-10',
      statut: 'PAYE_PARTIEL',
      montantPaye: 200000,
      priorite: 'moyenne'
    },
    {
      id: 5,
      employe: 'Ibrahima Ndiaye',
      poste: 'Commercial',
      montant: 720000,
      datePrevue: '2025-10-15',
      statut: 'BROUILLON',
      priorite: 'basse'
    }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    const loadData = async () => {
      setLoading(true);
      
      // Simule un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setKpiData(mockKpiData);
      setChartData(mockChartData);
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Formatage des montants
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Formatage compact des montants pour les graphiques
  const formatMontantCompact = (montant) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`;
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K`;
    }
    return montant.toString();
  };

  // Rendu des KPI Cards
  const KpiCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Salaires</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble pour {kpiData.nomEntreprise}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2 md:mt-0">
            <span>Dernière mise à jour:</span>
            <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Employés actifs / total"
            value={`${kpiData.employesActifs} / ${kpiData.employesTotal}`}
            icon={FaUsers}
            color="bg-blue-500"
            bgColor="bg-white"
          />
          <KpiCard
            title="Cycles de paie en cours"
            value={kpiData.cyclesEnCours}
            icon={FaChartLine}
            color="bg-green-500"
            bgColor="bg-white"
          />
          <KpiCard
            title="Bulletins en attente"
            value={kpiData.bulletinsEnAttente}
            icon={FaFileAlt}
            color="bg-orange-500"
            bgColor="bg-white"
          />
          <KpiCard
            title="Entreprise"
            value={kpiData.nomEntreprise}
            icon={FaBuilding}
            color="bg-purple-500"
            bgColor="bg-white"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Évolution Masse Salariale */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution de la Masse Salariale</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mois" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tickFormatter={formatMontantCompact}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  formatter={(value) => [formatMontant(value), 'Masse Salariale']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="masseSalariale" 
                  name="Masse salariale"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Montant Payé */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Montant Payé par Mois</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mois" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tickFormatter={formatMontantCompact}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  formatter={(value) => [formatMontant(value), 'Montant Payé']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="montantPaye" 
                  name="Montant payé"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart - Montant Restant */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Montant Restant à Payer par Mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mois" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tickFormatter={formatMontantCompact}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value) => [formatMontant(value), 'Montant Restant']}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="montantRestant" 
                name="Montant restant"
                stroke="#f59e0b" 
                fill="#fef3c7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>


      </div>
    </div>
  );
};

export default DashboardSalaire;