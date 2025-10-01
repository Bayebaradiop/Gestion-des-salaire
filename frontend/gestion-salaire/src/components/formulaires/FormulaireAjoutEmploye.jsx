import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import employeService from '../../services/employe.service';
import entrepriseService from '../../services/entreprise.service';
import { useAuth } from '../../hooks/useAuth'; // <-- récupère user connecté

const EmployeModal = ({
  isOpen,
  onClose,
  employe = null,
  onSuccess,
  entrepriseId = null // ID de l'entreprise si spécifique
}) => {
  const { user } = useAuth(); // rôle et entrepriseId
  const [entreprises, setEntreprises] = useState([]);
  const [formData, setFormData] = useState({
    entrepriseId: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    typeContrat: 'FIXE',
    salaireBase: '',
    tauxJournalier: '',
    dateEmbauche: '',
    compteBancaire: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les entreprises si super-admin ET aucune entreprise spécifique
  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" && !entrepriseId) {
      entrepriseService.getEntreprises().then(res => setEntreprises(res.data));
    }
  }, [user, entrepriseId]);

  useEffect(() => {
    if (employe) {
      setFormData({
        entrepriseId: employe.entrepriseId || '',
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        poste: employe.poste || '',
        typeContrat: employe.typeContrat || 'FIXE',
        salaireBase: employe.salaireBase || '',
        tauxJournalier: employe.tauxJournalier || '',
        dateEmbauche: employe.dateEmbauche ? new Date(employe.dateEmbauche).toISOString().split('T')[0] : '',
        compteBancaire: employe.compteBancaire || ''
      });
    } else {
      setFormData({
        entrepriseId: entrepriseId || (user?.role === "ADMIN" ? user?.entrepriseId : ''),
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        poste: '',
        typeContrat: 'FIXE',
        salaireBase: '',
        tauxJournalier: '',
        dateEmbauche: '',
        compteBancaire: ''
      });
    }
    setErrors({});
  }, [employe, isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Validation inline
  const validate = () => {
    const newErrors = {};

    if (user?.role === "SUPER_ADMIN" && !entrepriseId && !formData.entrepriseId) {
      newErrors.entrepriseId = "L'entreprise est obligatoire";
    }

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    else if (formData.nom.length < 2) newErrors.nom = 'Min 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.nom)) newErrors.nom = 'Caractères invalides';

    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    else if (formData.prenom.length < 2) newErrors.prenom = 'Min 2 caractères';
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.prenom)) newErrors.prenom = 'Caractères invalides';

    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }

    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    else if (!/^\+221[0-9]{9}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format: +221XXXXXXXXX (9 chiffres après +221)';
    }

    if (!formData.poste.trim()) newErrors.poste = 'Le poste est requis';

    if (formData.typeContrat === 'FIXE' && (!formData.salaireBase || Number(formData.salaireBase) <= 0)) {
      newErrors.salaireBase = 'Salaire de base requis';
    }
    if ((formData.typeContrat === 'JOURNALIER' || formData.typeContrat === 'HONORAIRE') &&
        (!formData.tauxJournalier || Number(formData.tauxJournalier) <= 0)) {
      newErrors.tauxJournalier = 'Taux requis';
    }

    if (!formData.dateEmbauche.trim()) newErrors.dateEmbauche = 'Date requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        salaireBase: formData.salaireBase ? Number(formData.salaireBase) : undefined,
        tauxJournalier: formData.tauxJournalier ? Number(formData.tauxJournalier) : undefined,
        entrepriseId: entrepriseId || (user?.role === "ADMIN" ? user?.entrepriseId : Number(formData.entrepriseId))
      };

      if (employe) {
        await employeService.modifierEmploye(employe.id, submitData);
        alert('Employé modifié avec succès');
      } else {
        await employeService.creerEmploye(submitData);
        alert('Employé ajouté avec succès');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      
      // Gérer les erreurs de validation du backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        
        // Mapper les erreurs Zod vers les champs du formulaire
        Object.keys(backendErrors).forEach(field => {
          if (backendErrors[field]._errors && backendErrors[field]._errors.length > 0) {
            newErrors[field] = backendErrors[field]._errors[0];
          }
        });
        
        setErrors(prev => ({ ...prev, ...newErrors }));
      } else if (error.response?.data?.message) {
        // Erreurs spécifiques comme l'unicité
        const message = error.response.data.message;
        if (message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé par un autre employé' }));
        } else if (message.includes('téléphone')) {
          setErrors(prev => ({ ...prev, telephone: 'Ce numéro de téléphone est déjà utilisé' }));
        } else {
          alert('Erreur: ' + message);
        }
      } else {
        alert('Une erreur est survenue lors de l\'opération');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field) => errors[field] ? (
    <div className="mt-1 flex items-center">
      <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-600 font-medium">{errors[field]}</p>
    </div>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employe ? 'Modifier un employé' : 'Ajouter un employé'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Champ entreprise visible seulement pour super-admin ET si aucune entreprise spécifique */}
        {user?.role === "SUPER_ADMIN" && !entrepriseId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
            <select
              name="entrepriseId"
              value={formData.entrepriseId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.entrepriseId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {entreprises.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.nom}</option>
              ))}
            </select>
            {renderError('entrepriseId')}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@email.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          {renderError('email')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.prenom ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {renderError('prenom')}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {renderError('nom')}
          </div>
        </div>

        {/* Poste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poste *</label>
          <input
            type="text"
            name="poste"
            value={formData.poste}
            onChange={handleChange}
            placeholder="Poste occupé"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.poste ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          {renderError('poste')}
        </div>

        {/* Type de contrat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Contrat *</label>
          <select
            name="typeContrat"
            value={formData.typeContrat}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.typeContrat ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="FIXE">💼 Contrat fixe: Salaire mensuel régulier</option>
            <option value="JOURNALIER">📅 Journalier: Paiement par jour travaillé</option>
            <option value="HONORAIRE">🎯 Honoraire: Paiement par mission</option>
          </select>
          {renderError('typeContrat')}
        </div>

        {/* Salaire de base (si fixe ou honoraire) */}
        {(formData.typeContrat === 'FIXE' || formData.typeContrat === 'HONORAIRE') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salaire de Base (XOF) *
            </label>
            <input
              type="number"
              name="salaireBase"
              value={formData.salaireBase}
              onChange={handleChange}
              placeholder="Ex: 150000"
              min="1"
              step="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salaireBase ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            <p className="mt-1 text-xs text-gray-500">Salaire mensuel fixe</p>
            {renderError('salaireBase')}
          </div>
        )}

        {/* Taux journalier (si journalier) */}
        {formData.typeContrat === 'JOURNALIER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux Journalier (XOF) *
            </label>
            <input
              type="number"
              name="tauxJournalier"
              value={formData.tauxJournalier}
              onChange={handleChange}
              placeholder="Ex: 5000"
              min="1"
              step="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tauxJournalier ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            <p className="mt-1 text-xs text-gray-500">Montant par jour travaillé</p>
            {renderError('tauxJournalier')}
          </div>
        )}

        {/* Date d'embauche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'Embauche *</label>
          <input
            type="date"
            name="dateEmbauche"
            value={formData.dateEmbauche}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateEmbauche ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          {renderError('dateEmbauche')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Compte bancaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compte Bancaire</label>
            <input
              type="text"
              name="compteBancaire"
              value={formData.compteBancaire || ''}
              onChange={handleChange}
              placeholder="Ex: SN08 12345678901234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Format IBAN (optionnel)</p>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+221 XX XXX XX XX"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {renderError('telephone')}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (employe ? 'Modification...' : 'Ajout...') : (employe ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeModal;
