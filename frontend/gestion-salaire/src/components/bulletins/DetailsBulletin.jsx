import { useState, useEffect } from 'react';
import { FaDownload, FaMoneyBillWave, FaCalendar, FaUser } from 'react-icons/fa';
import bulletinPaieService from '../../services/bulletinPaie.service';
import paiementService from '../../services/paiement.service';

const DetailsBulletin = ({ bulletin, onClose }) => {
  const [paiements, setPaiements] = useState([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);

  // Charger les paiements de ce bulletin
  useEffect(() => {
    const chargerPaiements = async () => {
      try {
        setLoadingPaiements(true);
        const response = await paiementService.listerParBulletin(bulletin.id);
        setPaiements(response);
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
        setPaiements([]);
      } finally {
        setLoadingPaiements(false);
      }
    };

    if (bulletin?.id) {
      chargerPaiements();
    }
  }, [bulletin]);

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

  const telechargerBulletinPDF = async () => {
    try {
      await bulletinPaieService.telechargerPDF(bulletin.id);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const telechargerRecuPaiement = async (paiementId) => {
    try {
      await paiementService.telechargerRecu(paiementId);
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
    }
  };

  if (!bulletin) return null;

  return (
    <div className="space-y-6">
      {/* Informations employé */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FaUser className="mr-2" />
          Informations Employé
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nom complet:</span>
            <span className="ml-2 font-medium">
              {bulletin.employe.prenom} {bulletin.employe.nom}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Code employé:</span>
            <span className="ml-2 font-medium">{bulletin.employe.codeEmploye}</span>
          </div>
          <div>
            <span className="text-gray-600">Poste:</span>
            <span className="ml-2 font-medium">{bulletin.employe.poste}</span>
          </div>
          <div>
            <span className="text-gray-600">Type de contrat:</span>
            <span className="ml-2 font-medium">{bulletin.employe.typeContrat}</span>
          </div>
        </div>
      </div>

      {/* Informations cycle */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FaCalendar className="mr-2" />
          Cycle de Paie
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Titre:</span>
            <span className="ml-2 font-medium">{bulletin.cyclePaie.titre}</span>
          </div>
          <div>
            <span className="text-gray-600">Période:</span>
            <span className="ml-2 font-medium">{bulletin.cyclePaie.periode}</span>
          </div>
          <div>
            <span className="text-gray-600">Début:</span>
            <span className="ml-2 font-medium">{formatDate(bulletin.cyclePaie.dateDebut)}</span>
          </div>
          <div>
            <span className="text-gray-600">Fin:</span>
            <span className="ml-2 font-medium">{formatDate(bulletin.cyclePaie.dateFin)}</span>
          </div>
        </div>
      </div>

      {/* Détails financiers */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FaMoneyBillWave className="mr-2" />
          Détails Financiers
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">N° Bulletin:</span>
            <span className="ml-2 font-medium font-mono">{bulletin.numeroBulletin}</span>
          </div>
          <div>
            <span className="text-gray-600">Jours travaillés:</span>
            <span className="ml-2 font-medium">{bulletin.joursTravailes || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Salaire brut:</span>
            <span className="ml-2 font-medium">{formatMontant(bulletin.salaireBrut)}</span>
          </div>
          <div>
            <span className="text-gray-600">Déductions:</span>
            <span className="ml-2 font-medium">{formatMontant(bulletin.deductions)}</span>
          </div>
          <div className="col-span-2 border-t pt-2">
            <span className="text-gray-600">Salaire net:</span>
            <span className="ml-2 font-bold text-lg text-green-600">
              {formatMontant(bulletin.salaireNet)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Montant payé:</span>
            <span className="ml-2 font-medium">{formatMontant(bulletin.montantPaye)}</span>
          </div>
          <div>
            <span className="text-gray-600">Reste à payer:</span>
            <span className={`ml-2 font-medium ${
              bulletin.salaireNet - bulletin.montantPaye > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {formatMontant(bulletin.salaireNet - bulletin.montantPaye)}
            </span>
          </div>
        </div>
      </div>

      {/* Historique des paiements */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Historique des Paiements</h4>
        
        {loadingPaiements ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement des paiements...</p>
          </div>
        ) : paiements.length === 0 ? (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            Aucun paiement enregistré pour ce bulletin
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Méthode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    N° Reçu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paiements.map((paiement) => (
                  <tr key={paiement.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(paiement.creeLe)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMontant(paiement.montant)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {getMethodePaiementLabel(paiement.methodePaiement)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {paiement.numeroRecu}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => telechargerRecuPaiement(paiement.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Télécharger le reçu"
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          onClick={telechargerBulletinPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaDownload /> Télécharger le Bulletin PDF
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default DetailsBulletin;