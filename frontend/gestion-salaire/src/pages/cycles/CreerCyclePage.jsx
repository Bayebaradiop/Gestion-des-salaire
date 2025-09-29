import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import cyclePaieService from '../../services/cyclePaie.service';
import { FaArrowLeft } from 'react-icons/fa';

const CyclePaieSchema = Yup.object().shape({
  nom: Yup.string()
    .required('Le nom du cycle est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  mois: Yup.number()
    .required('Le mois est requis')
    .min(1, 'Le mois doit être entre 1 et 12')
    .max(12, 'Le mois doit être entre 1 et 12'),
  annee: Yup.number()
    .required('L\'année est requise')
    .min(2020, 'L\'année doit être supérieure ou égale à 2020'),
  dateDebut: Yup.date()
    .required('La date de début est requise'),
  dateFin: Yup.date()
    .required('La date de fin est requise')
    .min(
      Yup.ref('dateDebut'),
      'La date de fin doit être postérieure à la date de début'
    )
});

const CreerCyclePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtenir l'année et le mois actuels pour les valeurs par défaut
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() est 0-indexed

  // Fonction pour obtenir le dernier jour du mois
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Fonction pour formater une date en YYYY-MM-DD
  const formatDate = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Générer les valeurs par défaut pour le cycle
  const getDefaultDates = (year, month) => {
    const firstDay = formatDate(year, month, 1);
    const lastDay = formatDate(year, month, getLastDayOfMonth(year, month));
    return { firstDay, lastDay };
  };

  // Obtenir les valeurs initiales
  const { firstDay, lastDay } = getDefaultDates(currentYear, currentMonth);
  
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const entrepriseId = user.entrepriseId || 1;
      
      // Transformer les données selon le format attendu par le backend
      const submitData = {
        titre: values.nom, // Le backend attend 'titre' mais le frontend utilise 'nom'
        periode: `${values.annee}-${String(values.mois).padStart(2, '0')}`, // Format "YYYY-MM"
        dateDebut: values.dateDebut,
        dateFin: values.dateFin
      };
      
      // Debug : afficher les données envoyées
      console.log('Données envoyées au backend:', JSON.stringify(submitData, null, 2));
      console.log('EntrepriseId:', entrepriseId);
      console.log('Types des données:', {
        titre: typeof submitData.titre,
        periode: typeof submitData.periode,
        dateDebut: typeof submitData.dateDebut,
        dateFin: typeof submitData.dateFin
      });
      
      await cyclePaieService.creerCyclePaie(entrepriseId, submitData);
      toast.success('Cycle de paie créé avec succès!');
      navigate('/cycles');
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse du serveur:', error.response?.data);
      toast.error(
        error.response?.data?.message || 
        'Erreur lors de la création du cycle de paie'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Générer les options pour les mois
  const moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  // Générer les options pour les années
  const currentYearPlus5 = currentYear + 5;
  const anneeOptions = Array.from(
    { length: currentYearPlus5 - 2020 + 1 },
    (_, i) => ({ value: 2020 + i, label: String(2020 + i) })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/cycles')}
          className="mr-4"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Créer un Cycle de Paie</h1>
      </div>

      <Card>
        <Formik
          initialValues={{
            nom: `Paie ${moisOptions[currentMonth - 1].label} ${currentYear}`,
            mois: currentMonth,
            annee: currentYear,
            dateDebut: firstDay,
            dateFin: lastDay
          }}
          validationSchema={CyclePaieSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du Cycle*
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
                  <label htmlFor="mois" className="block text-sm font-medium text-gray-700 mb-1">
                    Mois*
                  </label>
                  <Field
                    as="select"
                    id="mois"
                    name="mois"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.mois && touched.mois 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    onChange={(e) => {
                      const month = parseInt(e.target.value, 10);
                      setFieldValue('mois', month);
                      
                      // Mettre à jour les dates de début et de fin
                      const { firstDay, lastDay } = getDefaultDates(values.annee, month);
                      setFieldValue('dateDebut', firstDay);
                      setFieldValue('dateFin', lastDay);
                      
                      // Mettre à jour le nom du cycle
                      const monthName = moisOptions.find(m => m.value === month)?.label;
                      setFieldValue('nom', `Paie ${monthName} ${values.annee}`);
                    }}
                  >
                    {moisOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="mois" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
                    Année*
                  </label>
                  <Field
                    as="select"
                    id="annee"
                    name="annee"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.annee && touched.annee 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    onChange={(e) => {
                      const year = parseInt(e.target.value, 10);
                      setFieldValue('annee', year);
                      
                      // Mettre à jour les dates de début et de fin
                      const { firstDay, lastDay } = getDefaultDates(year, values.mois);
                      setFieldValue('dateDebut', firstDay);
                      setFieldValue('dateFin', lastDay);
                      
                      // Mettre à jour le nom du cycle
                      const monthName = moisOptions.find(m => m.value === values.mois)?.label;
                      setFieldValue('nom', `Paie ${monthName} ${year}`);
                    }}
                  >
                    {anneeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="annee" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de Début*
                  </label>
                  <Field
                    id="dateDebut"
                    name="dateDebut"
                    type="date"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.dateDebut && touched.dateDebut 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="dateDebut" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de Fin*
                  </label>
                  <Field
                    id="dateFin"
                    name="dateFin"
                    type="date"
                    className={`block w-full rounded-md shadow-sm sm:text-sm
                      ${errors.dateFin && touched.dateFin 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <ErrorMessage name="dateFin" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/cycles')}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Créer le cycle
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default CreerCyclePage;