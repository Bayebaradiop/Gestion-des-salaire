import React from 'react';
import { Formik, Form } from 'formik';
import Button from './Button';
import FormField from './FormField';

/**
 * Composant de formulaire réutilisable qui s'intègre avec Formik
 * et facilite la création de formulaires standardisés
 */
const FormComponent = ({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  fields = [], // Configuration des champs du formulaire
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  onCancel,
  isLoading = false,
  className = '',
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, dirty, isValid, resetForm }) => (
        <Form className={`space-y-6 ${className}`}>
          {/* Champs de formulaire générés dynamiquement */}
          {fields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              options={field.options}
              required={field.required}
              disabled={field.disabled || isSubmitting}
              className={field.className}
              {...field.props}
            />
          ))}
          
          {/* Contenu du formulaire passé en tant qu'enfants */}
          {children}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetForm();
                  onCancel();
                }}
                disabled={isSubmitting || isLoading}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || isLoading}
              disabled={isSubmitting || !dirty || !isValid || isLoading}
            >
              {submitText}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FormComponent;