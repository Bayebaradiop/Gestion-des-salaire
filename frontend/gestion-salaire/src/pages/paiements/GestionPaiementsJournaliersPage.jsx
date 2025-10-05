import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import paiementJournalierService from '../../services/paiementJournalier.service';
import ModalPaiementJournalier from '../../components/paiements/ModalPaiementJournalier';

/**
 * Page de gestion des paiements journaliers
 * Séparation claire : Admin valide les pointages, Caissier effectue les paiements
 */
const GestionPaiementsJournaliersPage = () => {
  const { user } = useAuth();
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodeActuelle, setPeriodeActuelle] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });
  const [modalPaiement, setModalPaiement] = useState({
    ouvert: false,
    employe: null
  });

  const estAdmin = user?.role === 'ADMIN';
  const estCaissier = user?.role === 'CAISSIER';
  const peutGererPaiements = estAdmin || estCaissier;

  useEffect(() => {
    if (peutGererPaiements) {
      chargerEmployes();
    }
  }, [periodeActuelle, peutGererPaiements]);

  const chargerEmployes = async () => {
    try {
      setLoading(true);
      const response = await paiementJournalierService.listerEmployesJournaliers(
        periodeActuelle.mois,
        periodeActuelle.annee
      );
      
      if (response.success) {
        setEmployes(response.data.employes || []);
      } else {
        toast.error('Erreur lors du chargement des employés');
      }
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      toast.error('Erreur lors du chargement des employés journaliers');
    } finally {
      setLoading(false);
    }
  };

  const changerPeriode = (delta) => {
    setPeriodeActuelle(prev => {
      let nouveauMois = prev.mois + delta;
      let nouvelleAnnee = prev.annee;

      if (nouveauMois > 12) {
        nouveauMois = 1;
        nouvelleAnnee++;
      } else if (nouveauMois < 1) {
        nouveauMois = 12;
        nouvelleAnnee--;
      }

      return { mois: nouveauMois, annee: nouvelleAnnee };
    });
  };

  const obtenirNomMois = (mois) => {
    const mois_noms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois_noms[mois - 1];
  };

  const ouvrirModalPaiement = (employe) => {
    setModalPaiement({
      ouvert: true,
      employe: employe
    });
  };

  const fermerModalPaiement = () => {
    setModalPaiement({
      ouvert: false,
      employe: null
    });
  };

  const handlePaiementEnregistre = () => {
    toast.success('Paiement enregistré avec succès !');
    fermerModalPaiement();
    chargerEmployes(); // Recharger la liste
  };

  if (!peutGererPaiements) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Vous devez être Admin ou Caissier pour accéder aux paiements journaliers.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des employés journaliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête avec sélecteur de période */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  👷‍♂️ Paiements Journaliers
                </h1>
                <p className="text-gray-600">
                  Gestion des paiements basés sur les pointages
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  estAdmin ? 'bg-blue-100 text-blue-800' :
                  estCaissier ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {estAdmin && '👨‍💼 Administrateur'}
                  {estCaissier && '💰 Caissier'}
                </div>
              </div>
            </div>

            {/* Sélecteur de période */}
            <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-lg p-4">
              <button 
                onClick={() => changerPeriode(-1)}
                className="p-2 rounded-full hover:bg-white transition-colors"
              >
                ⬅️
              </button>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {obtenirNomMois(periodeActuelle.mois)} {periodeActuelle.annee}
                </div>
                <div className="text-sm text-gray-500">
                  Période de paiement
                </div>
              </div>
              
              <button 
                onClick={() => changerPeriode(1)}
                className="p-2 rounded-full hover:bg-white transition-colors"
              >
                ➡️
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {employes.length}
                </div>
                <div className="text-sm text-gray-600">Employés journaliers</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {employes.filter(e => e.hasPointages).length}
                </div>
                <div className="text-sm text-gray-600">Avec pointages</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {employes.filter(e => e.needsPayment).length}
                </div>
                <div className="text-sm text-gray-600">À payer</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {paiementJournalierService.formaterMontant(
                    employes.reduce((total, e) => total + (e.resteAPayer || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total à payer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des employés journaliers */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Employés Journaliers - {obtenirNomMois(periodeActuelle.mois)} {periodeActuelle.annee}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pointages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calcul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employes.map((employe) => {
                  const statut = paiementJournalierService.obtenirStatutPaiement(employe);
                  
                  return (
                    <tr key={employe.employeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {employe.prenom?.[0]}{employe.nom?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employe.prenom} {employe.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employe.codeEmploye} • {paiementJournalierService.formaterMontant(employe.tauxJournalier)}/jour
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employe.joursPointes || 0} jours
                        </div>
                        <div className="text-sm text-gray-500">
                          {(employe.heuresPointes || 0).toFixed(1)}h travaillées
                          {employe.heuresSupplementaires > 0 && (
                            <span className="text-orange-600">
                              {' '}(+{employe.heuresSupplementaires.toFixed(1)}h sup)
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Brut: {paiementJournalierService.formaterMontant(employe.salaireBrutTotal || 0)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Net: {paiementJournalierService.formaterMontant(employe.salaireNet || 0)}
                        </div>
                        {employe.deductions > 0 && (
                          <div className="text-xs text-red-600">
                            -Déductions: {paiementJournalierService.formaterMontant(employe.deductions)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Payé: {paiementJournalierService.formaterMontant(employe.totalDejaPaye || 0)}
                        </div>
                        <div className={`text-sm font-medium ${
                          employe.resteAPayer > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Reste: {paiementJournalierService.formaterMontant(employe.resteAPayer || 0)}
                        </div>
                        {employe.salaireNet > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-green-600 h-1.5 rounded-full" 
                              style={{ 
                                width: `${paiementJournalierService.calculerPourcentagePaye(
                                  employe.totalDejaPaye || 0, 
                                  employe.salaireNet || 0
                                )}%` 
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statut.color === 'green' ? 'bg-green-100 text-green-800' :
                          statut.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          statut.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {statut.icon} {statut.label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {employe.hasPointages && employe.resteAPayer > 0 && (
                          <button
                            onClick={() => ouvrirModalPaiement(employe)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            💰 Payer
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            // TODO: Ouvrir détail complet
                            toast.info('Détail complet à venir');
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          📋 Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {employes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👷‍♂️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun employé journalier
                </h3>
                <p className="text-gray-500">
                  Aucun employé journalier trouvé pour {obtenirNomMois(periodeActuelle.mois)} {periodeActuelle.annee}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {modalPaiement.ouvert && (
        <ModalPaiementJournalier
          employe={modalPaiement.employe}
          periode={periodeActuelle}
          onClose={fermerModalPaiement}
          onPaiementEnregistre={handlePaiementEnregistre}
        />
      )}
    </div>
  );
};

export default GestionPaiementsJournaliersPage;