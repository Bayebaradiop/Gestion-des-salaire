import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/ui/FormComponents';
import { Button, Alert } from '../../components/ui/PremiumComponents';
import { Mail, Lock, Sparkles, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

const PremiumLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }
    
    if (!formData.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    } else if (formData.motDePasse.length < 3) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 3 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoginError('');
    setIsLoading(true);
    
    try {
      const success = await login(formData.email, formData.motDePasse);
      if (success) {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser?.role === 'SUPER_ADMIN') {
          navigate('/super-admin'); 
        } else if (storedUser?.role === 'CAISSIER') {
          navigate('/caissier'); 
        } else {
          navigate('/dashboard'); 
        }
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 
        'Erreur de connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Données protégées avec chiffrement end-to-end'
    },
    {
      icon: Zap,
      title: 'Rapide',
      description: 'Performance optimale pour une productivité maximale'
    },
    {
      icon: TrendingUp,
      title: 'Analytique',
      description: 'Tableaux de bord et rapports en temps réel'
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PayFlow
              </h1>
              <p className="text-base font-bold text-gray-500 dark:text-gray-400">Gestion des Salaires</p>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Bienvenue ! 👋
            </h2>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              Connectez-vous pour accéder à votre espace
            </p>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Alert 
                  type="error" 
                  message={loginError}
                  onClose={() => setLoginError('')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <InputField
              label="Adresse Email"
              name="email"
              type="email"
              placeholder="exemple@email.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <InputField
              label="Mot de Passe"
              name="motDePasse"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.motDePasse}
              onChange={handleChange}
              error={errors.motDePasse}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-base font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isLoading}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Se connecter
            </Button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
              Vous n'avez pas de compte ?{' '}
              <button className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Contactez l'administrateur
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Branding & Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: Math.random() * 1000,
                y: Math.random() * 1000,
                scale: 0
              }}
              animate={{
                y: [null, Math.random() * 1000],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between text-white w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              Gérez vos salaires
              <br />
              en toute simplicité
            </h2>
            <p className="text-2xl font-bold text-white/90 mb-12 leading-relaxed drop-shadow-md">
              Solution complète de gestion de la paie pour entreprises modernes.
              Automatisez, suivez et optimisez vos processus RH.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className="flex items-start gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl mb-2 drop-shadow-md">{feature.title}</h3>
                    <p className="text-white/90 font-semibold text-base drop-shadow">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex gap-8"
          >
            {[
              { value: '5000+', label: 'Employés gérés' },
              { value: '200+', label: 'Entreprises' },
              { value: '99.9%', label: 'Disponibilité' }
            ].map((stat, index) => (
              <div key={index} className="flex-1">
                <div className="text-5xl font-extrabold mb-2 drop-shadow-lg">{stat.value}</div>
                <div className="text-white/90 text-base font-bold drop-shadow">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoginPage;
