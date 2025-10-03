import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, AlertTriangle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePointage } from '../../hooks/usePointage';
import StatutBadge from '../ui/StatutBadge';
import pointageService from '../../services/pointage.service';
import employeService from '../../services/employe.service';

/**
 * Composant Dashboard pour visualiser les retards et absences du jour
 */
const DashboardRegardsAbsences = () => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  // États
  const [employes, setEmployes] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Hook pour les utilitaires de pointage
  const { verifierAbsents, obtenirStatistiques, horairesStandard } = usePointage(entrepriseId);

  // Charger les données
  const loadData = async () => {
    if (!entrepriseId) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [empsData, pointagesData] = await Promise.all([
        employeService.listerParEntreprise(entrepriseId),
        pointageService.lister(entrepriseId, { du: today, au: today })
      ]);
      
      setEmployes(empsData || []);
      setPointages(pointagesData || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [entrepriseId]);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoRefresh, entrepriseId]);

  // Calculs
  const { absents, retards, statistiques } = useMemo(() => {
    const absents = verifierAbsents(employes, pointages);
    const retards = pointages.filter(p => p.statut === 'RETARD' || (p.retardMinutes && p.retardMinutes > 0));
    const statistiques = obtenirStatistiques(pointages);

    return { absents, retards, statistiques };
  }, [employes, pointages, verifierAbsents, obtenirStatistiques]);

  // Composant StatCard
  const StatCard = ({ icon: Icon, label, value, subValue, color = 'blue', trend }) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
      rose: 'from-rose-500 to-rose-600',
      purple: 'from-purple-500 to-purple-600'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subValue && (
                <p className="text-xs text-gray-500 mt-1">{subValue}</p>
              )}
              {trend && (
                <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className={`h-1 bg-gradient-to-r ${colorMap[color]}`} />
      </motion.div>
    );
  };

  // Composant EmployeCard
  const EmployeCard = ({ employe, pointage, type }) => {
    const isRetard = type === 'retard';
    const bgColor = isRetard ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg border ${bgColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              isRetard ? 'bg-amber-500' : 'bg-rose-500'
            }`}>
              {employe.prenom[0]}{employe.nom[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{employe.prenom} {employe.nom}</p>
              <p className="text-sm text-gray-500">{employe.codeEmploye}</p>
            </div>
          </div>
          <div className="text-right">
            {isRetard && pointage ? (
              <div>
                <StatutBadge statut="RETARD" retardMinutes={pointage.retardMinutes} size="sm" />
                <p className="text-xs text-gray-500 mt-1">
                  Arrivé à {pointage.heureArrivee}
                </p>
              </div>
            ) : (
              <div>
                <StatutBadge statut="ABSENT" size="sm" />
                <p className="text-xs text-gray-500 mt-1">
                  Pas de pointage
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Présence</h1>
          <p className="text-sm text-gray-600">
            Aperçu des retards et absences du {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manuel'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Employés"
          value={employes.length}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="En Retard"
          value={retards.length}
          subValue={`${statistiques.retardMoyen}min moyen`}
          color="amber"
        />
        <StatCard
          icon={AlertTriangle}
          label="Absents"
          value={absents.length}
          color="rose"
        />
        <StatCard
          icon={TrendingUp}
          label="Taux Présence"
          value={`${statistiques.tauxPresence}%`}
          color="green"
        />
      </div>

      {/* Listes des retards et absences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employés en retard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Employés en Retard</h2>
                <p className="text-sm text-gray-600">{retards.length} employé(s)</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {retards.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aucun retard aujourd'hui ! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {retards.map((pointage) => {
                  const employe = employes.find(e => e.id === pointage.employeId);
                  return employe ? (
                    <EmployeCard 
                      key={pointage.id} 
                      employe={employe} 
                      pointage={pointage} 
                      type="retard" 
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Employés absents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Employés Absents</h2>
                <p className="text-sm text-gray-600">{absents.length} employé(s)</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {absents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tous les employés sont présents ! ✅</p>
              </div>
            ) : (
              <div className="space-y-3">
                {absents.map((employe) => (
                  <EmployeCard 
                    key={employe.id} 
                    employe={employe} 
                    pointage={null} 
                    type="absent" 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration horaires */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6" />
          <h3 className="text-lg font-bold">Configuration Horaires</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-indigo-200 text-sm">Début</p>
            <p className="text-xl font-bold">{horairesStandard.debut}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Fin</p>
            <p className="text-xl font-bold">{horairesStandard.fin}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Tolérance</p>
            <p className="text-xl font-bold">{horairesStandard.toleranceRetard}min</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm">Limite Absence</p>
            <p className="text-xl font-bold">{horairesStandard.heureAbsence}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRegardsAbsences;