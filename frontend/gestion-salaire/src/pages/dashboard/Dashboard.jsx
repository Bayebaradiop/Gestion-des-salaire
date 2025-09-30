import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SimpleFormModal from '../../components/modals/SimpleFormModal';
import { FaUsers, FaMoneyBillWave, FaChartLine, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import dashboardService from '../../services/dashboard.service';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  BarChart, Bar,
  AreaChart, Area,
} from 'recharts';

const DashboardSalaire = () => {
  const { user, isAdmin, isCaissier } = useAuth();
  const [stats, setStats] = useState({
    employesActifs: 0,
    employesTotal: 0,
    cyclesEnCours: 0,
    bulletinsEnAttente: 0
  });
  const [loading, setLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [data, setData] = useState([]);

  const DEFAULT_STATS = {
    employesActifs: 0,
    employesTotal: 0,
    cyclesEnCours: 0,
    bulletinsEnAttente: 0
  };

  const DEFAULT_GRAPH_DATA = [
    { mois: 'Avr', masse: 0, paye: 0, restant: 0 },
    { mois: 'Mai', masse: 0, paye: 0, restant: 0 },
    { mois: 'Juin', masse: 0, paye: 0, restant: 0 },
    { mois: 'Juil', masse: 0, paye: 0, restant: 0 },
    { mois: 'Août', masse: 0, paye: 0, restant: 0 },
    { mois: 'Sep', masse: 0, paye: 0, restant: 0 },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.entrepriseId) {
        setStats(DEFAULT_STATS);
        setData(DEFAULT_GRAPH_DATA);
        setLoading(false);
        return;
      }

      setLoading(true);
      const entrepriseId = user.entrepriseId;

      try {
        // 1) Vérifier si des données existent, sinon initialiser
        const hasData = await dashboardService.checkDataExists(entrepriseId);
        if (!hasData) {
          await dashboardService.initializeData(entrepriseId);
          toast.success('Données initialisées pour votre entreprise');
        }

        // 2) Essayer de récupérer toutes les données en un appel
        try {
          const { data: all } = await dashboardService.getDashboardData(entrepriseId);
          if (all) {
            const mapped = (all.graphData || []).map((g) => ({
              mois: g.mois,
              masse: g.masseSalariale ?? 0,
              paye: g.montantPaye ?? 0,
              restant: g.montantRestant ?? 0,
            }));
            setData(mapped.length ? mapped : DEFAULT_GRAPH_DATA);

            const s = all.stats || {};
            setStats({
              employesActifs: s.employesActifs ?? 0,
              employesTotal: s.employesTotal ?? 0,
              cyclesEnCours: s.cyclesEnCours ?? 0,
              bulletinsEnAttente: s.bulletinsEnAttente ?? 0,
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          // continue to fallback
        }

        // 3) Fallback: récupérer séparément stats et graph
        const [statsRes, evoRes, nextPayRes] = await Promise.allSettled([
          dashboardService.getStats(entrepriseId),
          dashboardService.getGraphData(entrepriseId),
          dashboardService.getNextPayments(entrepriseId, 50),
        ]);

        // Graph data
        if (evoRes.status === 'fulfilled') {
          const evo = evoRes.value.data || [];
          const mapped = evo.map((m) => ({
            mois: m.mois,
            masse: m.montant ?? 0,
            paye: Math.floor((m.montant ?? 0) * 0.8),
            restant: Math.max(0, (m.montant ?? 0) - Math.floor((m.montant ?? 0) * 0.8)),
          }));
          setData(mapped.length ? mapped : DEFAULT_GRAPH_DATA);
        } else {
          setData(DEFAULT_GRAPH_DATA);
        }

        // Stats
        let bulletinsEnAttente = 0;
        if (nextPayRes.status === 'fulfilled') {
          bulletinsEnAttente = Array.isArray(nextPayRes.value.data) ? nextPayRes.value.data.length : 0;
        }

        if (statsRes.status === 'fulfilled') {
          const kpis = statsRes.value.data || {};
          setStats({
            employesActifs: kpis.nombreEmployesActifs ?? 0,
            employesTotal: kpis.nombreEmployes ?? 0,
            cyclesEnCours: 0, // non fourni par cette route
            bulletinsEnAttente,
          });
        } else {
          setStats({ ...DEFAULT_STATS, bulletinsEnAttente });
        }

      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement du tableau de bord");
        setStats(DEFAULT_STATS);
        setData(DEFAULT_GRAPH_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord des salaires</h1>
      </div>

          <Card title="Actions rapides">
        <div className="flex flex-wrap gap-4">
          {isAdmin && (
            <>
              <Button as={Link} to="/employes/ajouter">Ajouter un employé</Button>
              <Button as={Link} to="/cycles/creer" variant="secondary">Nouveau cycle de paie</Button>
            </>
          )}
          {isCaissier && (
            <Button as={Link} to="/bulletins" variant="success">Enregistrer un paiement</Button>
          )}
        </div>
      </Card>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="h-6 w-6 text-blue-700" />
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {stats.employesTotal > 0 
                  ? Math.round((stats.employesActifs / stats.employesTotal) * 100) + '% actifs'
                  : '0% actifs'}
              </span>
            </div>
            <h3 className="text-xl font-bold">{stats.employesActifs}</h3>
            <p className="text-sm text-gray-500">Employés actifs</p>
          </div>
          <div className="border-t px-6 py-3">
            <Link to="/employes" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir tous les employés →
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FaMoneyBillWave className="h-6 w-6 text-amber-700" />
              </div>
              {isAdmin && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  En cours
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold">{stats.cyclesEnCours}</h3>
            <p className="text-sm text-gray-500">Cycles de paie actifs</p>
          </div>
          <div className="border-t px-6 py-3">
            <Link to="/cycles" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Gérer les cycles →
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaChartLine className="h-6 w-6 text-green-700" />
              </div>
              {isCaissier && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  À traiter
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold">{stats.bulletinsEnAttente}</h3>
            <p className="text-sm text-gray-500">Bulletins en attente</p>
          </div>
          <div className="border-t px-6 py-3">
            <Link to="/bulletins" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir les bulletins →
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FaBuilding className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <h3 className="text-xl font-bold">{user?.entreprise?.nom || 'Votre entreprise'}</h3>
            <p className="text-sm text-gray-500">ID: {user?.entrepriseId || '1'}</p>
          </div>
          <div className="border-t px-6 py-3">
            <Link to="/parametres" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Paramètres →
            </Link>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
  

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Évolution de la masse salariale">
          <LineChart width={300} height={200} data={data}>
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="masse" stroke="#8884d8" />
          </LineChart>
        </Card>

        <Card title="Montant payé par mois">
          <BarChart width={300} height={200} data={data}>
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="paye" fill="#82ca9d" />
          </BarChart>
        </Card>

        <Card title="Montant restant à payer">
          <AreaChart width={300} height={200} data={data}>
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="restant" stroke="#ffc658" fill="#ffc658" />
          </AreaChart>
        </Card>
      </div>

      {/* Modals (test, confirmation, formulaire) */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Modal de Test" size="md">
        <div className="space-y-4">
          <p>✅ Les modales fonctionnent maintenant correctement!</p>
          <Button variant="primary" onClick={() => setIsTestModalOpen(false)} className="w-full">❌ Fermer</Button>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => console.log('✅ Action confirmée')}
        title="Confirmation de test"
        message="Voulez-vous confirmer cette action ?"
        confirmText="Oui"
        cancelText="Annuler"
        variant="success"
      />

      <SimpleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={(data) => console.log('📝 Données du formulaire:', data)}
      />
    </div>
  );
};

export default DashboardSalaire;
