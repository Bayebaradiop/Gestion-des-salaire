import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import pointageService from '../../services/pointage.service';
import employeService from '../../services/employe.service';

export default function EnregistrementPointage() {
  const { user, isAdmin, isCaissier } = useAuth();
  const entrepriseId = user?.entrepriseId;
  const [employes, setEmployes] = useState([]);
  const [employeId, setEmployeId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const canPoint = isAdmin || isCaissier;

  useEffect(() => {
    if (!entrepriseId) return;
    const load = async () => {
      const emps = await employeService.listerParEntreprise(entrepriseId);
      setEmployes(emps || []);
    };
    load();
  }, [entrepriseId]);

  const onArrivee = async () => {
    if (!employeId) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await pointageService.arriver({ entrepriseId, employeId: Number(employeId), notes });
      setMessage('Arrivée enregistrée');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Erreur à l\'arrivée');
    } finally {
      setLoading(false);
    }
  };

  const onDepart = async () => {
    if (!employeId) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await pointageService.depart({ entrepriseId, employeId: Number(employeId), notes });
      setMessage('Départ enregistré');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Erreur au départ');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employes.find(emp => emp.id === Number(employeId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span>Pointages</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-slate-900 dark:text-white font-medium">Enregistrement</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Enregistrement de Pointage</h1>
          <p className="text-slate-600 dark:text-slate-400">Suivez la présence de vos employés en temps réel</p>
        </div>

        {!canPoint ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Accès restreint</h3>
                <p className="text-slate-600 dark:text-slate-400">Vous n'avez pas les droits nécessaires pour enregistrer des pointages.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Colonne principale - Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Nouveau Pointage</h2>
                      <p className="text-blue-100 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <form className="p-6 space-y-6" onSubmit={e => e.preventDefault()}>
                  {/* Sélection employé */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Sélectionner un employé
                    </label>
                    <div className="relative">
                      <select 
                        value={employeId} 
                        onChange={(e) => setEmployeId(e.target.value)} 
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white transition-all appearance-none cursor-pointer text-base font-medium"
                      >
                        <option value="">Choisir un employé...</option>
                        {employes.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.prenom} {emp.nom} • {emp.codeEmploye}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Notes additionnelles <span className="text-slate-400 font-normal">(optionnel)</span>
                    </label>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white resize-none transition-all" 
                      rows={4} 
                      placeholder="Ajoutez des remarques, retards, ou toute information pertinente..."
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={onArrivee} 
                      disabled={loading || !employeId}
                      className="group relative overflow-hidden px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-base">Marquer Arrivée</span>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      onClick={onDepart} 
                      disabled={loading || !employeId}
                      className="group relative overflow-hidden px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </div>
                        <span className="text-base">Marquer Départ</span>
                      </div>
                    </button>
                  </div>

                  {/* Message de feedback */}
                  {message && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                      message.includes('Erreur') 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        message.includes('Erreur')
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-emerald-100 dark:bg-emerald-900'
                      }`}>
                        {message.includes('Erreur') ? (
                          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <p className={`font-medium ${
                        message.includes('Erreur')
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-emerald-800 dark:text-emerald-200'
                      }`}>{message}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Colonne latérale - Informations */}
            <div className="space-y-6">
              {/* Employé sélectionné */}
              {selectedEmployee ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Employé Sélectionné</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {selectedEmployee.prenom[0]}{selectedEmployee.nom[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedEmployee.prenom} {selectedEmployee.nom}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedEmployee.codeEmploye}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sélectionnez un employé pour commencer</p>
                </div>
              )}

              {/* Informations */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg">Informations</h3>
                </div>
                <ul className="space-y-2 text-blue-100 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>L'heure d'arrivée/départ est enregistrée automatiquement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Un seul pointage par employé et par jour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Les notes sont visibles dans l'historique des pointages</span>
                  </li>
                </ul>
              </div>

              {/* Heure actuelle */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Heure Actuelle</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
