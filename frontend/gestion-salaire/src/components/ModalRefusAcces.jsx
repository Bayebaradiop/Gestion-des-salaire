import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ModalRefusAcces = ({ 
  isOpen, 
  onClose, 
  message = "Vous n'avez pas accès à cette entreprise",
  raison = "L'administrateur de cette entreprise a bloqué l'accès aux Super-Admins"
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec icône d'alerte */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Accès Refusé
              </h3>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenu du message */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 font-medium mb-2">
                {message}
              </p>
              <p className="text-red-600 text-sm">
                {raison}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Fermer
            </motion.button>
          </div>

          {/* Information supplémentaire */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Contactez l'administrateur de l'entreprise pour demander l'autorisation d'accès
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalRefusAcces;