import { useState, useEffect } from 'react';
import { usePaiement } from '../../context/PaiementContext';
import { useAuth } from '../../hooks/useAuth';
import employeService from '../../services/employe.service';

const FiltresPaiements = ({ onClose }) => {
  const { filtres, filtrerPaiements } = usePaiement();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    dateDebut: filtres.dateDebut || '',
    dateFin: filtres.dateFin || '',
    employeId: filtres.employeId || '',
    methodePaiement: filtres.methodePaiement || ''
  });

  const [employes, setEmployes] = useState([]);
  const [loadingEmployes, setLoadingEmployes] = useState(false);

  const methodesPaiement = [
    { value: '', label: 'Toutes les méthodes' },
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
    { value: 'ORANGE_MONEY', label: 'Orange Money' },
    { value: 'WAVE', label: 'Wave' },
    { value: 'AUTRE', label: 'Autre' }
  ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    filtrerPaiements(formData);
    onClose();
  };

  const handleReset = () => {
    const resetData = {
      dateDebut: '',
      dateFin: '',
      employeId: '',
      methodePaiement: ''
    };
    setFormData(resetData);
    filtrerPaiements(resetData);
    onClose();
  };

  // Raccourcis de dates
  const setRaccourciDate = (type) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    let dateDebut, dateFin;

    switch (type) {
      case 'aujourd_hui':
        dateDebut = dateFin = today.toISOString().split('T')[0];
        break;
      case 'semaine':
        const startOfWeek = new Date(year, month, day - today.getDay());
        const endOfWeek = new Date(year, month, day - today.getDay() + 6);
        dateDebut = startOfWeek.toISOString().split('T')[0];
        dateFin = endOfWeek.toISOString().split('T')[0];
        break;
      case 'mois':
        dateDebut = new Date(year, month, 1).toISOString().split('T')[0];
        dateFin = new Date(year, month + 1, 0).toISOString().split('T')[0];
        break;
      case 'trimestre':
        const quarterStart = Math.floor(month / 3) * 3;
        dateDebut = new Date(year, quarterStart, 1).toISOString().split('T')[0];
        dateFin = new Date(year, quarterStart + 3, 0).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      dateDebut,
      dateFin
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres de recherche</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Raccourcis de dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raccourcis de dates
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRaccourciDate('aujourd_hui')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setRaccourciDate('semaine')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Cette semaine
            </button>
            <button
              type="button"
              onClick={() => setRaccourciDate('mois')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Ce mois
            </button>
            <button
              type="button"
              onClick={() => setRaccourciDate('trimestre')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Ce trimestre
            </button>
          </div>
        </div>

        {/* Période */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employé */}
        <div>
          <label htmlFor="employeId" className="block text-sm font-medium text-gray-700 mb-1">
            Employé
          </label>
          <select
            id="employeId"
            name="employeId"
            value={formData.employeId}
            onChange={handleChange}
            disabled={loadingEmployes}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {loadingEmployes ? 'Chargement...' : 'Tous les employés'}
            </option>
            {employes.map(employe => (
              <option key={employe.id} value={employe.id}>
                {employe.prenom} {employe.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Méthode de paiement */}
        <div>
          <label htmlFor="methodePaiement" className="block text-sm font-medium text-gray-700 mb-1">
            Méthode de paiement
          </label>
          <select
            id="methodePaiement"
            name="methodePaiement"
            value={formData.methodePaiement}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {methodesPaiement.map(methode => (
              <option key={methode.value} value={methode.value}>
                {methode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Appliquer les filtres
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
};

export default FiltresPaiements;