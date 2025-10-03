import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Search, Filter, Download, RefreshCw, Clock, 
  Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Eye, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePointage } from '../../hooks/usePointage';
import StatutBadge from '../../components/ui/StatutBadge';
import pointageService from '../../services/pointage.service';
import employeService from '../../services/employe.service';

/**
 * Page de liste des pointages avec filtres et marquage automatique des absences
 */
const ListePointagesPage = () => {
  const { user, isAdmin } = useAuth();
  const entrepriseId = user?.entrepriseId;

  // États principaux
  const [employes, setEmployes] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMarquage, setLoadingMarquage] = useState(false);

  // États des filtres
  const [filtres, setFiltres] = useState({
    dateDebut: new Date().toISOString().split('T')[0], // Aujourd'hui
    dateFin: new Date().toISOString().split('T')[0],   // Aujourd'hui
    employeId: '',
    statut: '',
    recherche: ''
  });
  const [showFiltres, setShowFiltres] = useState(true);

  // Hook pointage pour marquage automatique
  const { 
    marquerAbsencesAutomatiques, 
    obtenirStatistiques, 
    horairesStandard,
    message: messagePointage,
    loading: loadingPointage
  } = usePointage(entrepriseId);

  // Charger les données
  const chargerDonnees = async () => {
    if (!entrepriseId) return;
    
    setLoading(true);
    try {
      const [empsData, pointagesData] = await Promise.all([
        employeService.listerParEntreprise(entrepriseId),
        pointageService.lister(entrepriseId, {
          du: filtres.dateDebut,
          au: filtres.dateFin,
          employeId: filtres.employeId || undefined,
          statut: filtres.statut || undefined
        })
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
    chargerDonnees();
  }, [entrepriseId]);

  // Recharger quand les filtres changent
  useEffect(() => {
    if (entrepriseId) {
      chargerDonnees();
    }
  }, [filtres.dateDebut, filtres.dateFin, filtres.employeId, filtres.statut]);

  // Données filtrées avec recherche
  const pointagesFiltres = useMemo(() => {
    let result = pointages;

    if (filtres.recherche) {
      const terme = filtres.recherche.toLowerCase();
      result = result.filter(p => {
        const employe = employes.find(e => e.id === p.employeId);
        if (!employe) return false;
        
        const nomComplet = `${employe.prenom} ${employe.nom}`.toLowerCase();
        const codeEmploye = employe.codeEmploye?.toLowerCase() || '';
        
        return nomComplet.includes(terme) || 
               codeEmploye.includes(terme) ||
               p.statut?.toLowerCase().includes(terme) ||
               p.notes?.toLowerCase().includes(terme);
      });
    }

    return result;
  }, [pointages, employes, filtres.recherche]);

  // Statistiques
  const statistiques = useMemo(() => {
    return obtenirStatistiques(pointagesFiltres);
  }, [pointagesFiltres, obtenirStatistiques]);

  // Marquage automatique des absences
  const handleMarquageAutomatique = async () => {
    setLoadingMarquage(true);
    try {
      const resultat = await marquerAbsencesAutomatiques(employes, pointages);
      
      if (resultat.success && resultat.nombreMarques > 0) {
        // Recharger les données après marquage
        await chargerDonnees();
      }
    } catch (error) {
      console.error('Erreur marquage automatique:', error);
    } finally {
      setLoadingMarquage(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (pointagesFiltres.length === 0) return;

    const headers = ['Date', 'Employé', 'Code', 'Statut', 'Arrivée', 'Départ', 'Durée', 'Retard', 'Heures Sup', 'Notes'];
    const rows = pointagesFiltres.map(p => {
      const employe = employes.find(e => e.id === p.employeId);
      const formatMinutes = (min) => min ? `${Math.floor(min/60)}h${(min%60).toString().padStart(2,'0')}` : '-';
      
      return [
        p.date || '-',
        employe ? `${employe.prenom} ${employe.nom}` : 'N/A',
        employe?.codeEmploye || '-',
        p.statut || '-',
        p.heureArrivee || '-',
        p.heureDepart || '-',
        formatMinutes(p.dureeMinutes),
        formatMinutes(p.retardMinutes),
        formatMinutes(p.heuresSupMinutes),
        p.notes || '-'
      ];
    });

    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pointages-${filtres.dateDebut}-${filtres.dateFin}.csv`;
    link.click();
  };

  // Composant StatCard
  const StatCard = ({ icon: Icon, label, value, subValue, color = 'blue' }) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
      rose: 'from-rose-500 to-rose-600'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subValue && (
                <p className="text-xs text-gray-500 mt-1">{subValue}</p>
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

  // Vérifier si c'est l'heure du marquage automatique
  const peutMarquerAbsences = () => {
    const maintenant = new Date();
    const heureCourante = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;
    return heureCourante >= horairesStandard.heureMarquageAbsence;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              Liste des Pointages
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestion et suivi des présences avec marquage automatique des absences
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && peutMarquerAbsences() && (
              <button
                onClick={handleMarquageAutomatique}
                disabled={loadingMarquage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <Clock className={`w-4 h-4 ${loadingMarquage ? 'animate-spin' : ''}`} />
                Marquer Absences (12h)
              </button>
            )}
            
            <button
              onClick={handleExportCSV}
              disabled={pointagesFiltres.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            <button
              onClick={chargerDonnees}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Messages */}
        {messagePointage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              messagePointage.includes('❌') 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {messagePointage}
          </motion.div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Pointages"
            value={statistiques.total}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Présents"
            value={statistiques.presents}
            subValue={`${statistiques.tauxPresence}% de présence`}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Retards"
            value={statistiques.retards}
            subValue={statistiques.retardMoyen > 0 ? `${statistiques.retardMoyen}min moyen` : ''}
            color="amber"
          />
          <StatCard
            icon={XCircle}
            label="Absents"
            value={statistiques.absents}
            color="rose"
          />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => setShowFiltres(!showFiltres)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtres
              {showFiltres ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          <AnimatePresence>
            {showFiltres && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                    <input
                      type="date"
                      value={filtres.dateDebut}
                      onChange={(e) => setFiltres({...filtres, dateDebut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                    <input
                      type="date"
                      value={filtres.dateFin}
                      onChange={(e) => setFiltres({...filtres, dateFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                    <select
                      value={filtres.employeId}
                      onChange={(e) => setFiltres({...filtres, employeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Tous les employés</option>
                      {employes.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.prenom} {emp.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filtres.statut}
                      onChange={(e) => setFiltres({...filtres, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="PRESENT">Présent</option>
                      <option value="RETARD">Retard</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HEURES_SUP">Heures Sup</option>
                      <option value="CONGE">Congé</option>
                      <option value="MALADIE">Maladie</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={filtres.recherche}
                        onChange={(e) => setFiltres({...filtres, recherche: e.target.value})}
                        placeholder="Nom, code..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Marquage automatique des absences à {horairesStandard.heureMarquageAbsence} 
                    {peutMarquerAbsences() ? ' (🟢 Actif)' : ' (🔴 En attente)'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tableau des pointages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Pointages ({pointagesFiltres.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Du {new Date(filtres.dateDebut).toLocaleDateString('fr-FR')} au {new Date(filtres.dateFin).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Chargement des pointages...</p>
              </div>
            ) : pointagesFiltres.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun pointage trouvé</p>
                <p className="text-sm mt-1">Modifiez vos filtres ou ajoutez des pointages</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Employé</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Arrivée</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Départ</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Durée</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pointagesFiltres.map((pointage) => {
                    const employe = employes.find(e => e.id === pointage.employeId);
                    const formatMinutes = (min) => min ? `${Math.floor(min/60)}h${(min%60).toString().padStart(2,'0')}` : '-';
                    
                    return (
                      <motion.tr 
                        key={pointage.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-blue-50 transition-colors border-b border-gray-100"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(pointage.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm mr-3">
                              {employe ? `${employe.prenom[0]}${employe.nom[0]}` : '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employe ? `${employe.prenom} ${employe.nom}` : 'Employé inconnu'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employe?.codeEmploye || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatutBadge 
                              statut={pointage.statut}
                              retardMinutes={pointage.retardMinutes}
                              heuresSupMinutes={pointage.heuresSupMinutes}
                              size="md"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pointage.heureArrivee ? 
                            new Date(pointage.heureArrivee).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 
                            <span className="text-gray-400 italic">Non pointé</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pointage.heureDepart ? 
                            new Date(pointage.heureDepart).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 
                            <span className="text-gray-400 italic">Non pointé</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatMinutes(pointage.dureeMinutes)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          {pointage.notes ? (
                            <div 
                              className="truncate" 
                              title={pointage.notes}
                            >
                              {pointage.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Aucune note</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <button 
                              title="Voir les détails"
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <>
                                <button 
                                  title="Modifier le pointage"
                                  className="inline-flex items-center justify-center w-8 h-8 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  title="Supprimer le pointage"
                                  className="inline-flex items-center justify-center w-8 h-8 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ListePointagesPage;