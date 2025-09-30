import { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaEye, FaUser, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import employeService from '../services/employe.service';
import bulletinPaieService from '../services/bulletinPaie.service';
import Modal from '../components/ui/Modal';
import DetailsBulletin from '../components/bulletins/DetailsBulletin';

const ConsultationBulletins = () => {
  const { user } = useAuth();
  
  const [employes, setEmployes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinSelectionne, setBulletinSelectionne] = useState(null);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(false);
  const [showDetailsBulletin, setShowDetailsBulletin] = useState(false);

  const [filtres, setFiltres] = useState({
    employeId: '',
    recherche: '',
    periode: ''
  });

  // Charger les employés
  useEffect(() => {
    const chargerEmployes = async () => {
      try {
        setLoadingEmployes(true);
        const response = await employeService.listerParEntreprise(user.entrepriseId);
        setEmployes(response);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      } finally {
        setLoadingEmployes(false);
      }
    };

    if (user?.entrepriseId) {
      chargerEmployes();
    }
  }, [user]);

  // Charger les bulletins quand les filtres changent
  useEffect(() => {
    const chargerBulletins = async () => {
      if (filtres.employeId) {
        try {
          setLoadingBulletins(true);
          const response = await bulletinPaieService.listerParEmploye(filtres.employeId);
          setBulletins(response);
        } catch (error) {
          console.error('Erreur lors du chargement des bulletins:', error);
          setBulletins([]);
        } finally {
          setLoadingBulletins(false);
        }
      } else {
        setBulletins([]);
      }
    };

    chargerBulletins();
  }, [filtres.employeId]);

  const handleFiltreChange = (name, value) => {
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatutBadge = (statut) => {
    const config = {
      EN_ATTENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      PARTIEL: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Payé partiellement' },
      PAYE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payé intégralement' }
    };
    const style = config[statut] || config.EN_ATTENTE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const telechargerBulletinPDF = async (bulletinId) => {
    try {
      await bulletinPaieService.telechargerPDF(bulletinId);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const voirDetailsBulletin = (bulletin) => {
    setBulletinSelectionne(bulletin);
    setShowDetailsBulletin(true);
  };

  // Filtrer les bulletins selon la recherche et la période
  const bulletinsFiltres = bulletins.filter(bulletin => {
    const matchRecherche = !filtres.recherche || 
      bulletin.cyclePaie.titre.toLowerCase().includes(filtres.recherche.toLowerCase()) ||
      bulletin.numeroBulletin.toLowerCase().includes(filtres.recherche.toLowerCase());
    
    const matchPeriode = !filtres.periode ||
      bulletin.cyclePaie.periode === filtres.periode;
    
    return matchRecherche && matchPeriode;
  });

  // Extraire les périodes uniques pour le filtre
  const periodes = [...new Set(bulletins.map(b => b.cyclePaie.periode))].sort().reverse();

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Consultation des Bulletins
        </h1>
        <p className="text-gray-600">
          Rechercher et consulter les bulletins de paie des employés
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recherche</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sélection employé */}
          <div>
            <label htmlFor="employeId" className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Employé
            </label>
            <select
              id="employeId"
              value={filtres.employeId}
              onChange={(e) => handleFiltreChange('employeId', e.target.value)}
              disabled={loadingEmployes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {loadingEmployes ? 'Chargement...' : 'Sélectionner un employé'}
              </option>
              {employes.map(employe => (
                <option key={employe.id} value={employe.id}>
                  {employe.prenom} {employe.nom} - {employe.codeEmploye}
                </option>
              ))}
            </select>
          </div>

          {/* Recherche textuelle */}
          <div>
            <label htmlFor="recherche" className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Recherche
            </label>
            <input
              type="text"
              id="recherche"
              value={filtres.recherche}
              onChange={(e) => handleFiltreChange('recherche', e.target.value)}
              placeholder="Titre du cycle, numéro bulletin..."
              disabled={!filtres.employeId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre période */}
          <div>
            <label htmlFor="periode" className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />
              Période
            </label>
            <select
              id="periode"
              value={filtres.periode}
              onChange={(e) => handleFiltreChange('periode', e.target.value)}
              disabled={!filtres.employeId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les périodes</option>
              {periodes.map(periode => (
                <option key={periode} value={periode}>
                  {periode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Bulletins de paie
            {filtres.employeId && (
              <span className="ml-2 text-sm text-gray-500">
                ({bulletinsFiltres.length} bulletin{bulletinsFiltres.length > 1 ? 's' : ''})
              </span>
            )}
          </h3>
        </div>

        {!filtres.employeId ? (
          <div className="p-8 text-center text-gray-500">
            <FaUser className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Sélectionnez un employé pour voir ses bulletins de paie</p>
          </div>
        ) : loadingBulletins ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des bulletins...</p>
          </div>
        ) : bulletinsFiltres.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun bulletin trouvé pour cet employé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période / Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Bulletin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salaire Net
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Payé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bulletinsFiltres.map((bulletin) => (
                  <tr key={bulletin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bulletin.cyclePaie.titre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bulletin.cyclePaie.periode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {bulletin.numeroBulletin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMontant(bulletin.salaireNet)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMontant(bulletin.montantPaye)}
                      {bulletin.montantPaye < bulletin.salaireNet && (
                        <div className="text-xs text-orange-600">
                          Reste: {formatMontant(bulletin.salaireNet - bulletin.montantPaye)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatutBadge(bulletin.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bulletin.creeLe)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => voirDetailsBulletin(bulletin)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => telechargerBulletinPDF(bulletin.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Télécharger le PDF"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails bulletin */}
      <Modal
        isOpen={showDetailsBulletin}
        onClose={() => setShowDetailsBulletin(false)}
        title="Détails du Bulletin de Paie"
        size="lg"
      >
        {bulletinSelectionne && (
          <DetailsBulletin
            bulletin={bulletinSelectionne}
            onClose={() => setShowDetailsBulletin(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ConsultationBulletins;