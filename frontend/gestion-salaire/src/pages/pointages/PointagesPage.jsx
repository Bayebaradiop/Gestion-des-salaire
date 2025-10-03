import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Clock, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import pointageService from '../../services/pointage.service';
import employeService from '../../services/employe.service';

const BadgeStatut = ({ statut }) => {
  const map = {
    PRESENT: 'bg-emerald-100 text-emerald-700',
    RETARD: 'bg-amber-100 text-amber-700',
    ABSENT: 'bg-rose-100 text-rose-700',
    CONGE: 'bg-blue-100 text-blue-700',
    MALADIE: 'bg-violet-100 text-violet-700',
    TELETRAVAIL: 'bg-cyan-100 text-cyan-700'
  };
  const cls = map[statut] || 'bg-gray-100 text-gray-700';
  const label = {
    PRESENT: 'Présent',
    RETARD: 'Retard',
    ABSENT: 'Absent',
    CONGE: 'Congé',
    MALADIE: 'Maladie',
    TELETRAVAIL: 'Télétravail'
  }[statut] || statut;
  return <span className={`px-2 py-1 text-xs font-semibold rounded ${cls}`}>{label}</span>;
};

const TableSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="h-10 bg-gray-100 rounded mb-2" />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-12 bg-gray-50 rounded mb-2" />
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-20 bg-gray-50 rounded" />
    ))}
  </div>
);

const formatHHMM = (minutes) => {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = Math.floor(minutes % 60).toString().padStart(2, '0');
  return `${h}h${m}`;
};

export default function PointagesPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const entrepriseId = user?.entrepriseId;
  const [loading, setLoading] = useState(true);
  const [loadingExport, setLoadingExport] = useState(false);
  const [pointages, setPointages] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [filters, setFilters] = useState({
    du: '',
    au: '',
    employeId: '',
    statut: ''
  });

  const totalMinutes = useMemo(
    () => pointages.reduce((s, p) => s + (p.dureeMinutes || 0), 0),
    [pointages]
  );

  useEffect(() => {
    if (!entrepriseId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [emps, pts] = await Promise.all([
          employeService.listerParEntreprise(entrepriseId),
          pointageService.lister(entrepriseId, {})
        ]);
        setEmployes(emps || []);
        setPointages(pts || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entrepriseId]);

  const applyFilters = async (e) => {
    e?.preventDefault?.();
    if (!entrepriseId) return;
    setLoading(true);
    try {
      const payload = {};
      if (filters.du) payload.du = filters.du;
      if (filters.au) payload.au = filters.au;
      if (filters.employeId) payload.employeId = Number(filters.employeId);
      if (filters.statut) payload.statut = filters.statut;
      const pts = await pointageService.lister(entrepriseId, payload);
      setPointages(pts || []);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!entrepriseId) return;
    if (!filters.du || !filters.au) {
      alert('Veuillez sélectionner une période (du, au) pour exporter.');
      return;
    }
    setLoadingExport(true);
    try {
      await pointageService.exporterPdf(entrepriseId, { du: filters.du, au: filters.au });
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Pointages</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pointages/enregistrement')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau Pointage
          </button>
          
          <button
            onClick={() => navigate('/pointages/liste')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <List className="w-4 h-4" />
            Liste Complète
          </button>
          
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={handleExport}
              disabled={loadingExport}
              className="btn-gradient disabled:opacity-60"
            >
              {loadingExport ? 'Export...' : 'Exporter PDF'}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={applyFilters} className="card card-hover mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Du</label>
          <input type="date" value={filters.du} onChange={(e) => setFilters(f => ({ ...f, du: e.target.value }))} className="input-elevated w-full" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Au</label>
          <input type="date" value={filters.au} onChange={(e) => setFilters(f => ({ ...f, au: e.target.value }))} className="input-elevated w-full" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Employé</label>
          <select value={filters.employeId} onChange={(e) => setFilters(f => ({ ...f, employeId: e.target.value }))} className="input-elevated w-full">
            <option value="">Tous</option>
            {employes.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom} — {emp.codeEmploye}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Statut</label>
          <select value={filters.statut} onChange={(e) => setFilters(f => ({ ...f, statut: e.target.value }))} className="input-elevated w-full">
            <option value="">Tous</option>
            <option value="PRESENT">Présent</option>
            <option value="RETARD">Retard</option>
            <option value="ABSENT">Absent</option>
            <option value="CONGE">Congé</option>
            <option value="MALADIE">Maladie</option>
            <option value="TELETRAVAIL">Télétravail</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary">Filtrer</button>
        </div>
      </form>

      {loading ? (
        <>
          <CardSkeleton />
          <div className="mt-4">
            <TableSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="kpi kpi-accent">
              <div className="text-sm text-gray-500">Enregistrements</div>
              <div className="text-xl font-semibold">{pointages.length}</div>
            </div>
            <div className="kpi kpi-accent">
              <div className="text-sm text-gray-500">Total heures</div>
              <div className="text-xl font-semibold">{formatHHMM(totalMinutes)}</div>
            </div>
            <div className="kpi kpi-accent">
              <div className="text-sm text-gray-500">Employés</div>
              <div className="text-xl font-semibold">{new Set(pointages.map(p => p.employeId)).size}</div>
            </div>
            <div className="kpi kpi-accent">
              <div className="text-sm text-gray-500">Période</div>
              <div className="text-sm">{filters.du || '-'} → {filters.au || '-'}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-x-auto table-rounded">
            <table className="min-w-full text-sm table-sticky">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Employé</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2 text-center">Arrivée</th>
                  <th className="px-4 py-2 text-center">Départ</th>
                  <th className="px-4 py-2 text-center">Durée</th>
                  <th className="px-4 py-2 text-center">Statut</th>
                  <th className="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {pointages.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2">{p.employe?.prenom} {p.employe?.nom}</td>
                    <td className="px-4 py-2">{p.employe?.codeEmploye}</td>
                    <td className="px-4 py-2 text-center">{p.heureArrivee ? new Date(p.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-4 py-2 text-center">{p.heureDepart ? new Date(p.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-4 py-2 text-center">{p.dureeMinutes ? formatHHMM(p.dureeMinutes) : '-'}</td>
                    <td className="px-4 py-2 text-center"><BadgeStatut statut={p.statut} /></td>
                    <td className="px-4 py-2">{p.notes || ''}</td>
                  </tr>
                ))}
                {pointages.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">Aucun pointage trouvé pour les critères sélectionnés.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
