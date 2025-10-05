import { useState, useEffect } from 'react';
import { usePaiement } from '../../context/PaiementContext';
import employeService from '../../services/employe.service';
import bulletinPaieService from '../../services/bulletinPaie.service';
import paiementAutomatiqueService from '../../services/paiementAutomatique.service';
import pointageService from '../../services/pointage.service';
import calculSalaireService from '../../services/calculSalaire.service';
import { useAuth } from '../../hooks/useAuth';
import InfoCalculAutomatique from './InfoCalculAutomatique';

const FormulaireNouveauPaiement = ({ onSuccess, onCancel }) => {
  const { creerPaiement } = usePaiement();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    employeId: '',
    bulletinPaieId: '',
    montant: '',
    methodePaiement: 'ESPECES',
    reference: '',
    notes: ''
  });

  const [employes, setEmployes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinSelectionne, setBulletinSelectionne] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(false);
  const [loadingCalculAbsences, setLoadingCalculAbsences] = useState(false);
  const [mensuelInfo, setMensuelInfo] = useState(null);
  const [journalierInfo, setJournalierInfo] = useState(null);
  const [honoraireInfo, setHonoraireInfo] = useState(null);

  const methodesPaiement = [
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
    { value: 'ORANGE_MONEY', label: 'Orange Money' },
    { value: 'WAVE', label: 'Wave' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Charger les employés au montage du composant
  useEffect(() => {
    const chargerEmployes = async () => {
      try {
        setLoadingEmployes(true);
        const response = await employeService.listerParEntreprise(user.entrepriseId);
        setEmployes(response);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      } finally {
        setLoadingEmployes(false);
      }
    };

    if (user?.entrepriseId) {
      chargerEmployes();
    }
  }, [user]);

  // Charger les bulletins quand un employé est sélectionné
  useEffect(() => {
    const chargerBulletins = async () => {
      if (formData.employeId) {
        try {
          setLoadingBulletins(true);
          // Récupérer les bulletins non payés ou partiellement payés de l'employé
          const response = await bulletinPaieService.listerParEmploye(formData.employeId, {
            statut: ['EN_ATTENTE', 'PARTIEL']
          });
          setBulletins(response);
        } catch (error) {
          console.error('Erreur lors du chargement des bulletins:', error);
          setBulletins([]);
        } finally {
          setLoadingBulletins(false);
        }
      } else {
        setBulletins([]);
        setBulletinSelectionne(null);
        setFormData(prev => ({ 
          ...prev, 
          bulletinPaieId: '', 
          montant: '' 
        }));
      }
    };

    chargerBulletins();
  }, [formData.employeId]);

  // Mettre à jour le montant quand un bulletin est sélectionné
  useEffect(() => {
    const chargerBulletinAvecAbsences = async () => {
      if (formData.bulletinPaieId) {
        const bulletin = bulletins.find(b => b.id === parseInt(formData.bulletinPaieId));
        if (bulletin) {
          setBulletinSelectionne(bulletin);
          
          // Calculer le montant restant à payer
          const montantRestant = bulletin.salaireNet - bulletin.montantPaye;
          setFormData(prev => ({ 
            ...prev, 
            montant: montantRestant.toString() 
          }));

          // Charger les informations d'absences si c'est un employé fixe
          const employe = employes.find(e => e.id === bulletin.employeId);
          if (employe && employe.typeContrat === 'FIXE') {
            try {
              const bulletinAvecAbsences = await absenceService.obtenirBulletinAvecAbsences(bulletin.id);
              if (bulletinAvecAbsences.absences.nombre > 0) {
                setAbsencesInfo({
                  nombreAbsences: bulletinAvecAbsences.absences.nombre,
                  joursAbsents: bulletinAvecAbsences.absences.jours,
                  deductionParAbsence: 15000,
                  totalDeductions: bulletinAvecAbsences.absences.montantDeduction,
                  montantOriginal: bulletin.salaireBrut,
                  nouveauMontant: bulletinAvecAbsences.salaireNet - bulletinAvecAbsences.montantPaye
                });
              }
            } catch (error) {
              console.log('Aucune information d\'absence disponible pour ce bulletin');
            }
          } else {
            setAbsencesInfo(null);
          }
        }
      } else {
        setBulletinSelectionne(null);
        setAbsencesInfo(null);
      }
    };

    chargerBulletinAvecAbsences();
  }, [formData.bulletinPaieId, bulletins, employes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bulletinPaieId || !formData.montant) {
      alert('Veuillez sélectionner un bulletin et indiquer un montant');
      return;
    }

    const montant = parseFloat(formData.montant);
    if (isNaN(montant) || montant <= 0) {
      alert('Veuillez indiquer un montant valide');
      return;
    }

    if (bulletinSelectionne) {
      const montantRestant = bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye;
      if (montant > montantRestant) {
        alert(`Le montant ne peut pas dépasser le montant restant à payer: ${formatMontant(montantRestant)}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const paiementData = {
        montant,
        methodePaiement: formData.methodePaiement,
        datePaiement: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      };

      await creerPaiement(formData.bulletinPaieId, paiementData);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  };

  // Calculer automatiquement le salaire selon le type d'employé
  const calculerSalaireAutomatique = async () => {
    if (!formData.employeId || !bulletinSelectionne) {
      alert('Veuillez sélectionner un employé et un bulletin');
      return;
    }

    const employe = employes.find(e => e.id === parseInt(formData.employeId));
    if (!employe) {
      alert('Employé introuvable');
      return;
    }

    try {
      setLoadingCalculAbsences(true);
      
      console.log(`🎯 Calcul automatique pour employé ${employe.typeContrat}:`, employe);
      
      // Utiliser le nouveau service pour calculer et mettre à jour le bulletin
      await calculSalaireService.calculerEtMettreAJourBulletin(bulletinSelectionne.id);
      
      // Récupérer les informations de calcul mises à jour
      const calculData = await calculSalaireService.obtenirInfosCalcul(bulletinSelectionne.id);
      
      console.log('📊 Données de calcul reçues:', calculData);
      
      // Recharger le bulletin mis à jour
      const bulletinMisAJour = await bulletinPaieService.obtenirParId(bulletinSelectionne.id);
      
      console.log('📋 Bulletin mis à jour:', bulletinMisAJour);
      
      if (employe.typeContrat === 'JOURNALIER') {
        // Valeurs par défaut pour éviter NaN
        const nombreJoursTravailles = Number(calculData.nombreJoursTravailles) || 0;
        const tauxJournalier = Number(calculData.tauxJournalier) || 0;
        const salaireBrut = Number(calculData.salaireBrut) || 0;
        const joursPresents = calculData.joursPresents || [];
        
        setJournalierInfo({
          nombreJoursTravailles,
          joursPresents,
          tauxJournalier,
          salaireBrut,
          montantOriginal: bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye,
          nouveauMontant: bulletinMisAJour.salaireNet - bulletinMisAJour.montantPaye
        });
        setMensuelInfo(null);
        setHonoraireInfo(null);
        
        const message = nombreJoursTravailles > 0 
          ? `Salaire journalier calculé ! ${nombreJoursTravailles} jour(s) travaillé(s) × ${tauxJournalier.toLocaleString()} F CFA = ${salaireBrut.toLocaleString()} F CFA`
          : 'Aucun jour de présence trouvé pour ce mois. Salaire: 0 F CFA';
        alert(message);
      } else if (employe.typeContrat === 'HONORAIRE') {
        // Valeurs par défaut pour éviter NaN
        const totalHeuresTravaillees = Number(calculData.totalHeuresTravaillees) || 0;
        const tauxHoraire = Number(calculData.tauxHoraire) || 0;
        const salaireBrut = Number(calculData.salaireBrut) || 0;
        const joursPresents = calculData.joursPresents || [];
        
        setHonoraireInfo({
          totalHeuresTravaillees,
          tauxHoraire,
          salaireBrut,
          joursPresents,
          montantOriginal: bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye,
          nouveauMontant: bulletinMisAJour.salaireNet - bulletinMisAJour.montantPaye
        });
        setMensuelInfo(null);
        setJournalierInfo(null);
        
        const message = totalHeuresTravaillees > 0 
          ? `Salaire honoraire calculé ! ${totalHeuresTravaillees}h × ${tauxHoraire.toLocaleString()} F CFA/h = ${salaireBrut.toLocaleString()} F CFA`
          : 'Aucune heure de travail trouvée pour ce mois. Salaire: 0 F CFA';
        alert(message);
      } else {
        // Type MENSUEL/FIXE
        const nombreAbsences = Number(calculData.nombreAbsences) || 0;
        const montantDeduction = Number(calculData.montantDeduction) || 0;
        const salaireBrut = Number(calculData.salaireBrut) || 0;
        
        setMensuelInfo({
          nombreAbsences,
          joursAbsents: calculData.joursAbsences || [],
          deductionParAbsence: 15000,
          totalDeductions: montantDeduction,
          salaireBrut,
          montantOriginal: bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye,
          nouveauMontant: bulletinMisAJour.salaireNet - bulletinMisAJour.montantPaye
        });
        setJournalierInfo(null);
        setHonoraireInfo(null);
        
        const message = nombreAbsences > 0 
          ? `Salaire mensuel calculé ! ${nombreAbsences} absence(s) × 15,000 F CFA = ${montantDeduction.toLocaleString()} F CFA de déduction`
          : `Salaire mensuel calculé ! Aucune absence ce mois. Salaire: ${salaireBrut.toLocaleString()} F CFA`;
        alert(message);
      }

      // Mettre à jour le bulletin sélectionné et le montant
      setBulletinSelectionne(bulletinMisAJour);
      setFormData(prev => ({
        ...prev,
        montant: Math.max(0, bulletinMisAJour.salaireNet - bulletinMisAJour.montantPaye).toString()
      }));

    } catch (error) {
      console.error('❌ Erreur lors du calcul du salaire:', error);
      
      // Gestion spécifique des erreurs
      if (error.response?.data?.code === 'TAUX_JOURNALIER_MANQUANT') {
        alert(`❌ ${error.response.data.message}\n\nVeuillez configurer le taux journalier de cet employé dans sa fiche.`);
      } else if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert('❌ Erreur lors du calcul du salaire. Veuillez réessayer.');
      }
    } finally {
      setLoadingCalculAbsences(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection de l'employé */}
      <div>
        <label htmlFor="employeId" className="block text-sm font-medium text-gray-700 mb-2">
          Employé *
        </label>
        <select
          id="employeId"
          name="employeId"
          value={formData.employeId}
          onChange={handleChange}
          required
          disabled={loadingEmployes}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {loadingEmployes ? 'Chargement...' : 'Sélectionner un employé'}
          </option>
          {employes.map(employe => (
            <option key={employe.id} value={employe.id}>
              {employe.prenom} {employe.nom} - {employe.codeEmploye}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection du bulletin */}
      <div>
        <label htmlFor="bulletinPaieId" className="block text-sm font-medium text-gray-700 mb-2">
          Bulletin de paie *
        </label>
        <select
          id="bulletinPaieId"
          name="bulletinPaieId"
          value={formData.bulletinPaieId}
          onChange={handleChange}
          required
          disabled={!formData.employeId || loadingBulletins}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {loadingBulletins ? 'Chargement...' : 'Sélectionner un bulletin'}
          </option>
          {bulletins.map(bulletin => (
            <option key={bulletin.id} value={bulletin.id}>
              {bulletin.cyclePaie.titre} - {formatMontant(bulletin.salaireNet)} 
              {bulletin.montantPaye > 0 && ` (Payé: ${formatMontant(bulletin.montantPaye)})`}
            </option>
          ))}
        </select>
        {formData.employeId && bulletins.length === 0 && !loadingBulletins && (
          <p className="mt-1 text-sm text-gray-500">
            Aucun bulletin en attente de paiement pour cet employé
          </p>
        )}
      </div>

      {/* Informations du bulletin sélectionné */}
      {bulletinSelectionne && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Détails du bulletin</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Salaire brut:</span>
                <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.salaireBrut)}</span>
              </div>
              <div>
                <span className="text-gray-600">Déductions:</span>
                <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.deductions)}</span>
              </div>
              {bulletinSelectionne.nombreAbsences > 0 && (
                <>
                  <div>
                    <span className="text-gray-600">Absences du mois précédent:</span>
                    <span className="ml-2 font-medium text-red-600">{bulletinSelectionne.nombreAbsences} jour(s)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Déduction absences:</span>
                    <span className="ml-2 font-medium text-red-600">-{formatMontant(bulletinSelectionne.montantDeduction || 0)}</span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-600">Salaire net:</span>
                <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.salaireNet)}</span>
              </div>
              <div>
                <span className="text-gray-600">Déjà payé:</span>
                <span className="ml-2 font-medium">{formatMontant(bulletinSelectionne.montantPaye)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Reste à payer:</span>
                <span className="ml-2 font-bold text-green-600">
                  {formatMontant(bulletinSelectionne.salaireNet - bulletinSelectionne.montantPaye)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations sur le calcul automatique */}
          <InfoCalculAutomatique 
            employe={employes.find(e => e.id === parseInt(formData.employeId))}
            bulletinSelectionne={bulletinSelectionne}
          />

          {/* Bouton calcul automatique selon le type d'employé */}
          {(['FIXE', 'MENSUEL', 'JOURNALIER', 'HONORAIRE'].includes(employes.find(e => e.id === parseInt(formData.employeId))?.typeContrat)) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-blue-800">
                    {employes.find(e => e.id === parseInt(formData.employeId))?.typeContrat === 'JOURNALIER' 
                      ? 'Calcul automatique du salaire journalier'
                      : 'Calcul automatique des absences'
                    }
                  </h5>
                  <p className="text-sm text-blue-700">
                    {employes.find(e => e.id === parseInt(formData.employeId))?.typeContrat === 'JOURNALIER' 
                      ? 'Cliquez pour calculer le salaire basé sur les jours travaillés du mois'
                      : 'Cliquez pour déduire automatiquement 15 000 F CFA par jour d\'absence du mois'
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={calculerSalaireAutomatique}
                  disabled={loadingCalculAbsences}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loadingCalculAbsences ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Calcul...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {(() => {
                          const typeContrat = employes.find(e => e.id === parseInt(formData.employeId))?.typeContrat;
                          if (typeContrat === 'JOURNALIER') return 'Calculer Salaire Journalier';
                          if (typeContrat === 'HONORAIRE') return 'Calculer Salaire Horaire';
                          return 'Calculer Salaire Mensuel';
                        })()}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Affichage des résultats du calcul pour employés mensuels */}
              {mensuelInfo && (
                <div className="bg-white border border-blue-200 rounded p-3 mt-3">
                  <h6 className="font-medium text-gray-900 mb-2">Résultat du calcul des absences :</h6>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Salaire de base :</span>
                      <span className="ml-2 font-medium text-blue-600">{formatMontant(mensuelInfo.salaireBrut)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nombre d'absences :</span>
                      <span className="ml-2 font-medium text-red-600">{mensuelInfo.nombreAbsences} jour(s)</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Déduction par absence :</span>
                      <span className="ml-2 font-medium">{formatMontant(mensuelInfo.deductionParAbsence)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total déductions :</span>
                      <span className="ml-2 font-medium text-red-600">-{formatMontant(mensuelInfo.totalDeductions)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Salaire net :</span>
                      <span className="ml-2 font-bold text-green-600">{formatMontant(mensuelInfo.nouveauMontant)}</span>
                    </div>
                  </div>
                  {mensuelInfo.nombreAbsences > 0 && mensuelInfo.joursAbsents && mensuelInfo.joursAbsents.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Jours d'absence : </span>
                      <span className="text-sm text-red-600">{mensuelInfo.joursAbsents.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Affichage des résultats du calcul pour employés journaliers */}
              {journalierInfo && (
                <div className="bg-white border border-blue-200 rounded p-3 mt-3">
                  <h6 className="font-medium text-gray-900 mb-2">Résultat du calcul journalier :</h6>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Jours travaillés :</span>
                      <span className="ml-2 font-medium text-green-600">
                        {Number(journalierInfo.nombreJoursTravailles) || 0} jour(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux journalier :</span>
                      <span className="ml-2 font-medium">
                        {formatMontant(Number(journalierInfo.tauxJournalier) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Salaire brut calculé :</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {formatMontant(Number(journalierInfo.salaireBrut) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant à payer :</span>
                      <span className="ml-2 font-bold text-green-600">
                        {formatMontant(Number(journalierInfo.nouveauMontant) || 0)}
                      </span>
                    </div>
                  </div>
                  {journalierInfo.joursPresents && journalierInfo.joursPresents.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Jours présents : </span>
                      <span className="text-sm text-green-600">{journalierInfo.joursPresents.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Affichage des résultats pour employés honoraires */}
              {honoraireInfo && (
                <div className="bg-white border border-purple-200 rounded p-3 mt-3">
                  <h6 className="font-medium text-gray-900 mb-2">Résultat du calcul honoraire :</h6>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Heures travaillées :</span>
                      <span className="ml-2 font-medium text-purple-600">
                        {Number(honoraireInfo.totalHeuresTravaillees || 0).toFixed(2)}h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux horaire :</span>
                      <span className="ml-2 font-medium text-purple-600">
                        {formatMontant(Number(honoraireInfo.tauxHoraire) || 0)}/h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Salaire brut :</span>
                      <span className="ml-2 font-medium text-purple-600">
                        {formatMontant(Number(honoraireInfo.salaireBrut) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant à payer :</span>
                      <span className="ml-2 font-bold text-green-600">
                        {formatMontant(Number(honoraireInfo.nouveauMontant) || 0)}
                      </span>
                    </div>
                  </div>
                  {honoraireInfo.joursPresents && honoraireInfo.joursPresents.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Jours présents : </span>
                      <span className="text-sm text-purple-600">{honoraireInfo.joursPresents.join(', ')}</span>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-purple-600">
                    <strong>Note :</strong> Les employés honoraires sont payés selon les heures travaillées.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Montant */}
      <div>
        <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">
          Montant à payer *
          {mensuelInfo && (
            <span className="ml-2 text-sm text-blue-600 font-medium">
              (Salaire mensuel moins déductions)
            </span>
          )}
          {journalierInfo && (
            <span className="ml-2 text-sm text-green-600 font-medium">
              (Jours travaillés × taux journalier)
            </span>
          )}
          {honoraireInfo && (
            <span className="ml-2 text-sm text-purple-600 font-medium">
              (Heures travaillées × taux horaire)
            </span>
          )}
        </label>
        <input
          type="number"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      {/* Méthode de paiement */}
      <div>
        <label htmlFor="methodePaiement" className="block text-sm font-medium text-gray-700 mb-2">
          Méthode de paiement *
        </label>
        <select
          id="methodePaiement"
          name="methodePaiement"
          value={formData.methodePaiement}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {methodesPaiement.map(methode => (
            <option key={methode.value} value={methode.value}>
              {methode.label}
            </option>
          ))}
        </select>
      </div>

      {/* Référence */}
      {formData.methodePaiement !== 'ESPECES' && (
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
            Référence de transaction
          </label>
          <input
            type="text"
            id="reference"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Numéro de transaction, chèque, etc."
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Remarques ou commentaires..."
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default FormulaireNouveauPaiement;