import React, { useEffect } from 'react';
import { useValidatedForm, FieldError } from '../../hooks/useValidatedForm';
import { employeValidationSchema, updateEmployeValidationSchema } from '../../utils/validation.schemas';
import employeService from '../../services/employe.service';
import Button from '../ui/Button';
import Card from '../ui/Card';

const EmployeFormValidated = ({ employe = null, entrepriseId, onSuccess, onCancel }) => {
  // Choisir le schéma selon le mode
  const validationSchema = employe ? updateEmployeValidationSchema : employeValidationSchema;
  
  // Valeurs par défaut
  const defaultValues = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    poste: '',
    typeContrat: 'FIXE',
    salaireBase: '',
    tauxJournalier: '',
    compteBancaire: '',
    dateEmbauche: new Date().toISOString().split('T')[0],
    entrepriseId: entrepriseId || '',
    estActif: true
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    isSubmitting,
    handleServerErrors,
    clearAllErrors,
    hasFieldError
  } = useValidatedForm(validationSchema, defaultValues);

  // Surveiller le type de contrat pour afficher les bons champs
  const typeContrat = watch('typeContrat');

  // Remplir le formulaire en mode modification
  useEffect(() => {
    if (employe) {
      reset({
        prenom: employe.prenom || '',
        nom: employe.nom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        poste: employe.poste || '',
        typeContrat: employe.typeContrat || 'FIXE',
        salaireBase: employe.salaireBase || '',
        tauxJournalier: employe.tauxJournalier || '',
        compteBancaire: employe.compteBancaire || '',
        dateEmbauche: employe.dateEmbauche ? new Date(employe.dateEmbauche).toISOString().split('T')[0] : '',
        estActif: employe.estActif ?? true
      });
    } else {
      reset(defaultValues);
    }
    clearAllErrors();
  }, [employe, reset, clearAllErrors]);

  // Gérer le changement de type de contrat
  useEffect(() => {
    // Réinitialiser les champs de salaire quand le type change
    if (typeContrat === 'JOURNALIER') {
      setValue('salaireBase', '');
    } else {
      setValue('tauxJournalier', '');
    }
  }, [typeContrat, setValue]);

  const onSubmit = async (data) => {
    try {
      // Nettoyer les données selon le type de contrat
      const cleanedData = { ...data };
      if (data.typeContrat === 'JOURNALIER') {
        cleanedData.salaireBase = null;
        cleanedData.tauxJournalier = parseFloat(data.tauxJournalier) || null;
      } else {
        cleanedData.salaireBase = parseFloat(data.salaireBase) || null;
        cleanedData.tauxJournalier = null;
      }

      // Convertir les IDs en nombres
      cleanedData.entrepriseId = parseInt(data.entrepriseId);

      let result;
      if (employe) {
        result = await employeService.modifierEmploye(employe.id, cleanedData);
      } else {
        result = await employeService.creerEmploye(cleanedData);
      }
      
      onSuccess?.(result);
      reset(defaultValues);
    } catch (error) {
      if (error.response?.data?.errors) {
        handleServerErrors(error.response.data.errors);
      } else {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Une erreur est survenue lors de la sauvegarde');
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    clearAllErrors();
    onCancel?.();
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {employe ? 'Modifier l\'employé' : 'Ajouter un employé'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Informations personnelles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register('prenom')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('prenom') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Prénom de l'employé"
                />
                <FieldError name="prenom" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register('nom')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('nom') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de l'employé"
                />
                <FieldError name="nom" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemple.com"
                />
                <FieldError name="email" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
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
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations professionnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste *
                </label>
                <input
                  type="text"
                  {...register('poste')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('poste') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Poste occupé"
                />
                <FieldError name="poste" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat *
                </label>
                <select
                  {...register('typeContrat')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('typeContrat') ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="FIXE">Salaire fixe</option>
                  <option value="JOURNALIER">Journalier</option>
                  <option value="HONORAIRE">Honoraire</option>
                </select>
                <FieldError name="typeContrat" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  {...register('dateEmbauche')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('dateEmbauche') ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <FieldError name="dateEmbauche" errors={errors} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compte bancaire
                </label>
                <input
                  type="text"
                  {...register('compteBancaire')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('compteBancaire') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Numéro de compte bancaire"
                />
                <FieldError name="compteBancaire" errors={errors} />
              </div>
            </div>
          </div>

          {/* Informations salariales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations salariales</h3>
            
            {typeContrat === 'JOURNALIER' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux journalier *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('tauxJournalier')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('tauxJournalier') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Montant par jour travaillé"
                />
                <FieldError name="tauxJournalier" errors={errors} />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire de base *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salaireBase')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasFieldError('salaireBase') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Salaire mensuel ou honoraire"
                />
                <FieldError name="salaireBase" errors={errors} />
              </div>
            )}
          </div>

          {/* Statut */}
          {employe && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="estActif"
                {...register('estActif')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="estActif" className="ml-2 block text-sm text-gray-900">
                Employé actif
              </label>
            </div>
          )}

          {/* Note d'information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
              Le type de salaire dépend du type de contrat sélectionné.
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
                employe ? 'Modifier' : 'Créer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default EmployeFormValidated;