import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import employeService from '../../services/employe.service';

const EmployeModalSuperAdmin = ({
  isOpen,
  onClose,
  employe = null,
  entrepriseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    typeContrat: 'FIXE',
    salaireBase: '',
    tauxJournalier: '',
    dateEmbauche: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employe) {
      setFormData({
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        poste: employe.poste || '',
        typeContrat: employe.typeContrat || 'FIXE',
        salaireBase: employe.salaireBase || '',
        tauxJournalier: employe.tauxJournalier || '',
        dateEmbauche: employe.dateEmbauche ? new Date(employe.dateEmbauche).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        poste: '',
        typeContrat: 'FIXE',
        salaireBase: '',
        tauxJournalier: '',
        dateEmbauche: ''
      });
    }
    setErrors({});
  }, [employe, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Validation inline
  const validate = () => {
    const newErrors = {};

    // Nom
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    else if (formData.nom.length < 2) newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.nom)) newErrors.nom = 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets';

    // Prénom
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    else if (formData.prenom.length < 2) newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.prenom)) newErrors.prenom = 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets';

    // Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Téléphone
    if (formData.telephone && !/^\+?[0-9]{8,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide (8-15 chiffres, + optionnel)';
    }

    // Poste
    if (!formData.poste.trim()) newErrors.poste = 'Le poste est requis';
    else if (formData.poste.length < 2) newErrors.poste = 'Le poste doit contenir au moins 2 caractères';

    // Contrat et salaire
    if (formData.typeContrat === 'FIXE' && (!formData.salaireBase || Number(formData.salaireBase) < 0)) {
      newErrors.salaireBase = 'Salaire de base requis et doit être positif';
    }
    if ((formData.typeContrat === 'JOURNALIER' || formData.typeContrat === 'HONORAIRE') &&
        (!formData.tauxJournalier || Number(formData.tauxJournalier) < 0)) {
      newErrors.tauxJournalier = 'Taux journalier requis et doit être positif';
    }

    // Date embauche
    if (!formData.dateEmbauche.trim()) newErrors.dateEmbauche = 'La date d\'embauche est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        salaireBase: formData.salaireBase ? Number(formData.salaireBase) : undefined,
        tauxJournalier: formData.tauxJournalier ? Number(formData.tauxJournalier) : undefined,
        entrepriseId: Number(entrepriseId)
      };

      if (employe) {
        await employeService.modifierEmploye(employe.id, submitData);
        alert('Employé modifié avec succès');
      } else {
        await employeService.creerEmploye(entrepriseId, submitData);
        alert('Employé ajouté avec succès');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert('Une erreur est survenue: ' + errorMessage);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employe ? 'Modifier un employé' : 'Ajouter un employé'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} className={getInputClassName('nom')} placeholder="Nom" />
            {renderError('nom')}
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} className={getInputClassName('prenom')} placeholder="Prénom" />
            {renderError('prenom')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={getInputClassName('email')} placeholder="email@exemple.com" />
            {renderError('email')}
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} className={getInputClassName('telephone')} placeholder="+221 XX XXX XX XX" />
            {renderError('telephone')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-1">Poste *</label>
            <input type="text" id="poste" name="poste" value={formData.poste} onChange={handleChange} className={getInputClassName('poste')} placeholder="Poste" />
            {renderError('poste')}
          </div>

          <div>
            <label htmlFor="typeContrat" className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
            <select id="typeContrat" name="typeContrat" value={formData.typeContrat} onChange={handleChange} className={getInputClassName('typeContrat')}>
              <option value="FIXE">Fixe</option>
              <option value="JOURNALIER">Journalier</option>
              <option value="HONORAIRE">Honoraire</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.typeContrat === 'FIXE' && (
            <div>
              <label htmlFor="salaireBase" className="block text-sm font-medium text-gray-700 mb-1">Salaire de base *</label>
              <input type="number" id="salaireBase" name="salaireBase" value={formData.salaireBase} onChange={handleChange} className={getInputClassName('salaireBase')} min="0" step="1000" placeholder="0" />
              {renderError('salaireBase')}
            </div>
          )}

          {(formData.typeContrat === 'JOURNALIER' || formData.typeContrat === 'HONORAIRE') && (
            <div>
              <label htmlFor="tauxJournalier" className="block text-sm font-medium text-gray-700 mb-1">Taux journalier *</label>
              <input type="number" id="tauxJournalier" name="tauxJournalier" value={formData.tauxJournalier} onChange={handleChange} className={getInputClassName('tauxJournalier')} min="0" step="100" placeholder="0" />
              {renderError('tauxJournalier')}
            </div>
          )}

          <div>
            <label htmlFor="dateEmbauche" className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche *</label>
            <input type="date" id="dateEmbauche" name="dateEmbauche" value={formData.dateEmbauche} onChange={handleChange} className={getInputClassName('dateEmbauche')} />
            {renderError('dateEmbauche')}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? (employe ? 'Modification...' : 'Ajout...') : (employe ? 'Modifier' : 'Ajouter')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeModalSuperAdmin;
