import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import cyclePaieService from '../../services/cyclePaie.service';
import { FaPlus, FaFileAlt, FaCheck, FaLock } from 'react-icons/fa';

const CyclesPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    action: '', 
    cycle: null,
    loading: false
  });

  const loadCycles = async () => {
    try {
      setLoading(true);
      const entrepriseId = user.entrepriseId || 1;
      const response = await cyclePaieService.getCyclesPaie(entrepriseId);
      setCycles(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des cycles de paie');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const handleGenererBulletins = async (cycleId) => {
    try {
      setLoading(true);
      await cyclePaieService.genererBulletins(cycleId);
      toast.success('Les bulletins ont été générés avec succès');
      loadCycles();
    } catch (error) {
      toast.error('Erreur lors de la génération des bulletins');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprouverCycle = async () => {
    if (!confirmModal.cycle) return;
    
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      await cyclePaieService.approuverCycle(confirmModal.cycle.id);
      toast.success('Le cycle a été approuvé avec succès');
      loadCycles();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation du cycle');
      console.error('Erreur:', error);
    } finally {
      setConfirmModal({ show: false, action: '', cycle: null, loading: false });
    }
  };

  const handleCloturerCycle = async () => {
    if (!confirmModal.cycle) return;
    
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      await cyclePaieService.cloturerCycle(confirmModal.cycle.id);
      toast.success('Le cycle a été clôturé avec succès');
      loadCycles();
    } catch (error) {
      toast.error('Erreur lors de la clôture du cycle');
      console.error('Erreur:', error);
    } finally {
      setConfirmModal({ show: false, action: '', cycle: null, loading: false });
    }
  };

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Définir les colonnes du tableau
  const columns = [
    {
      header: 'Cycle',
      render: (cycle) => (
        <div>
          <div className="font-medium text-gray-900">{cycle.titre || cycle.nom}</div>
          <div className="text-xs text-gray-500">
            {cycle.periode || `${cycle.mois}/${cycle.annee}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Période',
      render: (cycle) => (
        <div className="text-sm">
          <div>Début: {formatDate(cycle.dateDebut)}</div>
          <div>Fin: {formatDate(cycle.dateFin)}</div>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (cycle) => {
        let badgeVariant, statusText;
        switch (cycle.statut) {
          case 'BROUILLON':
            badgeVariant = 'default';
            statusText = 'Brouillon';
            break;
          case 'APPROUVE':
            badgeVariant = 'primary';
            statusText = 'Approuvé';
            break;
          case 'CLOTURE':
            badgeVariant = 'success';
            statusText = 'Clôturé';
            break;
          default:
            badgeVariant = 'default';
            statusText = cycle.statut;
        }
        return <Badge variant={badgeVariant}>{statusText}</Badge>;
      },
    },
    {
      header: 'Bulletins',
      render: (cycle) => (
        <div className="text-center">
          <span className="font-medium">{cycle.nombreBulletins || '0'}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (cycle) => {
        // Définir les actions disponibles en fonction du statut
        const isBrouillon = cycle.statut === 'BROUILLON';
        const isApprouve = cycle.statut === 'APPROUVE';
        
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => navigate(`/cycles/${cycle.id}/bulletins`)}
            >
              <FaFileAlt className="mr-1" /> Bulletins
            </Button>
            
            {/* Bouton d'export PDF en lot pour les cycles approuvés/clôturés */}
            {(isApprouve || cycle.statut === 'CLOTURE') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(`/api/cycles/${cycle.id}/bulletins/pdf`)}
                title="Exporter tous les bulletins du cycle en PDF"
              >
                <FaFileAlt className="mr-1" /> Export PDF
              </Button>
            )}
            
            {isAdmin && isBrouillon && (
              <>
                <Button 
                  size="sm" 
                  variant="warning"
                  onClick={() => handleGenererBulletins(cycle.id)}
                >
                  Générer
                </Button>
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => setConfirmModal({
                    show: true,
                    action: 'approuver',
                    cycle,
                    loading: false
                  })}
                >
                  <FaCheck className="mr-1" /> Approuver
                </Button>
              </>
            )}
            
            {isAdmin && isApprouve && (
              <Button 
                size="sm" 
                variant="danger"
                onClick={() => setConfirmModal({
                  show: true,
                  action: 'cloturer',
                  cycle,
                  loading: false
                })}
              >
                <FaLock className="mr-1" /> Clôturer
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const getConfirmModalTitle = () => {
    if (confirmModal.action === 'approuver') {
      return 'Approuver le cycle de paie';
    } 
    if (confirmModal.action === 'cloturer') {
      return 'Clôturer le cycle de paie';
    }
    return 'Confirmation';
  };

  const getConfirmModalMessage = () => {
    const cycleName = confirmModal.cycle?.titre || confirmModal.cycle?.nom || 'ce cycle';
    if (confirmModal.action === 'approuver') {
      return `Êtes-vous sûr de vouloir approuver le cycle "${cycleName}" ? Les bulletins seront verrouillés et ne pourront plus être modifiés.`;
    } 
    if (confirmModal.action === 'cloturer') {
      return `Êtes-vous sûr de vouloir clôturer le cycle "${cycleName}" ? Cette action est irréversible.`;
    }
    return 'Confirmez-vous cette action ?';
  };

  const handleConfirmAction = () => {
    if (confirmModal.action === 'approuver') {
      handleApprouverCycle();
    } else if (confirmModal.action === 'cloturer') {
      handleCloturerCycle();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cycles de Paie</h1>
        
        {isAdmin && (
          <Button 
            as={Link} 
            to="/cycles/creer"
            className="flex items-center"
          >
            <FaPlus className="mr-2" /> Nouveau cycle
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={cycles} 
            emptyMessage="Aucun cycle de paie trouvé"
          />
        )}
      </Card>

      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, action: '', cycle: null, loading: false })}
        title={getConfirmModalTitle()}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setConfirmModal({ show: false, action: '', cycle: null, loading: false })}
              disabled={confirmModal.loading}
            >
              Annuler
            </Button>
            <Button 
              variant={confirmModal.action === 'cloturer' ? 'danger' : 'success'}
              onClick={handleConfirmAction}
              isLoading={confirmModal.loading}
              disabled={confirmModal.loading}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <p>{getConfirmModalMessage()}</p>
      </Modal>
    </div>
  );
};

export default CyclesPage;