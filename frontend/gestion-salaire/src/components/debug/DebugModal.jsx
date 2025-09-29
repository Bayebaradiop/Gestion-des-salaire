import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Composant de débogage pour détecter les problèmes avec les modales et formulaires
 */
const DebugModal = () => {
  const [debugInfo, setDebugInfo] = useState({
    document: typeof document !== 'undefined',
    body: typeof document !== 'undefined' && document.body !== null,
    root: typeof document !== 'undefined' && document.getElementById('root') !== null,
    portalsSupported: typeof document !== 'undefined' && typeof document.createElement === 'function',
  });

  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    const checkDOMElements = () => {
      try {
        const info = {
          document: typeof document !== 'undefined',
          body: typeof document !== 'undefined' && document.body !== null,
          root: typeof document !== 'undefined' && document.getElementById('root') !== null,
          portalsSupported: typeof document !== 'undefined' && typeof document.createElement === 'function',
        };
        setDebugInfo(info);
        console.log('Informations de débogage DOM:', info);

        if (!info.body) {
          console.error('document.body n\'est pas disponible!');
        }
      } catch (err) {
        console.error('Erreur lors du débogage DOM:', err);
      }
    };

    checkDOMElements();
    // Vérifier après un court délai pour s'assurer que le DOM est complètement chargé
    const timer = setTimeout(checkDOMElements, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleShowModal = () => {
    try {
      setShowTestModal(true);
      console.log('Tentative d\'affichage de la modale de test');
    } catch (err) {
      console.error('Erreur lors de l\'affichage de la modale de test:', err);
      toast.error('Erreur lors de l\'affichage de la modale');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleShowModal}
        className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-purple-700"
      >
        Test Modal
      </button>

      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Modal de Test</h2>
            <p>Si vous voyez cette modale, les modales fonctionnent correctement!</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTestModal(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-16 right-4 bg-white p-3 rounded shadow-lg text-xs">
        <h4 className="font-bold">Diagnostic DOM:</h4>
        <ul>
          <li>document: {debugInfo.document ? '✅' : '❌'}</li>
          <li>document.body: {debugInfo.body ? '✅' : '❌'}</li>
          <li>root element: {debugInfo.root ? '✅' : '❌'}</li>
          <li>portails: {debugInfo.portalsSupported ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugModal;