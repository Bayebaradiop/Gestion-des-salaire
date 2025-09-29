import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const moisOptions = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

const CyclePaieModal = ({ 
  isOpen, 
  onClose, 
  cyclePaie = null, 
  entreprises = [],
  isAdmin = false,
  onSuccess 
}) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    mois: '',
    annee: currentYear,
    dateDebut: '',
    dateFin: '',
    entrepriseId: ''
  });

  // Générer les options d'années (année courante et 2 ans avant/après)
  const anneeOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (isOpen) {
      if (cyclePaie) {
        setFormData({
          mois: cyclePaie.mois || '',
          annee: cyclePaie.annee || currentYear,
          dateDebut: cyclePaie.dateDebut ? new Date(cyclePaie.dateDebut).toISOString().split('T')[0] : '',
          dateFin: cyclePaie.dateFin ? new Date(cyclePaie.dateFin).toISOString().split('T')[0] : '',
          entrepriseId: cyclePaie.entrepriseId || ''
        });
      } else {
        setFormData({
          mois: '',
          annee: currentYear,
          dateDebut: '',
          dateFin: '',
          entrepriseId: ''
        });
      }
    }
  }, [isOpen, cyclePaie, currentYear]);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) return;
    
    // Validation basique
    if (!formData.mois || !formData.annee || !formData.dateDebut || !formData.dateFin) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isAdmin && !formData.entrepriseId) {
      toast.error('Veuillez sélectionner une entreprise');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiService = await import('../../services/cyclePaie.service');
      
      // Préparer les données selon le format attendu par le backend
      const mois = parseInt(formData.mois);
      const annee = parseInt(formData.annee);
      const moisName = moisOptions.find(m => m.value === mois)?.label || mois;
      
      const submitData = {
        titre: `Paie ${moisName} ${annee}`,
        periode: `${annee}-${String(mois).padStart(2, '0')}`,
        mois: mois,
        annee: annee,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin
      };

      // Ajouter l'entrepriseId seulement si c'est un admin
      if (isAdmin) {
        submitData.entrepriseId = parseInt(formData.entrepriseId);
      }
      
      if (cyclePaie) {
        await apiService.default.modifierCyclePaie(cyclePaie.id, submitData);
        toast.success('Cycle de paie modifié avec succès');
      } else {
        // Pour la création, on utilise l'entrepriseId de l'utilisateur connecté ou celui sélectionné pour les admins
        const entrepriseId = isAdmin ? submitData.entrepriseId : (user.entrepriseId || 1);
        await apiService.default.creerCyclePaie(entrepriseId, submitData);
        toast.success('Cycle de paie créé avec succès');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cyclePaie ? 'Modifier un cycle de paie' : 'Créer un nouveau cycle de paie'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mois */}
          <div>
            <label htmlFor="mois" className="block text-sm font-medium text-gray-700 mb-1">
              Mois *
            </label>
            <select
              id="mois"
              name="mois"
              value={formData.mois}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un mois</option>
              {moisOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div>
            <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
              Année *
            </label>
            <select
              id="annee"
              name="annee"
              value={formData.annee}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {anneeOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Entreprise (seulement pour les admins) */}
          {isAdmin && (
            <div className="md:col-span-2">
              <label htmlFor="entrepriseId" className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise *
              </label>
              <select
                id="entrepriseId"
                name="entrepriseId"
                value={formData.entrepriseId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez une entreprise</option>
                {entreprises.map(entreprise => (
                  <option key={entreprise.id} value={entreprise.id}>
                    {entreprise.nom}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Traitement...' : (cyclePaie ? 'Modifier' : 'Créer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CyclePaieModal;