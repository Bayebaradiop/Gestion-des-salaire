import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  motDePasse: Yup.string()
    .required('Le mot de passe est requis')
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError('');
    try {
      const success = await login(values.email, values.motDePasse);
      if (success) {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser?.role === 'SUPER_ADMIN') {
          navigate('/super-admin'); 
        } else if (storedUser?.role === 'ADMIN') {
          navigate('/dashboard'); 
        } else if (storedUser?.role === 'CAISSIER') {
          navigate('/dashboard'); 
        } else {
          navigate('/dashboard'); // fallback
        }
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 
        'Erreur de connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">KAY FAYEKOU</h1>
          <p className="mt-2 text-sm text-gray-600">
            Système de Gestion des Salaires
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-6">
            Connexion à votre compte
          </h2>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {loginError}
            </div>
          )}

          <Formik
            initialValues={{ email: '', motDePasse: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                      ${errors.email && touched.email ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <Field
                    id="motDePasse"
                    name="motDePasse"
                    type="password"
                    autoComplete="current-password"
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                      ${errors.motDePasse && touched.motDePasse ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  <ErrorMessage name="motDePasse" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Se connecter
                </Button>
              </Form>
            )}
          </Formik>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PayManager. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;