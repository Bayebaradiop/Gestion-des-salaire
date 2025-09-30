import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import entrepriseService from '../../services/entreprise.service';
import { createUserSchema, updateUserSchema } from '../../validators/user.validator';

const UserModal = ({ isOpen, onClose, user = null, entrepriseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'CAISSIER',
    motDePasse: '',
    estActif: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        role: user.role || 'CAISSIER',
        motDePasse: '',
        estActif: user.estActif !== undefined ? user.estActif : true
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        role: 'CAISSIER',
        motDePasse: '',
        estActif: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      delete newErrors.general;
      return newErrors;
    });
  };

  // Validation inline inspirée des schémas Zod
  const validate = () => {
    const newErrors = {};

    // Nom
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    else if (formData.nom.length < 2) newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.nom)) newErrors.nom = 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets';

    // Prénom
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
    else if (formData.prenom.length < 2) newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.prenom)) newErrors.prenom = 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets';

    // Email
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format d'email invalide";

    // Rôle
    if (!formData.role) newErrors.role = 'Le rôle est obligatoire';

    // Mot de passe (création ou modification avec nouveau mot de passe)
    if (!user && (!formData.motDePasse || formData.motDePasse.length < 6)) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = { ...formData };
      if (user && (!submitData.motDePasse || !submitData.motDePasse.trim())) {
        delete submitData.motDePasse;
      }

      if (user) {
        // Appel à ton service backend pour modifier l'utilisateur
        await entrepriseService.modifierUtilisateurEntreprise(entrepriseId, user.id, submitData);
      } else {
        // Appel à ton service backend pour créer l'utilisateur
        await entrepriseService.creerUtilisateurEntreprise(entrepriseId, submitData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const renderError = (field) => errors[field] ? (
    <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
  ) : null;

  const getInputClassName = (field) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500";
    return errors[field] ? `${baseClass} border-red-300 bg-red-50` : `${baseClass} border-gray-300`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} className={getInputClassName('nom')} placeholder="Nom de l'utilisateur" />
            {renderError('nom')}
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} className={getInputClassName('prenom')} placeholder="Prénom de l'utilisateur" />
            {renderError('prenom')}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={getInputClassName('email')} placeholder="email@exemple.com" />
          {renderError('email')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={getInputClassName('role')}>
              <option value="CAISSIER">Caissier</option>
              <option value="ADMIN">Administrateur</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {renderError('role')}
          </div>

          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe {user ? '(laisser vide pour ne pas changer)' : '*'}
            </label>
            <input type="password" id="motDePasse" name="motDePasse" value={formData.motDePasse} onChange={handleChange} className={getInputClassName('motDePasse')} placeholder={user ? 'Nouveau mot de passe' : 'Mot de passe'} />
            {renderError('motDePasse')}
          </div>
        </div>

        {user && (
          <div className="flex items-center">
            <input type="checkbox" id="estActif" name="estActif" checked={formData.estActif} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="estActif" className="ml-2 block text-sm text-gray-900">Utilisateur actif</label>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (user ? 'Modification...' : 'Ajout...') : (user ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
