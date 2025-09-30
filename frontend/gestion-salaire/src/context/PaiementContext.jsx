import { createContext, useReducer, useContext } from 'react';
import { toast } from 'react-toastify';
import paiementService from '../services/paiement.service';

// Types d'actions
const PAIEMENT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PAIEMENTS: 'SET_PAIEMENTS',
  ADD_PAIEMENT: 'ADD_PAIEMENT',
  UPDATE_PAIEMENT: 'UPDATE_PAIEMENT',
  REMOVE_PAIEMENT: 'REMOVE_PAIEMENT',
  SET_FILTRES: 'SET_FILTRES',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_ERROR: 'SET_ERROR'
};

// État initial
const initialState = {
  paiements: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filtres: {
    dateDebut: '',
    dateFin: '',
    employeId: '',
    methodePaiement: ''
  }
};

// Reducer
const paiementReducer = (state, action) => {
  switch (action.type) {
    case PAIEMENT_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case PAIEMENT_ACTIONS.SET_PAIEMENTS:
      return { 
        ...state, 
        paiements: action.payload.paiements,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        },
        loading: false 
      };
    
    case PAIEMENT_ACTIONS.ADD_PAIEMENT:
      return { 
        ...state, 
        paiements: [action.payload, ...state.paiements] 
      };
    
    case PAIEMENT_ACTIONS.UPDATE_PAIEMENT:
      return {
        ...state,
        paiements: state.paiements.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case PAIEMENT_ACTIONS.REMOVE_PAIEMENT:
      return {
        ...state,
        paiements: state.paiements.filter(p => p.id !== action.payload)
      };
    
    case PAIEMENT_ACTIONS.SET_FILTRES:
      return { 
        ...state, 
        filtres: { ...state.filtres, ...action.payload } 
      };
    
    case PAIEMENT_ACTIONS.SET_PAGINATION:
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload } 
      };
    
    case PAIEMENT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    default:
      return state;
  }
};

// Context
const PaiementContext = createContext();

// Provider
export const PaiementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paiementReducer, initialState);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: PAIEMENT_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: PAIEMENT_ACTIONS.SET_ERROR, payload: error });
  };

  const setFiltres = (filtres) => {
    dispatch({ type: PAIEMENT_ACTIONS.SET_FILTRES, payload: filtres });
  };

  const setPagination = (pagination) => {
    dispatch({ type: PAIEMENT_ACTIONS.SET_PAGINATION, payload: pagination });
  };

  // Charger la liste des paiements
  const chargerPaiements = async (page = 1) => {
    try {
      setLoading(true);
      const filtresActuels = {
        ...state.filtres,
        page,
        limit: state.pagination.limit
      };
      
      const result = await paiementService.listerTous(filtresActuels);
      
      dispatch({ 
        type: PAIEMENT_ACTIONS.SET_PAIEMENTS, 
        payload: result 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du chargement des paiements');
      toast.error('Erreur lors du chargement des paiements');
    }
  };

  // Créer un nouveau paiement
  const creerPaiement = async (bulletinId, paiementData) => {
    try {
      setLoading(true);
      const nouveauPaiement = await paiementService.creer(bulletinId, paiementData);
      
      // Recharger complètement la liste des paiements après création
      const filtresActuels = {
        ...state.filtres,
        page: state.pagination.page,
        limit: state.pagination.limit
      };
      
      const result = await paiementService.listerTous(filtresActuels);
      
      dispatch({ 
        type: PAIEMENT_ACTIONS.SET_PAIEMENTS, 
        payload: result 
      });
      
      toast.success('Paiement enregistré avec succès');
      return nouveauPaiement;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création du paiement');
      toast.error(error.response?.data?.message || 'Erreur lors de la création du paiement');
      setLoading(false);
      throw error;
    }
  };

  // Modifier un paiement
  const modifierPaiement = async (id, paiementData) => {
    try {
      setLoading(true);
      const paiementModifie = await paiementService.modifier(id, paiementData);
      
      dispatch({ 
        type: PAIEMENT_ACTIONS.UPDATE_PAIEMENT, 
        payload: paiementModifie 
      });
      
      toast.success('Paiement modifié avec succès');
      setLoading(false);
      return paiementModifie;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la modification du paiement');
      toast.error('Erreur lors de la modification du paiement');
      throw error;
    }
  };

  // Supprimer un paiement
  const supprimerPaiement = async (id) => {
    try {
      setLoading(true);
      await paiementService.supprimer(id);
      
      dispatch({ 
        type: PAIEMENT_ACTIONS.REMOVE_PAIEMENT, 
        payload: id 
      });
      
      toast.success('Paiement supprimé avec succès');
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression du paiement');
      toast.error('Erreur lors de la suppression du paiement');
    }
  };

  // Télécharger un reçu
  const telechargerRecu = async (id) => {
    try {
      await paiementService.telechargerRecu(id);
      toast.success('Reçu téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du reçu');
    }
  };

  // Filtrer les paiements
  const filtrerPaiements = async (filtres) => {
    setFiltres(filtres);
    await chargerPaiements(1); // Retourner à la première page
  };

  // Changer de page
  const changerPage = (page) => {
    setPagination({ page });
    chargerPaiements(page);
  };

  const value = {
    // État
    ...state,
    
    // Actions
    chargerPaiements,
    creerPaiement,
    modifierPaiement,
    supprimerPaiement,
    telechargerRecu,
    filtrerPaiements,
    changerPage,
    setFiltres,
    setPagination
  };

  return (
    <PaiementContext.Provider value={value}>
      {children}
    </PaiementContext.Provider>
  );
};

// Hook personnalisé
export const usePaiement = () => {
  const context = useContext(PaiementContext);
  if (!context) {
    throw new Error('usePaiement doit être utilisé dans un PaiementProvider');
  }
  return context;
};

export default PaiementContext;