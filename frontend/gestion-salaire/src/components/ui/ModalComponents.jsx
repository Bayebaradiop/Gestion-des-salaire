import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { Button } from './PremiumComponents';

/**
 * 🎭 MODAL BASE - Modal de base réutilisable
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={`
                  relative w-full ${sizes[size]}
                  bg-white dark:bg-gray-900 
                  rounded-2xl shadow-2xl
                  border border-gray-200 dark:border-gray-800
                  ${className}
                `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between p-7 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {title}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * ✅ CONFIRMATION MODAL - Modal de confirmation
 */
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false
}) => {
  const icons = {
    danger: <AlertTriangle className="w-12 h-12 text-red-600" />,
    success: <CheckCircle2 className="w-12 h-12 text-emerald-600" />,
    warning: <AlertCircle className="w-12 h-12 text-amber-600" />,
    info: <Info className="w-12 h-12 text-blue-600" />
  };

  const iconBackgrounds = {
    danger: 'bg-red-100 dark:bg-red-900/20',
    success: 'bg-emerald-100 dark:bg-emerald-900/20',
    warning: 'bg-amber-100 dark:bg-amber-900/20',
    info: 'bg-blue-100 dark:bg-blue-900/20'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className={`w-16 h-16 ${iconBackgrounds[variant]} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {icons[variant]}
                </motion.div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={onClose}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={variant}
                    fullWidth
                    onClick={onConfirm}
                    loading={loading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * 📋 FORM MODAL - Modal avec formulaire
 */
export const FormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title,
  children,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  loading = false,
  size = 'md'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {children}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * 🎉 SUCCESS MODAL - Modal de succès
 */
export const SuccessModal = ({ 
  isOpen, 
  onClose,
  title = 'Succès !',
  message = 'L\'opération a été effectuée avec succès.',
  buttonText = 'Fermer'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.6, duration: 1 }}
                  className="relative w-24 h-24 mx-auto mb-6"
                >
                  <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/20 rounded-full" />
                  <div className="absolute inset-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>
                  {/* Confetti effect */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 0] }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl"
                  />
                </motion.div>

                {/* Content */}
                <div className="text-center mb-6">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {message}
                  </motion.p>
                </div>

                {/* Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    variant="success"
                    fullWidth
                    onClick={onClose}
                  >
                    {buttonText}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * 📸 IMAGE PREVIEW MODAL - Modal de prévisualisation d'image
 */
export const ImagePreviewModal = ({ 
  isOpen, 
  onClose,
  imageUrl,
  title
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>

                {/* Image */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                >
                  {title && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                      </h3>
                    </div>
                  )}
                  <div className="p-4">
                    <img
                      src={imageUrl}
                      alt={title || 'Preview'}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * 📄 DRAWER - Panneau latéral
 */
export const Drawer = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  position = 'right',
  size = 'md'
}) => {
  const positions = {
    left: '-left-full',
    right: '-right-full',
    top: '-top-full',
    bottom: '-bottom-full'
  };

  const openPositions = {
    left: 'left-0',
    right: 'right-0',
    top: 'top-0',
    bottom: 'bottom-0'
  };

  const sizes = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    full: position === 'left' || position === 'right' ? 'w-full' : 'h-full'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ 
              x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
              y: position === 'bottom' ? '100%' : position === 'top' ? '-100%' : 0
            }}
            animate={{ x: 0, y: 0 }}
            exit={{ 
              x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
              y: position === 'bottom' ? '100%' : position === 'top' ? '-100%' : 0
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            className={`
              fixed ${openPositions[position]} ${sizes[size]}
              bg-white dark:bg-gray-900 
              shadow-2xl z-50
              ${position === 'left' || position === 'right' ? 'h-full' : 'w-full'}
              overflow-y-auto
            `}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
