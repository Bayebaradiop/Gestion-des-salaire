import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import employeService from '../../services/employe.service';

// Schéma de validation pour le formulaire
const employeSchema = Yup.object().shape({
  nom: Yup.string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: Yup.string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est obligatoire'),
  telephone: Yup.string()
    .required('Le numéro de téléphone est obligatoire')
    .matches(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
  adresse: Yup.string().required('L\'adresse est obligatoire'),
  poste: Yup.string().required('Le poste est obligatoire'),
  dateEmbauche: Yup.date().required('La date d\'embauche est obligatoire'),
  salaire: Yup.number()
    .typeError('Le salaire doit être un nombre')
    .positive('Le salaire doit être positif')
    .required('Le salaire est obligatoire'),
  entrepriseId: Yup.number().required('L\'entreprise est obligatoire'),
});

const EmployeModal = ({ 
  isOpen, 
  onClose, 
  employe = null, 
  entreprises = [],
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    poste: '',
    dateEmbauche: '',
    salaire: '',
    entrepriseId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les données du formulaire si nous éditons un employé existant
  useEffect(() => {
    if (employe) {
      setFormData({
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        adresse: employe.adresse || '',
        poste: employe.poste || '',
        dateEmbauche: employe.dateEmbauche ? new Date(employe.dateEmbauche).toISOString().split('T')[0] : '',
        salaire: employe.salaire || '',
        entrepriseId: employe.entrepriseId || ''
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel employé
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        poste: '',
        dateEmbauche: '',
        salaire: '',
        entrepriseId: ''
      });
    }
  }, [employe, isOpen]);

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
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (employe) {
        // Mise à jour d'un employé existant
        await employeService.modifierEmploye(employe.id, formData);
        alert('Employé modifié avec succès');
      } else {
        // Création d'un nouvel employé
        const entrepriseId = formData.entrepriseId || (entreprises.length > 0 ? entreprises[0].id : null);
        if (!entrepriseId) {
          alert('Veuillez sélectionner une entreprise');
          return;
        }
        await employeService.creerEmploye(entrepriseId, formData);
        alert('Employé ajouté avec succès');
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
      title={employe ? 'Modifier un employé' : 'Ajouter un employé'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de l'employé"
              required
            />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Prénom de l'employé"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="email@exemple.com"
              required
            />
          </div>

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
            <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-1">
              Poste *
            </label>
            <input
              type="text"
              id="poste"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Intitulé du poste"
              required
            />
          </div>

          <div>
            <label htmlFor="dateEmbauche" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'embauche *
            </label>
            <input
              type="date"
              id="dateEmbauche"
              name="dateEmbauche"
              value={formData.dateEmbauche}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salaire" className="block text-sm font-medium text-gray-700 mb-1">
              Salaire mensuel *
            </label>
            <input
              type="number"
              id="salaire"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          {entreprises.length > 0 && (
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
              ? (employe ? 'Modification...' : 'Ajout...') 
              : (employe ? 'Modifier' : 'Ajouter')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeModal;