import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePointage } from '../../hooks/usePointage';
import { StatutEmoji } from '../../components/ui/StatutBadge';
import employeService from '../../services/employe.service';

export default function EnregistrementPointage() {
  const navigate = useNavigate();
  const { user, isAdmin, isCaissier } = useAuth();
  const entrepriseId = user?.entrepriseId;

  const [employes, setEmployes] = useState([]);
  const [employeId, setEmployeId] = useState('');
  const [notes, setNotes] = useState('');
  const [dernierPointage, setDernierPointage] = useState(null);

  const { message, loading, enregistrerArrivee, enregistrerDepart, horairesStandard } = usePointage(entrepriseId);
  const canPoint = isAdmin || isCaissier;

  useEffect(() => {
    if (!entrepriseId) return;
    const load = async () => {
      const emps = await employeService.listerParEntreprise(entrepriseId);
      setEmployes(emps || []);
    };
    load();
  }, [entrepriseId]);

  const handleArrivee = async () => {
    if (!employeId) return;
    const result = await enregistrerArrivee(employeId, notes);
    if (result?.success) {
      setDernierPointage({ type: 'arrivee', statut: result.statut, retardMinutes: result.retardMinutes, timestamp: new Date() });
      setNotes('');
    }
  };

  const handleDepart = async () => {
    if (!employeId) return;
    const result = await enregistrerDepart(employeId, notes);
    if (result?.success) {
      setDernierPointage({ type: 'depart', statut: result.statut, heuresSupMinutes: result.heuresSupMinutes, timestamp: new Date() });
      setNotes('');
    }
  };

  useEffect(() => setDernierPointage(null), [employeId]);

  const selectedEmployee = employes.find(emp => emp.id === Number(employeId));

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl  dark:text-white mb-2">Enregistrement de Pointage</h1>
            <p className="text-gray-600 dark:text-gray-400">Suivez la présence de vos employés en temps réel</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pointages/liste')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <List className="w-4 h-4" />
              Liste des Pointages
            </button>
            
            <button
              onClick={() => navigate('/pointages')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
        </div>

        {!canPoint ? (
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Accès restreint: vous n'avez pas les droits nécessaires.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Formulaire */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Nouveau Pointage</h2>
              <form onSubmit={e => e.preventDefault()} className="space-y-4">
                
                <select 
                  value={employeId} 
                  onChange={e => setEmployeId(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-gray-300  text-gray-900 dark:text-white"
                >
                  <option value="">Choisir un employé...</option>
                  {employes.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>
                  ))}
                </select>

                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  rows={3} 
                  placeholder="Notes (optionnel)"
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600  text-gray-900 dark:text-white"
                />

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={handleArrivee}
                    disabled={loading || !employeId}
                    className="flex-1 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                  >
                    Arrivée
                  </button>
                  <button 
                    type="button"
                    onClick={handleDepart}
                    disabled={loading || !employeId}
                    className="flex-1 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                  >
                    Départ
                  </button>
                </div>

                {message && (
                  <div className={`p-3 rounded border ${message.includes('Erreur') ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700'}`}>
                    {message}
                  </div>
                )}

              </form>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              {selectedEmployee && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2">Employé Sélectionné</h3>
                  <p>{selectedEmployee.prenom} {selectedEmployee.nom}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.codeEmploye}</p>
                </div>
              )}

              {dernierPointage && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2">Dernier Pointage</h3>
                  <p>Type: {dernierPointage.type}</p>
                  <p>Statut: <StatutEmoji {...dernierPointage} /></p>
                  <p>Heure: {dernierPointage.timestamp.toLocaleTimeString()}</p>
                </div>
              )}

              <div className="bg-white  rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2">Horaires Standard</h3>
                <p>Début: {horairesStandard.debut}</p>
                <p>Fin: {horairesStandard.fin}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
