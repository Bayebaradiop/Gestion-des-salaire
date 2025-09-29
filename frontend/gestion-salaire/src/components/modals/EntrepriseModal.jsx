import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import entrepriseService from '../../services/entreprise.service';

const secteurActivites = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'education', label: 'Education' },
  { value: 'industrie', label: 'Industrie' },
  { value: 'sante', label: 'Santé' },
  { value: 'technologie', label: 'Technologie' },
  { value: 'services', label: 'Services' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' }
];

const EntrepriseModal = ({ isOpen, onClose, entreprise = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ninea: '',
    rccm: '',
    secteurActivite: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les données du formulaire si nous éditons une entreprise existante
  useEffect(() => {
    if (entreprise) {
      setFormData({
        nom: entreprise.nom || '',
        adresse: entreprise.adresse || '',
        telephone: entreprise.telephone || '',
        email: entreprise.email || '',
        ninea: entreprise.ninea || '',
        rccm: entreprise.rccm || '',
        secteurActivite: entreprise.secteurActivite || ''
      });
    } else {
      // Réinitialiser pour une nouvelle entreprise
      setFormData({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        ninea: '',
        rccm: '',
        secteurActivite: ''
      });
    }
  }, [entreprise, isOpen]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
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
    
    // Validation simple
    if (!formData.nom.trim() || !formData.email.trim() || !formData.secteurActivite) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (entreprise) {
        // Mise à jour d'une entreprise existante
        await entrepriseService.modifierEntreprise(entreprise.id, formData);
        alert('Entreprise modifiée avec succès');
      } else {
        // Création d'une nouvelle entreprise
        await entrepriseService.creerEntreprise(formData);
        alert('Entreprise ajoutée avec succès');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue: ' + (error.message || 'Erreur inconnue'));
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
      title={entreprise ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nom de l'entreprise"
            required
          />
        </div>

        <div>
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Adresse complète"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="+221 XX XXX XX XX"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact@entreprise.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ninea" className="block text-sm font-medium text-gray-700 mb-1">
              NINEA *
            </label>
            <input
              type="text"
              id="ninea"
              name="ninea"
              value={formData.ninea}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Numéro NINEA"
              required
            />
          </div>

          <div>
            <label htmlFor="rccm" className="block text-sm font-medium text-gray-700 mb-1">
              RCCM *
            </label>
            <input
              type="text"
              id="rccm"
              name="rccm"
              value={formData.rccm}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Numéro RCCM"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="secteurActivite" className="block text-sm font-medium text-gray-700 mb-1">
            Secteur d'activité *
          </label>
          <select
            id="secteurActivite"
            name="secteurActivite"
            value={formData.secteurActivite}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionnez un secteur d'activité</option>
            {secteurActivites.map(secteur => (
              <option key={secteur.value} value={secteur.value}>
                {secteur.label}
              </option>
            ))}
          </select>
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
              ? (entreprise ? 'Modification...' : 'Ajout...') 
              : (entreprise ? 'Modifier' : 'Ajouter')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EntrepriseModal;