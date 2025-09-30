import { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaUsers, 
  FaReceipt, 
  FaChartLine,
  FaPlus,
  FaFilter,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { usePaiement } from '../context/PaiementContext';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import FormulaireNouveauPaiement from '../components/paiements/FormulaireNouveauPaiement';
import FiltresPaiements from '../components/paiements/FiltresPaiements';

const CaissierDashboard = () => {
  const { 
    paiements, 
    loading, 
    pagination, 
    filtres,
    chargerPaiements,
    telechargerRecu,
    supprimerPaiement,
    changerPage
  } = usePaiement();
  
  const { user } = useAuth();
  const [showNouveauPaiement, setShowNouveauPaiement] = useState(false);
  const [showFiltres, setShowFiltres] = useState(false);
  const [paiementSelectionne, setPaiementSelectionne] = useState(null);

  // Statistiques rapides
  const [stats, setStats] = useState({
    totalPaiements: 0,
    montantTotal: 0,
    paiementsAujourdhui: 0,
    employesPayes: 0
  });

  useEffect(() => {
    chargerPaiements();
  }, []);

  // Calculer les statistiques à partir des paiements chargés
  useEffect(() => {
    if (paiements.length > 0) {
      const aujourdhui = new Date().toDateString();
      
      const paiementsAujourdhui = paiements.filter(p => 
        new Date(p.creeLe).toDateString() === aujourdhui
      );
      
      const employesUniques = new Set(paiements.map(p => p.bulletinPaie.employe.id));
      
      setStats({
        totalPaiements: pagination.total || paiements.length,
        montantTotal: paiements.reduce((total, p) => total + p.montant, 0),
        paiementsAujourdhui: paiementsAujourdhui.length,
        employesPayes: employesUniques.size
      });
    }
  }, [paiements, pagination.total]);

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodePaiementLabel = (methode) => {
    const methodes = {
      'ESPECES': 'Espèces',
      'VIREMENT_BANCAIRE': 'Virement bancaire',
      'ORANGE_MONEY': 'Orange Money',
      'WAVE': 'Wave',
      'AUTRE': 'Autre'
    };
    return methodes[methode] || methode;
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      await supprimerPaiement(id);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Caissier
        </h1>
        <p className="text-gray-600">
          Bienvenue, {user?.prenom} {user?.nom}
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaMoneyBillWave className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Paiements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPaiements}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaChartLine className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMontant(stats.montantTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaReceipt className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paiementsAujourdhui}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUsers className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Employés Payés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.employesPayes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setShowNouveauPaiement(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Nouveau Paiement
        </button>
        
        <button
          onClick={() => setShowFiltres(!showFiltres)}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
        >
          <FaFilter /> Filtres
        </button>
      </div>

      {/* Filtres */}
      {showFiltres && (
        <div className="mb-6">
          <FiltresPaiements onClose={() => setShowFiltres(false)} />
        </div>
      )}

      {/* Tableau des paiements */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Liste des Paiements
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : paiements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun paiement trouvé
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Reçu
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paiements.map((paiement) => (
                    <tr key={paiement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {paiement.bulletinPaie.employe.prenom} {paiement.bulletinPaie.employe.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {paiement.bulletinPaie.employe.codeEmploye}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMontant(paiement.montant)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMethodePaiementLabel(paiement.methodePaiement)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(paiement.creeLe)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {paiement.numeroRecu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => telechargerRecu(paiement.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Télécharger le reçu"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => setPaiementSelectionne(paiement)}
                            className="text-green-600 hover:text-green-900"
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.page} sur {pagination.totalPages} 
                    ({pagination.total} paiements au total)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changerPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => changerPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal nouveau paiement */}
      <Modal
        isOpen={showNouveauPaiement}
        onClose={() => setShowNouveauPaiement(false)}
        title="Nouveau Paiement"
        size="lg"
      >
        <FormulaireNouveauPaiement
          onSuccess={() => {
            setShowNouveauPaiement(false);
            // Le rechargement est déjà géré dans le contexte
          }}
          onCancel={() => setShowNouveauPaiement(false)}
        />
      </Modal>
    </div>
  );
};

export default CaissierDashboard;