import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import employeService from '../../services/employe.service';
import { InputField, SelectField, DatePicker, CurrencyInput, CheckboxField } from '../../components/ui/FormComponents';
import { Button, Card } from '../../components/ui/PremiumComponents';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Save,
  X
} from 'lucide-react';

const PremiumAjoutEmployePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    poste: '',
    typeContrat: '',
    salaireBase: '',
    tauxJournalier: '',
    compteBancaire: '',
    dateEmbauche: '',
    estActif: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const typeContratOptions = [
    { value: 'FIXE', label: 'Contrat à Durée Indéterminée (CDI)' },
    { value: 'HONORAIRE', label: 'Contrat Honoraire' },
    { value: 'JOURNALIER', label: 'Contrat Journalier' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Étape 1 - Informations personnelles
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }
    if (formData.telephone && !/^[0-9]{8,15}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    // Étape 2 - Informations professionnelles
    if (!formData.poste.trim()) {
      newErrors.poste = 'Le poste est requis';
    }
    if (!formData.typeContrat) {
      newErrors.typeContrat = 'Le type de contrat est requis';
    }
    if (!formData.dateEmbauche) {
      newErrors.dateEmbauche = 'La date d\'embauche est requise';
    }

    // Validation du salaire selon le type de contrat
    if (formData.typeContrat === 'FIXE' || formData.typeContrat === 'HONORAIRE') {
      if (!formData.salaireBase || Number(formData.salaireBase) <= 0) {
        newErrors.salaireBase = 'Le salaire de base est requis et doit être positif';
      }
    } else if (formData.typeContrat === 'JOURNALIER') {
      if (!formData.tauxJournalier || Number(formData.tauxJournalier) <= 0) {
        newErrors.tauxJournalier = 'Le taux journalier est requis et doit être positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      const entrepriseId = user.entrepriseId || 1;

      const payload = {
        ...formData,
        entrepriseId
      };

      // Conversion des salaires/taux selon le type de contrat
      if (formData.typeContrat === 'FIXE' || formData.typeContrat === 'HONORAIRE') {
        payload.salaireBase = Number(formData.salaireBase);
        payload.tauxJournalier = null;
      } else if (formData.typeContrat === 'JOURNALIER') {
        payload.tauxJournalier = Number(formData.tauxJournalier);
        payload.salaireBase = null;
      }

      await employeService.creerEmploye(payload);
      toast.success('✨ Employé créé avec succès!');
      navigate('/employes');
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.message;
          }
        });
        setErrors(backendErrors);
      }
      
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'employé');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      const stepErrors = {};
      if (!formData.prenom.trim()) stepErrors.prenom = 'Le prénom est requis';
      if (!formData.nom.trim()) stepErrors.nom = 'Le nom est requis';
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error('Veuillez remplir tous les champs requis');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/employes')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour aux employés</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Nouvel Employé
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez un nouveau membre à votre équipe
          </p>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" className="p-6">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                initial={{ width: '0%' }}
                animate={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step 1 */}
            <div className="relative flex flex-col items-center z-10">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                  currentStep >= 1
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                1
              </motion.div>
              <span className="absolute -bottom-8 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Informations personnelles
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center z-10">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                  currentStep >= 2
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                2
              </motion.div>
              <span className="absolute -bottom-8 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Informations professionnelles
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center z-10">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                  currentStep >= 3
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                3
              </motion.div>
              <span className="absolute -bottom-8 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Informations financières
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Form */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <User className="w-7 h-7 text-indigo-600" />
                  Informations Personnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Prénom"
                    name="prenom"
                    placeholder="Ex: Jean"
                    icon={User}
                    value={formData.prenom}
                    onChange={handleChange}
                    error={errors.prenom}
                    required
                  />

                  <InputField
                    label="Nom"
                    name="nom"
                    placeholder="Ex: Dupont"
                    icon={User}
                    value={formData.nom}
                    onChange={handleChange}
                    error={errors.nom}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    helperText="Optionnel"
                  />

                  <InputField
                    label="Téléphone"
                    name="telephone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    icon={Phone}
                    value={formData.telephone}
                    onChange={handleChange}
                    error={errors.telephone}
                    helperText="Optionnel"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    icon={<ArrowLeft className="w-5 h-5 rotate-180" />}
                    iconPosition="right"
                  >
                    Suivant
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Briefcase className="w-7 h-7 text-indigo-600" />
                  Informations Professionnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Poste"
                    name="poste"
                    placeholder="Ex: Développeur Full-Stack"
                    icon={Briefcase}
                    value={formData.poste}
                    onChange={handleChange}
                    error={errors.poste}
                    required
                  />

                  <SelectField
                    label="Type de Contrat"
                    name="typeContrat"
                    options={typeContratOptions}
                    icon={FileText}
                    value={formData.typeContrat}
                    onChange={handleChange}
                    error={errors.typeContrat}
                    required
                  />
                </div>

                <DatePicker
                  label="Date d'Embauche"
                  name="dateEmbauche"
                  value={formData.dateEmbauche}
                  onChange={handleChange}
                  error={errors.dateEmbauche}
                  required
                />

                <CheckboxField
                  label="Employé actif"
                  name="estActif"
                  description="L'employé est actuellement en activité dans l'entreprise"
                  checked={formData.estActif}
                  onChange={handleChange}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    icon={<ArrowLeft className="w-5 h-5" />}
                  >
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    icon={<ArrowLeft className="w-5 h-5 rotate-180" />}
                    iconPosition="right"
                  >
                    Suivant
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Financial Information */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <DollarSign className="w-7 h-7 text-indigo-600" />
                  Informations Financières
                </h2>

                {formData.typeContrat === 'JOURNALIER' ? (
                  <CurrencyInput
                    label="Taux Journalier"
                    name="tauxJournalier"
                    placeholder="25000"
                    value={formData.tauxJournalier}
                    onChange={handleChange}
                    error={errors.tauxJournalier}
                    required
                    helperText="Montant payé par jour travaillé"
                  />
                ) : (
                  <CurrencyInput
                    label="Salaire de Base"
                    name="salaireBase"
                    placeholder="500000"
                    value={formData.salaireBase}
                    onChange={handleChange}
                    error={errors.salaireBase}
                    required
                    helperText="Salaire mensuel brut"
                  />
                )}

                <InputField
                  label="Compte Bancaire"
                  name="compteBancaire"
                  placeholder="Ex: 0123456789"
                  icon={CreditCard}
                  value={formData.compteBancaire}
                  onChange={handleChange}
                  error={errors.compteBancaire}
                  helperText="Optionnel - Pour les virements bancaires"
                />

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    icon={<ArrowLeft className="w-5 h-5" />}
                    disabled={isSubmitting}
                  >
                    Précédent
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/employes')}
                      icon={<X className="w-5 h-5" />}
                      disabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      loading={isSubmitting}
                      icon={<Save className="w-5 h-5" />}
                    >
                      Créer l'employé
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PremiumAjoutEmployePage;
