import React from 'react';
import { Field, ErrorMessage } from 'formik';
import Input from './Input';
import Select from './Select';

/**
 * Composant FormField réutilisable qui encapsule un champ de formulaire
 * avec label, gestion des erreurs, et styles standardisés
 */
const FormField = ({
  name,
  label,
  type = 'text',
  placeholder = '',
  options = [],
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Fonction de rendu d'erreur
  const renderError = (message) => (
    <div className="mt-1 text-sm text-red-600">{message}</div>
  );

  // Sélection du composant de champ en fonction du type
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Field
            as={Select}
            id={name}
            name={name}
            disabled={disabled}
            className={`w-full rounded-md border ${
              disabled ? 'bg-gray-100' : 'bg-white'
            }`}
            {...rest}
          >
            <option value="">{placeholder || '-- Sélectionner --'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        );

      case 'textarea':
        return (
          <Field
            as="textarea"
            id={name}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical ${
              disabled ? 'bg-gray-100' : 'bg-white'
            }`}
            rows={4}
            {...rest}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <Field
              type="checkbox"
              id={name}
              name={name}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...rest}
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        );

      default:
        return (
          <Field
            as={Input}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full"
            {...rest}
          />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {type !== 'checkbox' && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}
      
      {renderField()}
      
      <ErrorMessage name={name} render={renderError} />
    </div>
  );
};

export default FormField;