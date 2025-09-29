import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import bulletinPaieService from '../../services/bulletinPaie.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FaArrowLeft, FaFileAlt, FaMoneyBillWave, FaHistory, FaCheck } from 'react-icons/fa';

const BulletinDetailPage = () => {
  const { bulletinId } = useParams();
  const navigate = useNavigate();
  const { user, isCaissier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bulletin, setBulletin] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showPaiementsModal, setShowPaiementsModal] = useState(false);
  const [paiementForm, setPaiementForm] = useState({
    montant: '',
    datePaiement: new Date().toISOString().split('T')[0],
    methodePaiement: 'ESPECES',
    referenceTransaction: '',
    numeroRecu: '',
    commentaire: ''
  });

  useEffect(() => {
    const loadBulletin = async () => {
      try {
        setLoading(true);
        const response = await bulletinPaieService.getBulletinDetails(bulletinId);
        setBulletin(response.data);
        
        // Charger aussi les paiements
        const paiementsResponse = await bulletinPaieService.getPaiementsBulletin(bulletinId);
        setPaiements(paiementsResponse.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des données du bulletin');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBulletin();
  }, [bulletinId]);

  // Fonction utilitaire pour formater les montants en devise
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant || 0);
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    
    try {
      setLoading(true);
      await bulletinPaieService.enregistrerPaiement(bulletinId, paiementForm);
      toast.success('Paiement enregistré avec succès');
      setShowPaiementModal(false);
      
      // Recharger les données
      const paiementsResponse = await bulletinPaieService.getPaiementsBulletin(bulletinId);
      setPaiements(paiementsResponse.data);
      
      const bulletinResponse = await bulletinPaieService.getBulletinDetails(bulletinId);
      setBulletin(bulletinResponse.data);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await bulletinPaieService.getBulletinPdf(bulletinId);
      
      // Créer un lien pour télécharger le PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin_${bulletinId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erreur lors du téléchargement du PDF');
      console.error('Erreur:', error);
    }
  };
  
  const calculTotalPaye = () => {
    if (!paiements || paiements.length === 0) return 0;
    return paiements.reduce((total, paiement) => total + (paiement.montant || 0), 0);
  };
  
  const calculRestantAPayer = () => {
    if (!bulletin) return 0;
    const totalPaye = calculTotalPaye();
    return Math.max(0, (bulletin.montantNet || 0) - totalPaye);
  };
  
  // Détermine le statut de paiement
  const getStatutPaiement = () => {
    const totalPaye = calculTotalPaye();
    const montantNet = bulletin?.montantNet || 0;
    
    if (totalPaye === 0) return { status: 'EN_ATTENTE', label: 'En attente', variant: 'danger' };
    if (totalPaye < montantNet) return { status: 'PARTIEL', label: 'Partiel', variant: 'warning' };
    return { status: 'PAYE', label: 'Payé', variant: 'success' };
  };

  if (loading && !bulletin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si le bulletin n'est pas chargé et qu'on n'est plus en chargement, c'est une erreur
  if (!bulletin && !loading) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium text-red-600">Bulletin non trouvé</h3>
        <p className="mt-2 text-gray-600">Le bulletin demandé n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
      </div>
    );
  }

  const statutPaiement = getStatutPaiement();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Bulletin de Paie
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Informations du bulletin */}
        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium mb-4">Détails du bulletin</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Employé:</span>
                <span className="font-medium">{bulletin.employe?.prenom} {bulletin.employe?.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Poste:</span>
                <span>{bulletin.employe?.poste}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Période:</span>
                <span>{formatDate(bulletin.dateDebut)} au {formatDate(bulletin.dateFin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Référence:</span>
                <span>{bulletin.reference || '-'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Statut:</span>
                <Badge variant={statutPaiement.variant}>{statutPaiement.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Montant brut:</span>
                <span className="font-medium">{formatMontant(bulletin.montantBrut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Montant net:</span>
                <span className="font-medium">{formatMontant(bulletin.montantNet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date création:</span>
                <span>{formatDate(bulletin.dateCreation)}</span>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="font-medium mb-3">Rubriques du bulletin</h3>
          
          {/* Rubriques */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bulletin.rubriques && bulletin.rubriques.length > 0 ? (
                  bulletin.rubriques.map((rubrique, index) => (
                    <tr key={index} className={rubrique.type === 'DEDUCTION' ? 'bg-red-50' : 'bg-green-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{rubrique.type === 'GAIN' ? 'Gain' : 'Déduction'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{rubrique.libelle}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{rubrique.base ? formatMontant(rubrique.base) : '-'}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">{rubrique.taux ? `${rubrique.taux}%` : '-'}</td>
                      <td className="px-4 py-2 text-sm font-medium text-right text-gray-900">
                        {rubrique.type === 'DEDUCTION' ? `- ${formatMontant(rubrique.montant)}` : formatMontant(rubrique.montant)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 text-sm text-center text-gray-500">
                      Aucune rubrique disponible
                    </td>
                  </tr>
                )}

                {/* Totaux */}
                <tr className="bg-gray-100 font-medium">
                  <td colSpan="4" className="px-4 py-2 text-right text-gray-900">Total des gains:</td>
                  <td className="px-4 py-2 text-right text-green-600">
                    {formatMontant(bulletin.totalGains || bulletin.montantBrut || 0)}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-medium">
                  <td colSpan="4" className="px-4 py-2 text-right text-gray-900">Total des déductions:</td>
                  <td className="px-4 py-2 text-right text-red-600">
                    - {formatMontant(bulletin.totalDeductions || (bulletin.montantBrut - bulletin.montantNet) || 0)}
                  </td>
                </tr>
                <tr className="bg-gray-200 font-medium">
                  <td colSpan="4" className="px-4 py-2 text-right text-gray-900">Net à payer:</td>
                  <td className="px-4 py-2 text-right text-blue-700 font-bold">
                    {formatMontant(bulletin.montantNet || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Panneau latéral d'actions et de paiement */}
        <Card>
          <h2 className="text-lg font-medium mb-4">Actions</h2>
          
          <div className="space-y-6">
            {/* Statut de paiement */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-medium mb-2">Statut du paiement</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total à payer:</span>
                  <span className="font-bold">{formatMontant(bulletin.montantNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant payé:</span>
                  <span className="font-medium text-green-600">{formatMontant(calculTotalPaye())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reste à payer:</span>
                  <span className="font-medium text-blue-600">{formatMontant(calculRestantAPayer())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Statut:</span>
                  <Badge variant={statutPaiement.variant}>{statutPaiement.label}</Badge>
                </div>
              </div>
            </div>
            
            {/* Actions sur le bulletin */}
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={handleDownloadPdf}
              >
                <FaFileAlt className="mr-2" /> Télécharger PDF
              </Button>
              
              {isCaissier && statutPaiement.status !== 'PAYE' && (
                <Button 
                  variant="success" 
                  className="w-full"
                  onClick={() => {
                    setPaiementForm({
                      ...paiementForm,
                      montant: calculRestantAPayer()
                    });
                    setShowPaiementModal(true);
                  }}
                >
                  <FaMoneyBillWave className="mr-2" /> Enregistrer Paiement
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPaiementsModal(true)}
              >
                <FaHistory className="mr-2" /> Historique des Paiements
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              variant="success"
              onClick={handleEnregistrerPaiement}
              isLoading={loading}
              disabled={loading}
            >
              Confirmer le paiement
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium">
              Bulletin de {bulletin.employe?.prenom} {bulletin.employe?.nom}
            </h3>
            <p className="text-sm text-gray-500">
              Montant total: {formatMontant(bulletin.montantNet)}
            </p>
            <p className="text-sm text-gray-500">
              Déjà payé: {formatMontant(calculTotalPaye())}
            </p>
            <p className="text-sm font-medium text-blue-600">
              Restant à payer: {formatMontant(calculRestantAPayer())}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Montant</label>
            <input
              type="number"
              name="montant"
              value={paiementForm.montant}
              onChange={handlePaiementFormChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
            <input
              type="date"
              name="datePaiement"
              value={paiementForm.datePaiement}
              onChange={handlePaiementFormChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
      </Modal>

      {/* Modal de l'historique des paiements */}
      <Modal
        isOpen={showPaiementsModal}
        onClose={() => setShowPaiementsModal(false)}
        title="Historique des Paiements"
        size="lg"
        footer={
          <Button 
            variant="outline" 
            onClick={() => setShowPaiementsModal(false)}
          >
            Fermer
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paiements && paiements.length > 0 ? (
                paiements.map((paiement) => (
                  <tr key={paiement.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatDate(paiement.datePaiement)}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatMontant(paiement.montant)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{paiement.methodePaiement}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{paiement.referenceTransaction || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="xs"
                        onClick={() => window.open(`/paiements/${paiement.id}/pdf`, '_blank')}
                      >
                        <FaFileAlt className="mr-1" /> Reçu
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                    Aucun paiement enregistré pour ce bulletin
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default BulletinDetailPage;