import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import cyclePaieService from '../../services/cyclePaie.service';

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
  const [formData, setFormData] = useState({
    mois: '',
    annee: new Date().getFullYear(),
    dateDebut: '',
    dateFin: '',
    entrepriseId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les données du formulaire
  useEffect(() => {
    if (cyclePaie) {
      setFormData({
        mois: cyclePaie.mois || '',
        annee: cyclePaie.annee || new Date().getFullYear(),
        dateDebut: cyclePaie.dateDebut ? new Date(cyclePaie.dateDebut).toISOString().split('T')[0] : '',
        dateFin: cyclePaie.dateFin ? new Date(cyclePaie.dateFin).toISOString().split('T')[0] : '',
        entrepriseId: cyclePaie.entrepriseId || ''
      });
    } else {
      // Réinitialiser pour un nouveau cycle
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      setFormData({
        mois: currentMonth,
        annee: currentYear,
        dateDebut: '',
        dateFin: '',
        entrepriseId: ''
      });
    }
  }, [cyclePaie, isOpen]);

  // Auto-calculer les dates de début et fin quand le mois/année change
  useEffect(() => {
    if (formData.mois && formData.annee) {
      const firstDay = new Date(formData.annee, formData.mois - 1, 1);
      const lastDay = new Date(formData.annee, formData.mois, 0);
      
      setFormData(prev => ({
        ...prev,
        dateDebut: firstDay.toISOString().split('T')[0],
        dateFin: lastDay.toISOString().split('T')[0]
      }));
    }
  }, [formData.mois, formData.annee]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mois' || name === 'annee' ? parseInt(value) : value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validation simple
    if (!formData.mois || !formData.annee || !formData.dateDebut || !formData.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isAdmin && !formData.entrepriseId) {
      alert('Veuillez sélectionner une entreprise');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cycleData = {
        ...formData,
        mois: parseInt(formData.mois),
        annee: parseInt(formData.annee)
      };

      if (cyclePaie) {
        // Mise à jour d'un cycle existant (si votre API le supporte)
        // await cyclePaieService.modifierCyclePaie(cyclePaie.id, cycleData);
        alert('Fonctionnalité de modification non encore implémentée');
      } else {
        // Création d'un nouveau cycle
        if (isAdmin && formData.entrepriseId) {
          await cyclePaieService.creerCyclePaie(formData.entrepriseId, cycleData);
        } else {
          await cyclePaieService.creerCyclePaie(cycleData);
        }
        alert('Cycle de paie créé avec succès');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue: ' + (error.response?.data?.message || error.message || 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gérer l'annulation
  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cyclePaie ? 'Modifier le cycle de paie' : 'Créer un cycle de paie'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mois" className="block text-sm font-medium text-gray-700 mb-1">
              Mois *
            </label>
            <select
              id="mois"
              name="mois"
              value={formData.mois}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez un mois</option>
              {moisOptions.map(mois => (
                <option key={mois.value} value={mois.value}>
                  {mois.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
              Année *
            </label>
            <input
              type="number"
              id="annee"
              name="annee"
              value={formData.annee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="2020"
              max="2030"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {isAdmin && entreprises.length > 0 && (
          <div>
            <label htmlFor="entrepriseId" className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise *
            </label>
            <select
              id="entrepriseId"
              name="entrepriseId"
              value={formData.entrepriseId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
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

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Les dates de début et fin sont automatiquement calculées 
            en fonction du mois et de l'année sélectionnés.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (cyclePaie ? 'Modification...' : 'Création...') 
              : (cyclePaie ? 'Modifier' : 'Créer')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CyclePaieModal;