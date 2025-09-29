import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * Modal avec formulaire simple pour tester les formulaires dans les modales
 */
const SimpleFormModal = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priorite: 'normale'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.titre.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    onSave(formData);
    
    // Réinitialiser le formulaire
    setFormData({
      titre: '',
      description: '',
      priorite: 'normale'
    });
    
    onClose();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Réinitialiser le formulaire
    setFormData({
      titre: '',
      description: '',
      priorite: 'normale'
    });
    
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une note"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            type="text"
            id="titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le titre de la note"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            placeholder="Décrivez votre note..."
          />
        </div>

        <div>
          <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            id="priorite"
            name="priorite"
            value={formData.priorite}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="basse">Basse</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SimpleFormModal;