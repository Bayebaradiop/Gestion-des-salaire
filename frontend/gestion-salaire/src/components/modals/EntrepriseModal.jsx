import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import entrepriseService from '../../services/entreprise.service';

const EntrepriseModal = ({ isOpen, onClose, entreprise = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    logo: '',
    adresse: '',
    telephone: '',
    email: '',
    devise: 'XOF',
    periodePaie: 'MENSUELLE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entreprise) {
      setFormData({
        nom: entreprise.nom || '',
        logo: entreprise.logo || '',
        adresse: entreprise.adresse || '',
        telephone: entreprise.telephone || '',
        email: entreprise.email || '',
        devise: entreprise.devise || 'XOF',
        periodePaie: entreprise.periodePaie || 'MENSUELLE'
      });
    } else {
      setFormData({
        nom: '',
        logo: '',
        adresse: '',
        telephone: '',
        email: '',
        devise: 'XOF',
        periodePaie: 'MENSUELLE'
      });
    }
    setErrors({});
  }, [entreprise, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = name === 'devise' ? value.toUpperCase() : value;

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Nettoyer l'erreur du champ quand l'utilisateur modifie
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim() || formData.nom.length < 2) newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    if (!formData.adresse.trim() || formData.adresse.length < 10) newErrors.adresse = 'L\'adresse doit contenir au moins 10 caractères';
    if (!formData.telephone.trim() || !/^\+?[0-9]{8,15}$/.test(formData.telephone)) newErrors.telephone = 'Téléphone invalide (+221XXXXXXXX ou 8-15 chiffres)';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.devise || !/^[A-Z]{3}$/.test(formData.devise)) newErrors.devise = 'Devise invalide (ex: XOF, USD, EUR)';
    const periodesValides = ['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE'];
    if (!formData.periodePaie || !periodesValides.includes(formData.periodePaie)) newErrors.periodePaie = 'Période de paie invalide';
    if (formData.logo && formData.logo.trim()) {
      try { new URL(formData.logo); } 
      catch { newErrors.logo = 'URL du logo invalide'; }
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
      if (entreprise) {
        await entrepriseService.modifierEntreprise(entreprise.id, formData);
        alert('Entreprise modifiée avec succès');
      } else {
        await entrepriseService.creerEntreprise(formData);
        alert('Entreprise ajoutée avec succès');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue: ' + (error.message || 'Erreur inconnue'));
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={entreprise ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
          <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Nom de l'entreprise" />
          {renderError('nom')}
        </div>

        <div>
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input type="text" id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Adresse complète" />
          {renderError('adresse')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="+221771234567" />
            {renderError('telephone')}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="contact@entreprise.com" />
            {renderError('email')}
          </div>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
          <input type="url" id="logo" name="logo" value={formData.logo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com/logo.png" />
          {renderError('logo')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="devise" className="block text-sm font-medium text-gray-700 mb-1">Devise *</label>
            <select id="devise" name="devise" value={formData.devise} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="XOF">XOF - Franc CFA</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
            </select>
            {renderError('devise')}
          </div>

          <div>
            <label htmlFor="periodePaie" className="block text-sm font-medium text-gray-700 mb-1">Période de paie *</label>
            <select id="periodePaie" name="periodePaie" value={formData.periodePaie} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="MENSUELLE">Mensuelle</option>
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="JOURNALIERE">Journalière</option>
            </select>
            {renderError('periodePaie')}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (entreprise ? 'Modification...' : 'Ajout...') : (entreprise ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EntrepriseModal;
