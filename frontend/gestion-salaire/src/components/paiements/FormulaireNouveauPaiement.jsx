import { useState, useEffect } from 'react';
import { usePaiement } from '../../context/PaiementContext';
import employeService from '../../services/employe.service';
import bulletinPaieService from '../../services/bulletinPaie.service';
import { useAuth } from '../../hooks/useAuth';

const FormulaireNouveauPaiement = ({ onSuccess, onCancel }) => {
  const { creerPaiement } = usePaiement();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    employeId: '',
    bulletinPaieId: '',
    montant: '',
    methodePaiement: 'ESPECES',
    reference: '',
    notes: ''
  });

  const [employes, setEmployes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinSelectionne, setBulletinSelectionne] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(false);

  const methodesPaiement = [
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
    { value: 'ORANGE_MONEY', label: 'Orange Money' },
    { value: 'WAVE', label: 'Wave' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Charger les employés au montage du composant
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

  // Charger les bulletins quand un employé est sélectionné
  useEffect(() => {
    const chargerBulletins = async () => {
      if (formData.employeId) {
        try {
          setLoadingBulletins(true);
          // Récupérer les bulletins non payés ou partiellement payés de l'employé
          const response = await bulletinPaieService.listerParEmploye(formData.employeId, {
            statut: ['EN_ATTENTE', 'PARTIEL']
          });
          setBulletins(response);
        } catch (error) {
          console.error('Erreur lors du chargement des bulletins:', error);
          setBulletins([]);
        } finally {
          setLoadingBulletins(false);
        }
      } else {
        setBulletins([]);
        setBulletinSelectionne(null);
        setFormData(prev => ({ 
          ...prev, 
          bulletinPaieId: '', 
          montant: '' 
        }));
      }
    };

    chargerBulletins();
  }, [formData.employeId]);

  // Mettre à jour le montant quand un bulletin est sélectionné
  useEffect(() => {
    if (formData.bulletinPaieId) {
      const bulletin = bulletins.find(b => b.id === parseInt(formData.bulletinPaieId));
      if (bulletin) {
        setBulletinSelectionne(bulletin);
        // Calculer le montant restant à payer
        const montantRestant = bulletin.salaireNet - bulletin.montantPaye;
        setFormData(prev => ({ 
          ...prev, 
          montant: montantRestant.toString() 
        }));
      }
    } else {
      setBulletinSelectionne(null);
    }
  }, [formData.bulletinPaieId, bulletins]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bulletinPaieId || !formData.montant) {
      alert('Veuillez sélectionner un bulletin et indiquer un montant');
      return;
    }

    const montant = parseFloat(formData.montant);
    if (isNaN(montant) || montant <= 0) {
      alert('Veuillez indiquer un montant valide');
      return;
    }

    if (bulletinSelectionne) {
      const montantRestant = bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye;
      if (montant > montantRestant) {
        alert(`Le montant ne peut pas dépasser le montant restant à payer: ${formatMontant(montantRestant)}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const paiementData = {
        montant,
        methodePaiement: formData.methodePaiement,
        datePaiement: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      };

      await creerPaiement(formData.bulletinPaieId, paiementData);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection de l'employé */}
      <div>
        <label htmlFor="employeId" className="block text-sm font-medium text-gray-700 mb-2">
          Employé *
        </label>
        <select
          id="employeId"
          name="employeId"
          value={formData.employeId}
          onChange={handleChange}
          required
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

      {/* Sélection du bulletin */}
      <div>
        <label htmlFor="bulletinPaieId" className="block text-sm font-medium text-gray-700 mb-2">
          Bulletin de paie *
        </label>
        <select
          id="bulletinPaieId"
          name="bulletinPaieId"
          value={formData.bulletinPaieId}
          onChange={handleChange}
          required
          disabled={!formData.employeId || loadingBulletins}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {loadingBulletins ? 'Chargement...' : 'Sélectionner un bulletin'}
          </option>
          {bulletins.map(bulletin => (
            <option key={bulletin.id} value={bulletin.id}>
              {bulletin.cyclePaie.titre} - {formatMontant(bulletin.salaireNet)} 
              {bulletin.montantPaye > 0 && ` (Payé: ${formatMontant(bulletin.montantPaye)})`}
            </option>
          ))}
        </select>
        {formData.employeId && bulletins.length === 0 && !loadingBulletins && (
          <p className="mt-1 text-sm text-gray-500">
            Aucun bulletin en attente de paiement pour cet employé
          </p>
        )}
      </div>

      {/* Informations du bulletin sélectionné */}
      {bulletinSelectionne && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Détails du bulletin</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Salaire brut:</span>
              <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.salaireBrut)}</span>
            </div>
            <div>
              <span className="text-gray-600">Déductions:</span>
              <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.deductions)}</span>
            </div>
            <div>
              <span className="text-gray-600">Salaire net:</span>
              <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.salaireNet)}</span>
            </div>
            <div>
              <span className="text-gray-600">Déjà payé:</span>
              <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.montantPaye)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Reste à payer:</span>
              <span className="ml-2 font-bold text-green-600">
                {formatMontant(bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Montant */}
      <div>
        <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">
          Montant à payer *
        </label>
        <input
          type="number"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      {/* Méthode de paiement */}
      <div>
        <label htmlFor="methodePaiement" className="block text-sm font-medium text-gray-700 mb-2">
          Méthode de paiement *
        </label>
        <select
          id="methodePaiement"
          name="methodePaiement"
          value={formData.methodePaiement}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {methodesPaiement.map(methode => (
            <option key={methode.value} value={methode.value}>
              {methode.label}
            </option>
          ))}
        </select>
      </div>

      {/* Référence */}
      {formData.methodePaiement !== 'ESPECES' && (
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
            Référence de transaction
          </label>
          <input
            type="text"
            id="reference"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Numéro de transaction, chèque, etc."
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Remarques ou commentaires..."
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default FormulaireNouveauPaiement;