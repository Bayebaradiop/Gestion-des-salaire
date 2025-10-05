import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmployeDetailsModal from '../../components/modals/EmployeDetailsModal';
import FormulaireAjoutEmploye from '../../components/formulaires/FormulaireAjoutEmploye';
import employeService from '../../services/employe.service';
import { FaPlus, FaFilter, FaCheck, FaTimes, FaEdit, FaEye } from 'react-icons/fa';

const EmployesPage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employes, setEmployes] = useState([]);
  const [filtres, setFiltres] = useState({
    estActif: '',
    typeContrat: '',
    poste: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [confirmActionModal, setConfirmActionModal] = useState({ show: false, action: null, employe: null });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [postes, setPostes] = useState([]);
  
  // Pour la pagination (à implémenter plus tard)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const loadEmployes = async () => {
    try {
      setLoading(true);
      const entrepriseId = user.entrepriseId || 1; // Valeur par défaut si non disponible
      
      const response = await employeService.getEmployes(entrepriseId, filtres);
      setEmployes(response.data);
      
      // Extraire les postes uniques pour les filtres
      const uniquePostes = [...new Set(response.data.map(emp => emp.poste))];
      setPostes(uniquePostes);
      
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployes();
  }, [filtres]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltres({
      ...filtres,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFiltres({
      estActif: '',
      typeContrat: '',
      poste: ''
    });
    setShowFilterModal(false);
  };

  const handleStatusChange = async (employe, activate) => {
    try {
      setLoading(true);
      if (activate) {
        await employeService.activerEmploye(employe.id);
        toast.success(`${employe.prenom} ${employe.nom} a été activé`);
      } else {
        await employeService.desactiverEmploye(employe.id);
        toast.success(`${employe.prenom} ${employe.nom} a été désactivé`);
      }
      loadEmployes();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
      setConfirmActionModal({ show: false, action: null, employe: null });
    }
  };

  const handleShowDetails = (employe) => {
    setSelectedEmploye(employe);
    setShowDetailsModal(true);
  };

  const handleAjoutSuccess = () => {
    loadEmployes(); // Recharger la liste des employés
    setShowAjoutModal(false);
  };



  const columns = [
    {
      header: 'Code',
      accessor: 'codeEmploye',
    },
    {
      header: 'Nom complet',
      render: (employe) => (
        <div>
          <div className="font-medium text-gray-900">{employe.prenom} {employe.nom}</div>
          <div className="text-sm text-gray-500">{employe.email}</div>
        </div>
      ),
    },
    {
      header: 'Poste',
      accessor: 'poste',
    },
    {
      header: 'Type de contrat',
      render: (employe) => {
        let variant = 'default';
        let label = employe.typeContrat;
        
        switch (employe.typeContrat) {
          case 'FIXE':
            variant = 'primary';
            label = 'Fixe';
            break;
          case 'JOURNALIER':
            variant = 'warning';
            label = 'Journalier';
            break;
          case 'HONORAIRE':
            variant = 'success';
            label = 'Honoraire';
            break;
          default:
            variant = 'default';
            label = employe.typeContrat;
        }
        
        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        );
      },
    },
    {
      header: 'Salaire',
      render: (employe) => (
        <div className="font-medium">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
          }).format(employe.salaireBase)}
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (employe) => (
        <Badge variant={employe.estActif ? 'success' : 'danger'}>
          {employe.estActif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (employe) => (
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => handleShowDetails(employe)}
            title="Voir les détails"
          >
            <FaEye />
          </Button>
          

          
          {isAdmin && (
            <>
              <Button 
                size="sm"
                variant={employe.estActif ? 'danger' : 'success'}
                onClick={() => setConfirmActionModal({
                  show: true,
                  action: employe.estActif ? 'desactiver' : 'activer',
                  employe
                })}
                title={employe.estActif ? 'Désactiver' : 'Activer'}
              >
                {employe.estActif ? <FaTimes /> : <FaCheck />}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                title="Modifier"
              >
                <FaEdit />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center"
          >
            <FaFilter className="mr-2" /> Filtres
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={() => setShowAjoutModal(true)}
              className="flex items-center"
            >
              <FaPlus className="mr-2" /> Ajouter un employé
            </Button>
          )}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={employes} 
            emptyMessage="Aucun employé trouvé"
          />
        )}
      </Card>

      {/* Modal de filtres */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrer les employés"
        footer={
          <>
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
            <Button onClick={() => setShowFilterModal(false)}>
              Appliquer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="estActif"
              value={filtres.estActif}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de contrat</label>
            <select
              name="typeContrat"
              value={filtres.typeContrat}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous</option>
              <option value="FIXE">Fixe</option>
              <option value="JOURNALIER">Journalier</option>
              <option value="HONORAIRE">Honoraire</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poste</label>
            <select
              name="poste"
              value={filtres.poste}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous</option>
              {postes.map((poste, index) => (
                <option key={index} value={poste}>{poste}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation */}
      <Modal
        isOpen={confirmActionModal.show}
        onClose={() => setConfirmActionModal({ show: false, action: null, employe: null })}
        title="Confirmation"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setConfirmActionModal({ show: false, action: null, employe: null })}
            >
              Annuler
            </Button>
            <Button 
              variant={confirmActionModal.action === 'desactiver' ? 'danger' : 'success'}
              onClick={() => handleStatusChange(
                confirmActionModal.employe, 
                confirmActionModal.action === 'activer'
              )}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <p>
          Êtes-vous sûr de vouloir {confirmActionModal.action === 'desactiver' ? 'désactiver' : 'activer'} l'employé{' '}
          <span className="font-bold">
            {confirmActionModal.employe?.prenom} {confirmActionModal.employe?.nom}
          </span> ?
        </p>
      </Modal>

      {/* Modal des détails d'employé */}
      <EmployeDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEmploye(null);
        }}
        employe={selectedEmploye}
      />

      {/* Modal d'ajout d'employé */}
      <FormulaireAjoutEmploye
        isOpen={showAjoutModal}
        onClose={() => setShowAjoutModal(false)}
        onSuccess={handleAjoutSuccess}
        entrepriseId={user?.entrepriseId}
      />


    </div>
  );
};

export default EmployesPage;