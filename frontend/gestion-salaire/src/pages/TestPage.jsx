import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FormComponent from '../components/ui/FormComponent';
import * as Yup from 'yup';

// Schéma de validation simple pour les tests
const testSchema = Yup.object().shape({
  nom: Yup.string().required('Le nom est obligatoire'),
  email: Yup.string().email('Email invalide').required('L\'email est obligatoire'),
  message: Yup.string().required('Le message est obligatoire')
});

const TestPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Valeurs initiales du formulaire de test
  const initialValues = {
    nom: '',
    email: '',
    message: ''
  };

  // Configuration des champs du formulaire de test
  const formFields = [
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Votre nom',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'votre@email.com',
      required: true
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Votre message...',
      required: true
    }
  ];

  // Fonction de test pour les boutons
  const handleButtonTest = (buttonName) => {
    toast.success(`Bouton "${buttonName}" cliqué avec succès !`);
    console.log(`Test du bouton: ${buttonName}`);
  };

  // Fonction de soumission du formulaire de test
  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Données du formulaire:', values);
      toast.success('Formulaire soumis avec succès !');
      resetForm();
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Page de Test des Composants</h1>
      
      {/* Section des boutons de test */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test des Boutons</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Button 
            variant="primary" 
            onClick={() => handleButtonTest('Primary')}
          >
            Primary
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => handleButtonTest('Secondary')}
          >
            Secondary
          </Button>
          
          <Button 
            variant="success" 
            onClick={() => handleButtonTest('Success')}
          >
            Success
          </Button>
          
          <Button 
            variant="danger" 
            onClick={() => handleButtonTest('Danger')}
          >
            Danger
          </Button>
          
          <Button 
            variant="warning" 
            onClick={() => handleButtonTest('Warning')}
          >
            Warning
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleButtonTest('Outline')}
          >
            Outline
          </Button>
          
          <Button 
            variant="primary" 
            isLoading={true}
            onClick={() => handleButtonTest('Loading')}
          >
            Loading
          </Button>
          
          <Button 
            variant="primary" 
            disabled={true}
            onClick={() => handleButtonTest('Disabled')}
          >
            Disabled
          </Button>
        </div>
      </div>

      {/* Section des modales de test */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test des Modales</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
          >
            Ouvrir Modal Simple
          </Button>
          
          <Button 
            variant="success" 
            onClick={() => setIsFormModalOpen(true)}
          >
            Ouvrir Modal avec Formulaire
          </Button>
        </div>
      </div>

      {/* Informations de débogage */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Informations de Débogage</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Modal Simple Ouverte:</strong> {isModalOpen ? 'Oui' : 'Non'}</p>
          <p><strong>Modal Formulaire Ouverte:</strong> {isFormModalOpen ? 'Oui' : 'Non'}</p>
          <p><strong>Date/Heure:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Modal simple */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal de Test Simple"
        size="md"
      >
        <div className="space-y-4">
          <p>Cette modal de test contient plusieurs boutons pour vérifier leur fonctionnement :</p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => handleButtonTest('Modal Primary')}
            >
              Test 1
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleButtonTest('Modal Secondary')}
            >
              Test 2
            </Button>
            
            <Button 
              variant="success" 
              size="sm"
              onClick={() => handleButtonTest('Modal Success')}
            >
              Test 3
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="w-full"
            >
              Fermer Modal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal avec formulaire */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Modal de Test avec Formulaire"
        size="lg"
      >
        <FormComponent
          initialValues={initialValues}
          validationSchema={testSchema}
          onSubmit={handleFormSubmit}
          fields={formFields}
          submitText="Envoyer"
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default TestPage;