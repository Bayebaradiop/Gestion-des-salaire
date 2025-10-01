import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import employeService from '../../services/employe.service';
import { formatBackendErrors, extractMainErrorMessage, validateEmployeData } from '../../utils/errorHandling';
import { FaArrowLeft } from 'react-icons/fa';

const EmployeSchema = Yup.object().shape({
  prenom: Yup.string()
    .required('Le prénom est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  nom: Yup.string()
    .required('Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: Yup.string()
    .email('Adresse email invalide')
    .nullable(),
  telephone: Yup.string()
    .nullable(),
  poste: Yup.string()
    .required('Le poste est requis'),
  typeContrat: Yup.string()
    .required('Le type de contrat est requis'),
  salaireBase: Yup.number()
    .when('typeContrat', {
      is: (val) => val === 'FIXE' || val === 'HONORAIRE',
      then: (schema) => schema.required('Le salaire de base est requis pour ce type de contrat'),
      otherwise: (schema) => schema.nullable()
    })
    .positive('Le salaire doit être positif'),
  tauxJournalier: Yup.number()
    .when('typeContrat', {
      is: 'JOURNALIER',
      then: (schema) => schema.required('Le taux journalier est requis pour les contrats journaliers'),
      otherwise: (schema) => schema.nullable()
    })
    .positive('Le taux journalier doit être positif'),
  compteBancaire: Yup.string()
    .nullable(),
  dateEmbauche: Yup.date()
    .required('La date d\'embauche est requise')
});

const AjoutEmployePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setIsSubmitting(true);
      
      // Validation côté client d'abord
      const validation = validateEmployeData(values);
      if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
          setFieldError(field, validation.errors[field]);
        });
        return;
      }
      
      const entrepriseId = user.entrepriseId || 1;

      const payload = {
        ...values,
        entrepriseId
      };

      // Conversion des salaires/taux selon le type de contrat
      if (values.typeContrat === 'FIXE' || values.typeContrat === 'HONORAIRE') {
        payload.salaireBase = values.salaireBase ? Number(values.salaireBase) : null;
        payload.tauxJournalier = null; // Explicit null pour les contrats fixes/honoraires
      } else if (values.typeContrat === 'JOURNALIER') {
        payload.tauxJournalier = values.tauxJournalier ? Number(values.tauxJournalier) : null;
        payload.salaireBase = null; // Explicit null pour les contrats journaliers
      }

      console.log('Payload envoyé:', payload); // Pour déboggage

      await employeService.creerEmploye(payload);
      toast.success('Employé créé avec succès!');
      navigate('/employes');
    } catch (error) {
      console.error('Erreur:', error);
      
      // Gérer les erreurs de validation du backend
      const backendErrors = formatBackendErrors(error);
      Object.keys(backendErrors).forEach(field => {
        setFieldError(field, backendErrors[field]);
      });
      
      // Afficher le message d'erreur principal
      const mainErrorMessage = extractMainErrorMessage(error);
      toast.error(mainErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/employes')}
          className="mr-4"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un Employé</h1>
      </div>

      <Card>
        <Formik
          initialValues={{
            prenom: '',
            nom: '',
            email: '',
            telephone: '',
            poste: '',
            typeContrat: 'FIXE',
            salaireBase: '',
            tauxJournalier: '',
            compteBancaire: '',
            dateEmbauche: new Date().toISOString().split('T')[0]
          }}
          validationSchema={EmployeSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.email && touched.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom*
                  </label>
                  <Field
                    id="prenom"
                    name="prenom"
                    type="text"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.prenom && touched.prenom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="prenom" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                  </label>
                  <Field
                    id="nom"
                    name="nom"
                    type="text"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.nom && touched.nom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="nom" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-1">
                    Poste*
                  </label>
                  <Field
                    id="poste"
                    name="poste"
                    type="text"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.poste && touched.poste 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="poste" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="typeContrat" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de Contrat*
                  </label>
                  <Field
                    as="select"
                    id="typeContrat"
                    name="typeContrat"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.typeContrat && touched.typeContrat 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  >
                    <option value="FIXE">Fixe</option>
                    <option value="JOURNALIER">Journalier</option>
                    <option value="HONORAIRE">Honoraire</option>
                  </Field>
                  <ErrorMessage name="typeContrat" component="p" className="mt-1 text-sm text-red-600" />
                  
                  {/* Aide contextuelle selon le type de contrat */}
                  {values.typeContrat && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        {values.typeContrat === 'FIXE' && 
                          '💼 Contrat fixe: Salaire mensuel régulier'}
                        {values.typeContrat === 'JOURNALIER' && 
                          '📅 Contrat journalier: Rémunération par jour travaillé'}
                        {values.typeContrat === 'HONORAIRE' && 
                          '💡 Honoraires: Tarif journalier pour prestations ponctuelles'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Champ Salaire de Base - Affiché uniquement pour les contrats FIXE */}
                {values.typeContrat === 'FIXE' && (
                  <div>
                    <label htmlFor="salaireBase" className="block text-sm font-medium text-gray-700 mb-1">
                      Salaire de Base (XOF)*
                    </label>
                    <Field
                      id="salaireBase"
                      name="salaireBase"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Ex: 150000"
                      className={`block w-full rounded-md shadow-sm sm:text-sm
                        ${errors.salaireBase && touched.salaireBase 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    <ErrorMessage name="salaireBase" component="p" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-xs text-gray-500">Salaire mensuel fixe</p>
                  </div>
                )}

                {/* Champ Taux Journalier - Affiché pour JOURNALIER et HONORAIRE */}
                {(values.typeContrat === 'JOURNALIER' || values.typeContrat === 'HONORAIRE') && (
                  <div>
                    <label htmlFor="tauxJournalier" className="block text-sm font-medium text-gray-700 mb-1">
                      Taux Journalier (XOF)*
                    </label>
                    <Field
                      id="tauxJournalier"
                      name="tauxJournalier"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Ex: 5000"
                      className={`block w-full rounded-md shadow-sm sm:text-sm
                        ${errors.tauxJournalier && touched.tauxJournalier 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    <ErrorMessage name="tauxJournalier" component="p" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-xs text-gray-500">
                      {values.typeContrat === 'JOURNALIER' 
                        ? 'Rémunération par jour travaillé' 
                        : 'Tarif journalier pour les honoraires'}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="dateEmbauche" className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'Embauche*
                  </label>
                  <Field
                    id="dateEmbauche"
                    name="dateEmbauche"
                    type="date"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.dateEmbauche && touched.dateEmbauche 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="dateEmbauche" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="compteBancaire" className="block text-sm font-medium text-gray-700 mb-1">
                    Compte Bancaire
                  </label>
                  <Field
                    id="compteBancaire"
                    name="compteBancaire"
                    type="text"
                    placeholder="Ex: SN08 12345678901234567890"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.compteBancaire && touched.compteBancaire 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="compteBancaire" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Field
                    id="telephone"
                    name="telephone"
                    type="tel"
                    placeholder="+221 XX XXX XX XX"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.telephone && touched.telephone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="telephone" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/employes')}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Créer l'employé
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default AjoutEmployePage;