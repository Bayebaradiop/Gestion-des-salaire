import React, { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';
import { useValidatedForm, FieldError } from '../../hooks/useValidatedForm';
import { entrepriseValidationSchema, updateEntrepriseValidationSchema } from '../../utils/validation.schemas';
import entrepriseService from '../../services/entreprise.service';

const EntrepriseModalValidated = ({ isOpen, onClose, entreprise = null, onSuccess }) => {
  // Choisir le schéma de validation selon le mode (création/modification)
  const validationSchema = entreprise ? updateEntrepriseValidationSchema : entrepriseValidationSchema;
  
  // Valeurs par défaut du formulaire
  const defaultValues = {
    nom: '',
    logo: '',
    adresse: '',
    telephone: '',
    email: '',
    devise: 'XOF',
    periodePaie: 'MENSUELLE'
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    isSubmitting,
    handleServerErrors,
    clearAllErrors,
    getFieldError,
    hasFieldError
  } = useValidatedForm(validationSchema, defaultValues);

  // Effet pour remplir le formulaire en mode modification
  useEffect(() => {
    if (entreprise && isOpen) {
      reset({
        nom: entreprise.nom || '',
        logo: entreprise.logo || '',
        adresse: entreprise.adresse || '',
        telephone: entreprise.telephone || '',
        email: entreprise.email || '',
        devise: entreprise.devise || 'XOF',
        periodePaie: entreprise.periodePaie || 'MENSUELLE'
      });
    } else if (isOpen) {
      reset(defaultValues);
    }
    clearAllErrors();
  }, [entreprise, isOpen, reset, clearAllErrors]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data) => {
    try {
      let result;
      if (entreprise) {
        result = await entrepriseService.modifierEntreprise(entreprise.id, data);
      } else {
        result = await entrepriseService.creerEntreprise(data);
      }
      
      // Succès
      onSuccess?.(result);
      onClose();
      reset(defaultValues);
    } catch (error) {
      // Gérer les erreurs de validation du serveur
      if (error.response?.data?.errors) {
        handleServerErrors(error.response.data.errors);
      } else {
        console.error('Erreur lors de la sauvegarde:', error);
        // Afficher un message d'erreur générique
        alert('Une erreur est survenue lors de la sauvegarde');
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    clearAllErrors();
    onClose();
  };

  const handleLogoUpload = (logoUrl) => {
    setValue('logo', logoUrl, { shouldValidate: true });
  };

  // Surveiller les changements du logo pour l'affichage
  const currentLogo = watch('logo');

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title={entreprise ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'} 
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Nom de l'entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            {...register('nom')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasFieldError('nom') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nom de l'entreprise"
          />
          <FieldError name="nom" errors={errors} />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo de l'entreprise
          </label>
          <ImageUpload
            onUpload={handleLogoUpload}
            currentImage={currentLogo}
            className="w-full"
          />
          <FieldError name="logo" errors={errors} />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <textarea
            {...register('adresse')}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasFieldError('adresse') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Adresse complète de l'entreprise"
          />
          <FieldError name="adresse" errors={errors} />
        </div>

        {/* Téléphone et Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              {...register('telephone')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasFieldError('telephone') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+221701234567"
            />
            <FieldError name="telephone" errors={errors} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasFieldError('email') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contact@entreprise.com"
            />
            <FieldError name="email" errors={errors} />
          </div>
        </div>

        {/* Devise et Période de paie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Devise *
            </label>
            <select
              {...register('devise')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasFieldError('devise') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="XOF">XOF (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar US)</option>
              <option value="CFA">CFA</option>
            </select>
            <FieldError name="devise" errors={errors} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période de paie *
            </label>
            <select
              {...register('periodePaie')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasFieldError('periodePaie') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="MENSUELLE">Mensuelle</option>
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="JOURNALIERE">Journalière</option>
            </select>
            <FieldError name="periodePaie" errors={errors} />
          </div>
        </div>

        {/* Note d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
            {entreprise ? ' Les modifications seront appliquées immédiatement.' : ' Une fois créée, l\'entreprise sera activée par défaut.'}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
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
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </div>
            ) : (
              entreprise ? 'Modifier' : 'Créer'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EntrepriseModalValidated;