import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import paiementAutomatiseService from '../../services/paiementAutomatise.service';
import { FaFilter, FaEye, FaMoneyBillWave, FaHistory, FaClock, FaUser } from 'react-icons/fa';

const HistoriquePaiementsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paiements, setPaiements] = useState([]);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [periode, setPeriode] = useState('');
  
  // États pour le modal de paiement
  const [montantPaye, setMontantPaye] = useState('');
  const [methodePaiement, setMethodePaiement] = useState('ESPECES');
  const [notes, setNotes] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Liste des périodes disponibles
  const periodes = paiementAutomatiseService.genererListePeriodes(12);

  const loadPaiements = async () => {
    try {
      setLoading(true);
      const entrepriseId = user.entrepriseId || 1;
      
      const response = await paiementAutomatiseService.obtenirPaiementsEntreprise(
        entrepriseId, 
        periode || null
      );
      
      setPaiements(response.paiements || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaiements();
  }, [periode]);

  const handleShowDetails = async (paiement) => {
    try {
      const response = await paiementAutomatiseService.obtenirDetailsPaiement(paiement.id);
      setSelectedPaiement(response.paiement);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const handleShowPayment = (paiement) => {
    setSelectedPaiement(paiement);
    setMontantPaye(paiement.montantDu - paiement.montantPaye);
    setMethodePaiement('ESPECES');
    setNotes('');
    setShowPaymentModal(true);
  };

  const handleMarquerPaye = async () => {
    if (!selectedPaiement || !montantPaye) return;

    setPaymentLoading(true);
    try {
      await paiementAutomatiseService.marquerCommePaye(
        selectedPaiement.id,
        parseFloat(montantPaye),
        methodePaiement,
        notes
      );

      toast.success('Paiement enregistré avec succès');
      setShowPaymentModal(false);
      loadPaiements(); // Recharger la liste
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderDetailsCalcul = (detailsCalcul) => {
    if (!detailsCalcul) return null;

    switch (detailsCalcul.type) {
      case 'JOURNALIER':
        return (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h5 className="font-medium text-blue-800">Calcul Journalier</h5>
            <div className="text-sm space-y-1">
              <div>Taux journalier: {paiementAutomatiseService.formaterMontant(detailsCalcul.tauxJournalier)}</div>
              <div>Jours travaillés: <span className="font-medium text-green-600">{detailsCalcul.joursTravailes}</span></div>
              <div>Jours d'absence: <span className="font-medium text-red-600">{detailsCalcul.joursAbsents}</span></div>
            </div>
          </div>
        );
      
      case 'HONORAIRE':
        return (
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <h5 className="font-medium text-green-800">Calcul Honoraire</h5>
            <div className="text-sm space-y-1">
              <div>Taux horaire: {paiementAutomatiseService.formaterMontant(detailsCalcul.tauxHoraire)}</div>
              <div>Heures travaillées: <span className="font-medium text-green-600">{detailsCalcul.heuresTravailes}h</span></div>
            </div>
          </div>
        );
      
      case 'FIXE':
        return (
          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
            <h5 className="font-medium text-purple-800">Calcul Salaire Fixe</h5>
            <div className="text-sm space-y-1">
              <div>Salaire mensuel: {paiementAutomatiseService.formaterMontant(detailsCalcul.salaireFixe)}</div>
              <div>Jours ouvrables: {detailsCalcul.joursOuvrables}</div>
              <div>Jours d'absence: <span className="font-medium text-red-600">{detailsCalcul.joursAbsents}</span></div>
              <div>Déduction: <span className="font-medium text-red-600">-{paiementAutomatiseService.formaterMontant(detailsCalcul.deductionAbsences)}</span></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const columns = [
    {
      header: 'Employé',
      render: (paiement) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {paiement.employe.prenom} {paiement.employe.nom}
            </div>
            <div className="text-sm text-gray-500">{paiement.employe.poste}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Période',
      render: (paiement) => {
        const [annee, mois] = paiement.periode.split('-');
        const date = new Date(parseInt(annee), parseInt(mois) - 1);
        const nomMois = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return (
          <div className="flex items-center space-x-2">
            <FaClock className="w-4 h-4 text-gray-400" />
            <span>{nomMois.charAt(0).toUpperCase() + nomMois.slice(1)}</span>
          </div>
        );
      },
    },
    {
      header: 'Type',
      render: (paiement) => (
        <Badge variant="primary">
          {paiementAutomatiseService.obtenirLabelTypeContrat(paiement.typeContrat)}
        </Badge>
      ),
    },
    {
      header: 'Montant Dû',
      render: (paiement) => (
        <span className="font-medium text-gray-900">
          {paiementAutomatiseService.formaterMontant(paiement.montantDu)}
        </span>
      ),
    },
    {
      header: 'Montant Payé',
      render: (paiement) => (
        <span className="font-medium text-green-600">
          {paiementAutomatiseService.formaterMontant(paiement.montantPaye)}
        </span>
      ),
    },
    {
      header: 'Statut',
      render: (paiement) => {
        const statut = paiementAutomatiseService.obtenirStatutAvecCouleur(paiement.statut);
        return (
          <Badge 
            variant={statut.couleur === 'green' ? 'success' : 
                    statut.couleur === 'yellow' ? 'warning' : 
                    statut.couleur === 'red' ? 'danger' : 'primary'}
          >
            {statut.label}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      render: (paiement) => (
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => handleShowDetails(paiement)}
            title="Voir les détails"
          >
            <FaEye />
          </Button>
          {paiement.statut !== 'PAYE' && paiement.statut !== 'ANNULE' && (
            <Button 
              size="sm"
              variant="success"
              onClick={() => handleShowPayment(paiement)}
              title="Enregistrer un paiement"
            >
              <FaMoneyBillWave />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaHistory className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historique des Paiements</h1>
            <p className="text-gray-600">Gestion des paiements automatisés basés sur les pointages</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Période:</label>
            </div>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les périodes</option>
              {periodes.map((p) => (
                <option key={p.valeur} value={p.valeur}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paiements</p>
                <p className="text-2xl font-bold text-gray-900">{paiements.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaHistory className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total Dû</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paiementAutomatiseService.formaterMontant(
                    paiements.reduce((sum, p) => sum + p.montantDu, 0)
                  )}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaMoneyBillWave className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Payé</p>
                <p className="text-2xl font-bold text-green-600">
                  {paiementAutomatiseService.formaterMontant(
                    paiements.reduce((sum, p) => sum + p.montantPaye, 0)
                  )}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reste à Payer</p>
                <p className="text-2xl font-bold text-red-600">
                  {paiementAutomatiseService.formaterMontant(
                    paiements.reduce((sum, p) => sum + (p.montantDu - p.montantPaye), 0)
                  )}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <FaMoneyBillWave className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tableau des paiements */}
      <Card>
        <Table 
          columns={columns}
          data={paiements}
          loading={loading}
        />
      </Card>

      {/* Modal des détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails du Paiement"
        size="lg"
      >
        {selectedPaiement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employé</label>
                <p className="text-lg font-medium">
                  {selectedPaiement.employe.prenom} {selectedPaiement.employe.nom}
                </p>
                <p className="text-sm text-gray-500">{selectedPaiement.employe.poste}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Période</label>
                <p className="text-lg font-medium">{selectedPaiement.periode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant Dû</label>
                <p className="text-xl font-bold text-gray-900">
                  {paiementAutomatiseService.formaterMontant(selectedPaiement.montantDu)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant Payé</label>
                <p className="text-xl font-bold text-green-600">
                  {paiementAutomatiseService.formaterMontant(selectedPaiement.montantPaye)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Détails du Calcul</label>
              {renderDetailsCalcul(selectedPaiement.detailsCalcul)}
            </div>

            {selectedPaiement.methodePaiement && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Méthode de Paiement</label>
                <p className="font-medium">
                  {paiementAutomatiseService.obtenirLabelMethodePaiement(selectedPaiement.methodePaiement)}
                </p>
              </div>
            )}

            {selectedPaiement.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-600">{selectedPaiement.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de paiement */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Enregistrer un Paiement"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleMarquerPaye}
              loading={paymentLoading}
              disabled={!montantPaye || paymentLoading}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        {selectedPaiement && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedPaiement.employe.prenom} {selectedPaiement.employe.nom}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Montant dû:</span>
                  <span className="ml-2 font-medium">
                    {paiementAutomatiseService.formaterMontant(selectedPaiement.montantDu)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Déjà payé:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {paiementAutomatiseService.formaterMontant(selectedPaiement.montantPaye)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à payer*
              </label>
              <input
                type="number"
                value={montantPaye}
                onChange={(e) => setMontantPaye(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Montant en FCFA"
                min="0"
                max={selectedPaiement.montantDu - selectedPaiement.montantPaye}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement*
              </label>
              <select
                value={methodePaiement}
                onChange={(e) => setMethodePaiement(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ESPECES">Espèces</option>
                <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="WAVE">Wave</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Notes sur le paiement..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoriquePaiementsPage;
