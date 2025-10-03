import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, UserPlus, Users, User, Building2, Edit, Trash2,
  Mail, Phone, MapPin, Calendar, CreditCard, Shield, Sparkles,
  TrendingUp, Activity, Settings, Search, Filter, Download
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card, { StatCard, Badge } from '../components/ui/Card';
import EntrepriseLogo from '../components/ui/EntrepriseLogo';
import entrepriseService from '../services/entreprise.service';
import employeService from '../services/employe.service';
import authService from '../services/auth.service';
import UserModal from '../components/modals/UserModal';
import EmployeModalSuperAdmin from '../components/modals/EmployeModalSuperAdmin';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const SuperAdminEntrepriseDetailsPage = () => {
  const { entrepriseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('utilisateurs');

  // États pour les modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEmployeModalOpen, setIsEmployeModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'user' ou 'employe'

  // Charger les données de l'entreprise
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entrepriseRes, utilisateursRes, employesRes] = await Promise.all([
          entrepriseService.getEntrepriseById(entrepriseId),
          entrepriseService.getUtilisateursEntreprise(entrepriseId),
          employeService.getEmployesByEntreprise(entrepriseId)
        ]);

        setEntreprise(entrepriseRes.data);
        setUtilisateurs(utilisateursRes.data);
        setEmployes(employesRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données de l\'entreprise');
      } finally {
        setIsLoading(false);
      }
    };

    if (entrepriseId) {
      fetchData();
    }
  }, [entrepriseId]);

  // Gestionnaires pour les utilisateurs
  const handleOpenUserModal = (user = null) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSuccess = async () => {
    // Recharger les utilisateurs
    try {
      const utilisateursRes = await entrepriseService.getUtilisateursEntreprise(entrepriseId);
      setUtilisateurs(utilisateursRes.data);
      toast.success(selectedUser ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors du rechargement des utilisateurs:', error);
      toast.error('Erreur lors du rechargement des données');
    }
  };

  const handleDeleteUser = (user) => {
    setItemToDelete(user);
    setDeleteType('user');
    setIsConfirmationModalOpen(true);
  };

  // Gestionnaires pour les employés
  const handleOpenEmployeModal = (employe = null) => {
    setSelectedEmploye(employe);
    setIsEmployeModalOpen(true);
  };

  const handleCloseEmployeModal = () => {
    setIsEmployeModalOpen(false);
    setSelectedEmploye(null);
  };

  const handleEmployeSuccess = async () => {
    // Recharger les employés
    try {
      const employesRes = await employeService.getEmployesByEntreprise(entrepriseId);
      setEmployes(employesRes.data);
      toast.success(selectedEmploye ? 'Employé modifié avec succès' : 'Employé ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors du rechargement des employés:', error);
      toast.error('Erreur lors du rechargement des données');
    }
  };

  const handleDeleteEmploye = (employe) => {
    setItemToDelete(employe);
    setDeleteType('employe');
    setIsConfirmationModalOpen(true);
  };

  // Gestionnaire de confirmation de suppression
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      if (deleteType === 'user') {
        await entrepriseService.supprimerUtilisateurEntreprise(entrepriseId, itemToDelete.id);
        setUtilisateurs(prev => prev.filter(u => u.id !== itemToDelete.id));
        toast.success('Utilisateur supprimé avec succès');
      } else if (deleteType === 'employe') {
        await employeService.supprimerEmploye(itemToDelete.id);
        setEmployes(prev => prev.filter(e => e.id !== itemToDelete.id));
        toast.success('Employé supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationModalOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  // Vérifier que l'utilisateur est SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex p-6 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6">
            <Shield className="w-20 h-20 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Accès Refusé</h2>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-6">Vous devez être Super Administrateur.</p>
          <Button onClick={() => navigate('/super-admin')} variant="primary" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6">
            <Building2 className="w-20 h-20 text-gray-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Entreprise Non Trouvée</h2>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-6">Cette entreprise n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/super-admin')} variant="primary" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <button
              onClick={() => navigate('/super-admin')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Super Admin
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400 font-semibold">Entreprises</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-bold">{entreprise.nom}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => navigate('/super-admin')}
                variant="outline"
                size="lg"
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Retour
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800">
                  <EntrepriseLogo entreprise={entreprise} size="lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    {entreprise.nom}
                    <Sparkles className="w-7 h-7 text-indigo-600" />
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-2 text-base font-semibold text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {entreprise.email}
                    </span>
                    {entreprise.telephone && (
                      <span className="flex items-center gap-2 text-base font-semibold text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {entreprise.telephone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" icon={<Settings className="w-5 h-5" />}>
                Paramètres
              </Button>
              <Button variant="outline" size="lg" icon={<Download className="w-5 h-5" />}>
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Informations de l'entreprise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" className="p-8 mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-indigo-600" />
              Informations de l'Entreprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adresse</p>
                </div>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">{entreprise.adresse || 'Non spécifiée'}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Téléphone</p>
                </div>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">{entreprise.telephone || 'Non spécifié'}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Devise</p>
                </div>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">{entreprise.devise}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Période de paie</p>
                </div>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">{entreprise.periodePaie}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Premium Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            title="Utilisateurs"
            value={utilisateurs.length}
            change={`${utilisateurs.filter(u => u.estActif).length} actifs`}
            trend="neutral"
            icon={<Users className="w-7 h-7" />}
            color="indigo"
          />
          <StatCard
            title="Employés Actifs"
            value={entreprise.nombreEmployesActifs || 0}
            change={`${employes.length} total`}
            trend="up"
            icon={<User className="w-7 h-7" />}
            color="emerald"
          />
          <StatCard
            title="Masse Salariale"
            value={entreprise.masseSalarialeMensuelle ? 
              `${entreprise.masseSalarialeMensuelle.toLocaleString()} ${entreprise.devise}` : 
              'N/A'
            }
            change="Mensuelle"
            trend="up"
            icon={<TrendingUp className="w-7 h-7" />}
            color="purple"
          />
        </motion.div>

        {/* Premium Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl p-2 shadow-lg border-2 border-gray-200 dark:border-gray-800 mb-8">
            <nav className="flex gap-2">
              {[
                { id: 'utilisateurs', label: 'Utilisateurs', icon: Users, count: utilisateurs.length },
                { id: 'employes', label: 'Employés', icon: User, count: employes.length }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all flex-1 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-6 h-6" />
                  {tab.label}
                  <span className={`ml-auto px-3 py-1 rounded-lg text-sm font-extrabold ${
                    activeTab === tab.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabEntreprise"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'utilisateurs' && (
              <motion.div
                key="utilisateurs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="gradient" className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                      <Users className="w-7 h-7 text-indigo-600" />
                      Utilisateurs de l'Entreprise
                    </h3>
                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" icon={<Search className="w-5 h-5" />}>
                        Rechercher
                      </Button>
                      <Button 
                        variant="primary" 
                        size="lg"
                        icon={<UserPlus className="w-5 h-5" />}
                        onClick={() => handleOpenUserModal()}
                      >
                        Ajouter un Utilisateur
                      </Button>
                    </div>
                  </div>

                  {utilisateurs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6">
                        <Users className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun utilisateur trouvé</p>
                      <p className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-6">Commencez par ajouter le premier utilisateur</p>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={<UserPlus className="w-5 h-5" />}
                        onClick={() => handleOpenUserModal()}
                      >
                        Ajouter le Premier Utilisateur
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                          <tr>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Nom
                            </th>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Rôle
                            </th>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Créé le
                            </th>
                            <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y-2 divide-gray-200 dark:divide-gray-700">
                          {utilisateurs.map((utilisateur) => (
                            <tr key={utilisateur.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                  {utilisateur.prenom} {utilisateur.nom}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-base font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {utilisateur.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={
                                  utilisateur.role === 'ADMIN' ? 'primary' :
                                  utilisateur.role === 'CAISSIER' ? 'success' :
                                  'default'
                                }>
                                  {utilisateur.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={utilisateur.estActif ? 'success' : 'danger'}>
                                  {utilisateur.estActif ? 'Actif' : 'Inactif'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-base font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(utilisateur.creeLe).toLocaleDateString('fr-FR')}
                                </div>
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenUserModal(utilisateur)}
                                className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteUser(utilisateur)}
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'employes' && (
          <motion.div
            key="employes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="gradient" className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <User className="w-7 h-7 text-emerald-600" />
                  Employés de l'Entreprise
                </h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" icon={<Search className="w-5 h-5" />}>
                    Rechercher
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg"
                    icon={<UserPlus className="w-5 h-5" />}
                    onClick={() => handleOpenEmployeModal()}
                  >
                    Ajouter un Employé
                  </Button>
                </div>
              </div>

              {employes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-6">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun employé trouvé</p>
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-6">Commencez par ajouter le premier employé</p>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<UserPlus className="w-5 h-5" />}
                    onClick={() => handleOpenEmployeModal()}
                  >
                    Ajouter le Premier Employé
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                      <tr>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Poste
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Type contrat
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y-2 divide-gray-200 dark:divide-gray-700">
                      {employes.map((employe) => (
                        <tr key={employe.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-extrabold text-gray-900 dark:text-white">{employe.codeEmploye}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {employe.prenom} {employe.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-semibold text-gray-600 dark:text-gray-400">{employe.poste}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1.5 text-sm font-extrabold rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-800">
                              {employe.typeContrat}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1.5 text-sm font-extrabold rounded-lg border-2 ${
                              employe.estActif
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                            }`}>
                              {employe.estActif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenEmployeModal(employe)}
                                className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteEmploye(employe)}
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>

  {/* Modals */}
  <UserModal
    isOpen={isUserModalOpen}
    onClose={handleCloseUserModal}
    user={selectedUser}
    entrepriseId={entrepriseId}
    onSuccess={handleUserSuccess}
  />

  <EmployeModalSuperAdmin
    isOpen={isEmployeModalOpen}
    onClose={handleCloseEmployeModal}
    employe={selectedEmploye}
    entrepriseId={entrepriseId}
    onSuccess={handleEmployeSuccess}
  />

  <ConfirmationModal
    isOpen={isConfirmationModalOpen}
    onClose={handleCancelDelete}
    onConfirm={handleConfirmDelete}
    title="Confirmer la suppression"
    message={`Êtes-vous sûr de vouloir supprimer ${deleteType === 'user' ? 'cet utilisateur' : 'cet employé'} ? Cette action est irréversible.`}
    confirmText="Supprimer"
    cancelText="Annuler"
    variant="danger"
  />
</div>
);
};

export default SuperAdminEntrepriseDetailsPage;