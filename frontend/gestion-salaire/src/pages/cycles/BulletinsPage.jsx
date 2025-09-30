import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useBulletinPaie } from '../../context/BulletinPaieContext';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FaArrowLeft, FaFileAlt, FaMoneyBillWave, FaFileInvoice } from 'react-icons/fa';

const BulletinsPage = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { user, isCaissier } = useAuth();

  const {
    bulletins,
    currentCycle,
    isLoading,
    fetchBulletins,
    recordPayment
  } = useBulletinPaie();

  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [paiementForm, setPaiementForm] = useState({
    montant: '',
    datePaiement: new Date().toISOString().split('T')[0],
    methodePaiement: 'ESPECES',
    referenceTransaction: '',
    numeroRecu: '',
    commentaire: ''
  });

  useEffect(() => {
    fetchBulletins(cycleId);
  }, [cycleId, fetchBulletins]);

  const handleShowPaiementModal = (bulletin) => {
    setSelectedBulletin(bulletin);
    setPaiementForm({
      ...paiementForm,
      montant: bulletin.restantAPayer || bulletin.montantNet
    });
    setShowPaiementModal(true);
  };

  const handlePaiementFormChange = (e) => {
    const { name, value } = e.target;
    setPaiementForm({
      ...paiementForm,
      [name]: value
    });
  };

  const handleEnregistrerPaiement = async (e) => {
    e.preventDefault();
    if (!selectedBulletin) return;

    try {
      await recordPayment(selectedBulletin.id, paiementForm);
      setShowPaiementModal(false);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  // Fonction utilitaire pour formater les montants en devise
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour déterminer le statut de paiement d'un bulletin
  const getStatutPaiement = (bulletin) => {
    const totalPaye = bulletin.totalPaye || 0;
    const montantNet = bulletin.montantNet || 0;
    
    if (totalPaye === 0) return { status: 'EN_ATTENTE', label: 'En attente', variant: 'danger' };
    if (totalPaye < montantNet) return { status: 'PARTIEL', label: 'Partiel', variant: 'warning' };
    return { status: 'PAYE', label: 'Payé', variant: 'success' };
  };

  // Définir les colonnes du tableau
  const columns = [
    {
      header: 'Employé',
      render: (bulletin) => (
        <div>
          <div className="font-medium text-gray-900">
            {bulletin.employe?.prenom} {bulletin.employe?.nom}
          </div>
          <div className="text-sm text-gray-500">
            {bulletin.employe?.poste}
          </div>
        </div>
      ),
    },
    {
      header: 'Montant',
      render: (bulletin) => (
        <div>
          <div className="font-medium">{formatMontant(bulletin.montantNet)}</div>
          <div className="text-xs text-gray-500">
            Brut: {formatMontant(bulletin.montantBrut)}
          </div>
        </div>
      ),
    },
    {
      header: 'Paiement',
      render: (bulletin) => {
        const { status, label, variant } = getStatutPaiement(bulletin);
        return (
          <div className="flex flex-col items-start">
            <Badge variant={variant}>{label}</Badge>
            {status === 'PARTIEL' && (
              <span className="text-xs mt-1">
                {formatMontant(bulletin.totalPaye || 0)} / {formatMontant(bulletin.montantNet)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      render: (bulletin) => {
        const { status } = getStatutPaiement(bulletin);
        
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate(`/bulletins/${bulletin.id}`)}
            >
              <FaFileAlt className="mr-1" /> Détails
            </Button>
            
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => window.open(`/bulletins/${bulletin.id}/pdf`)}
            >
              <FaFileInvoice className="mr-1" /> PDF
            </Button>
            
            {isCaissier && status !== 'PAYE' && currentCycle?.statut === 'APPROUVE' && (
              <Button 
                size="sm" 
                variant="success"
                onClick={() => handleShowPaiementModal(bulletin)}
              >
                <FaMoneyBillWave className="mr-1" /> Payer
              </Button>
            )}
            
            {isCaissier && status !== 'PAYE' && currentCycle?.statut !== 'APPROUVE' && (
              <Button 
                size="sm" 
                variant="outline"
                disabled
                title="Le cycle doit être approuvé pour effectuer des paiements"
              >
                <FaMoneyBillWave className="mr-1" /> Payer
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/cycles')}
          className="mr-4"
        >
          <FaArrowLeft className="mr-2" /> Retour aux Cycles
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Bulletins de Paie
        </h1>
      </div>

      {currentCycle && (
        <div className="bg-white shadow rounded-lg">
          {/* Informations Entreprise et Cycle */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Entreprise</h3>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{currentCycle.entreprise?.nom || 'Nom de l\'entreprise'}</div>
                  <div className="text-gray-500">{currentCycle.entreprise?.adresse || 'Adresse non renseignée'}</div>
                  <div className="text-gray-500">{currentCycle.entreprise?.email || 'Email non renseigné'}</div>
                  <div className="text-gray-500">{currentCycle.entreprise?.telephone || 'Téléphone non renseigné'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Cycle de Paie</h3>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{currentCycle.titre || currentCycle.nom}</div>
                  <div className="text-gray-500">{currentCycle.periode || `${currentCycle.mois}/${currentCycle.annee}`}</div>
                  <div className="text-gray-500">
                    {currentCycle.dateDebut && currentCycle.dateFin && (
                      `Du ${new Date(currentCycle.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(currentCycle.dateFin).toLocaleDateString('fr-FR')}`
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Badge
                  variant={
                    currentCycle.statut === 'BROUILLON' ? 'default' :
                    currentCycle.statut === 'APPROUVE' ? 'primary' :
                    'success'
                  }
                >
                  {currentCycle.statut === 'BROUILLON' ? 'Brouillon' :
                   currentCycle.statut === 'APPROUVE' ? 'Approuvé' : 'Clôturé'}
                </Badge>
                
                {/* Bouton Export PDF en lot */}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => window.open(`/api/cycles/${cycleId}/bulletins/pdf`)}
                  className="mt-2"
                >
                  <FaFileInvoice className="mr-1" /> Export PDF en lot
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={bulletins} 
            emptyMessage="Aucun bulletin trouvé. Générez des bulletins pour ce cycle."
          />
        )}
      </Card>

      {/* Modal d'enregistrement de paiement */}
      <Modal
        isOpen={showPaiementModal}
        onClose={() => setShowPaiementModal(false)}
        title="Enregistrer un paiement"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowPaiementModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleEnregistrerPaiement}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Confirmer le paiement
            </Button>
          </>
        }
      >
        {selectedBulletin && (
          <form className="space-y-4">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium">
                Bulletin de {selectedBulletin.employe?.prenom} {selectedBulletin.employe?.nom}
              </h3>
              <p className="text-sm text-gray-500">
                Montant total: {formatMontant(selectedBulletin.montantNet)}
              </p>
              {selectedBulletin.totalPaye > 0 && (
                <p className="text-sm text-gray-500">
                  Déjà payé: {formatMontant(selectedBulletin.totalPaye)}
                </p>
              )}
              {selectedBulletin.restantAPayer > 0 && (
                <p className="text-sm font-medium text-blue-600">
                  Restant à payer: {formatMontant(selectedBulletin.restantAPayer)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant</label>
              <input
                type="number"
                name="montant"
                value={paiementForm.montant}
                onChange={handlePaiementFormChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={currentCycle?.statut !== 'APPROUVE'}
                required
              />
              {currentCycle?.statut !== 'APPROUVE' && (
                <p className="mt-1 text-xs text-red-600">Le cycle doit être approuvé pour effectuer des paiements</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
              <input
                type="date"
                name="datePaiement"
                value={paiementForm.datePaiement}
                onChange={handlePaiementFormChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={currentCycle?.statut !== 'APPROUVE'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
              <select
                name="methodePaiement"
                value={paiementForm.methodePaiement}
                onChange={handlePaiementFormChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={cycle?.statut !== 'APPROUVE'}
                required
              >
                <option value="ESPECES">Espèces</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Référence de transaction</label>
              <input
                type="text"
                name="referenceTransaction"
                value={paiementForm.referenceTransaction}
                onChange={handlePaiementFormChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={cycle?.statut !== 'APPROUVE'}
                placeholder="Ex: VIREMENT-12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de reçu</label>
              <input
                type="text"
                name="numeroRecu"
                value={paiementForm.numeroRecu}
                onChange={handlePaiementFormChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={cycle?.statut !== 'APPROUVE'}
                placeholder="Ex: RECU-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Commentaire</label>
              <textarea
                name="commentaire"
                value={paiementForm.commentaire}
                onChange={handlePaiementFormChange}
                rows="2"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Commentaire optionnel..."
              ></textarea>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default BulletinsPage;