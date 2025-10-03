/**
 * API Backend Node.js/Express - Gestion des Pointages
 * 
 * Endpoints CRUD pour la gestion des pointages employés
 * Base de données: SQLite (dev) ou MySQL/PostgreSQL (prod)
 * 
 * @author Dr. Full-Stack Developer
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const { body, param, query, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// === MOCK DATABASE (Remplacer par Prisma/Sequelize en production) ===
let pointages = [
  {
    id: 1,
    employeId: 101,
    date: '2025-10-03',
    heureArrivee: '08:00:00',
    heureDepart: '17:00:00',
    dureeMinutes: 540,
    statut: 'PRESENT',
    retardMinutes: 0,
    heuresSupMinutes: 0,
    commentaire: null,
    valide: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    employeId: 102,
    date: '2025-10-03',
    heureArrivee: null,
    heureDepart: null,
    dureeMinutes: 0,
    statut: 'ABSENT',
    retardMinutes: 0,
    heuresSupMinutes: 0,
    commentaire: 'Congé maladie',
    valide: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    employeId: 103,
    date: '2025-10-03',
    heureArrivee: '08:27:00',
    heureDepart: '17:00:00',
    dureeMinutes: 513,
    statut: 'RETARD',
    retardMinutes: 27,
    heuresSupMinutes: 0,
    commentaire: 'Embouteillage',
    valide: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    employeId: 104,
    date: '2025-10-03',
    heureArrivee: '08:00:00',
    heureDepart: '20:15:00',
    dureeMinutes: 735,
    statut: 'HEURES_SUP',
    retardMinutes: 0,
    heuresSupMinutes: 195,
    commentaire: 'Projet urgent',
    valide: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    employeId: 105,
    date: '2025-10-03',
    heureArrivee: '08:00:00',
    heureDepart: null,
    dureeMinutes: null,
    statut: 'CAS_PARTICULIER',
    retardMinutes: 0,
    heuresSupMinutes: 0,
    commentaire: 'Oubli badge départ - À corriger',
    valide: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 6;

// === HELPERS ===

/**
 * Calcule le statut d'un pointage
 * @param {string} heureArrivee - Format HH:MM:SS
 * @param {string} heureDepart - Format HH:MM:SS
 * @param {number} retardMinutes - Minutes de retard
 * @param {number} heuresSupMinutes - Minutes d'heures sup
 * @returns {string} - PRESENT | ABSENT | RETARD | HEURES_SUP | CAS_PARTICULIER
 */
function calculerStatut(heureArrivee, heureDepart, retardMinutes, heuresSupMinutes) {
  if (!heureArrivee && !heureDepart) return 'ABSENT';
  if (!heureArrivee || !heureDepart) return 'CAS_PARTICULIER';
  if (heuresSupMinutes > 0) return 'HEURES_SUP';
  if (retardMinutes > 0) return 'RETARD';
  return 'PRESENT';
}

/**
 * Calcule la durée entre deux heures
 * @param {string} debut - Format HH:MM:SS
 * @param {string} fin - Format HH:MM:SS
 * @returns {number} - Durée en minutes
 */
function calculerDuree(debut, fin) {
  if (!debut || !fin) return null;
  const [hD, mD, sD] = debut.split(':').map(Number);
  const [hF, mF, sF] = fin.split(':').map(Number);
  const minutesDebut = hD * 60 + mD;
  const minutesFin = hF * 60 + mF;
  return minutesFin - minutesDebut;
}

/**
 * Calcule le retard par rapport à l'heure prévue (08:00:00 par défaut)
 * @param {string} heureArrivee - Format HH:MM:SS
 * @param {string} heurePrevue - Format HH:MM:SS (défaut: 08:00:00)
 * @returns {number} - Retard en minutes (0 si pas de retard)
 */
function calculerRetard(heureArrivee, heurePrevue = '08:00:00') {
  if (!heureArrivee) return 0;
  const duree = calculerDuree(heurePrevue, heureArrivee);
  return duree > 0 ? duree : 0;
}

/**
 * Calcule les heures supplémentaires par rapport à l'heure prévue (17:00:00 par défaut)
 * @param {string} heureDepart - Format HH:MM:SS
 * @param {string} heurePrevue - Format HH:MM:SS (défaut: 17:00:00)
 * @returns {number} - Heures sup en minutes (0 si pas d'heures sup)
 */
function calculerHeuresSup(heureDepart, heurePrevue = '17:00:00') {
  if (!heureDepart) return 0;
  const duree = calculerDuree(heurePrevue, heureDepart);
  return duree > 0 ? duree : 0;
}

// === ROUTES ===

/**
 * GET /api/pointages
 * Liste tous les pointages avec filtres optionnels
 * Query params: employeId, date, statut, dateDebut, dateFin
 */
app.get('/api/pointages', [
  query('employeId').optional().isInt().toInt(),
  query('date').optional().isISO8601(),
  query('statut').optional().isIn(['PRESENT', 'ABSENT', 'RETARD', 'HEURES_SUP', 'CAS_PARTICULIER']),
  query('dateDebut').optional().isISO8601(),
  query('dateFin').optional().isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filtered = [...pointages];

  // Filtres
  if (req.query.employeId) {
    filtered = filtered.filter(p => p.employeId === parseInt(req.query.employeId));
  }
  if (req.query.date) {
    filtered = filtered.filter(p => p.date === req.query.date);
  }
  if (req.query.statut) {
    filtered = filtered.filter(p => p.statut === req.query.statut);
  }
  if (req.query.dateDebut) {
    filtered = filtered.filter(p => p.date >= req.query.dateDebut);
  }
  if (req.query.dateFin) {
    filtered = filtered.filter(p => p.date <= req.query.dateFin);
  }

  // Statistiques
  const stats = {
    total: filtered.length,
    presents: filtered.filter(p => p.statut === 'PRESENT').length,
    absents: filtered.filter(p => p.statut === 'ABSENT').length,
    retards: filtered.filter(p => p.statut === 'RETARD').length,
    heuresSup: filtered.filter(p => p.statut === 'HEURES_SUP').length,
    casParticuliers: filtered.filter(p => p.statut === 'CAS_PARTICULIER').length
  };

  res.json({
    success: true,
    data: filtered,
    stats,
    count: filtered.length
  });
});

/**
 * GET /api/pointages/:id
 * Récupère un pointage par son ID
 */
app.get('/api/pointages/:id', [
  param('id').isInt().toInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const pointage = pointages.find(p => p.id === parseInt(req.params.id));
  
  if (!pointage) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pointage non trouvé' 
    });
  }

  res.json({
    success: true,
    data: pointage
  });
});

/**
 * POST /api/pointages
 * Crée un nouveau pointage
 * Body: { employeId, date, heureArrivee?, heureDepart?, commentaire? }
 */
app.post('/api/pointages', [
  body('employeId').isInt().withMessage('employeId doit être un entier'),
  body('date').isISO8601().withMessage('date doit être au format ISO 8601 (YYYY-MM-DD)'),
  body('heureArrivee').optional().matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('heureArrivee doit être au format HH:MM:SS'),
  body('heureDepart').optional().matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('heureDepart doit être au format HH:MM:SS'),
  body('commentaire').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { employeId, date, heureArrivee, heureDepart, commentaire } = req.body;

  // Vérifier si un pointage existe déjà pour cet employé ce jour
  const existing = pointages.find(p => p.employeId === employeId && p.date === date);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Un pointage existe déjà pour cet employé à cette date'
    });
  }

  // Calculs automatiques
  const retardMinutes = calculerRetard(heureArrivee);
  const heuresSupMinutes = calculerHeuresSup(heureDepart);
  const dureeMinutes = calculerDuree(heureArrivee, heureDepart);
  const statut = calculerStatut(heureArrivee, heureDepart, retardMinutes, heuresSupMinutes);
  const valide = statut !== 'CAS_PARTICULIER';

  const newPointage = {
    id: nextId++,
    employeId,
    date,
    heureArrivee: heureArrivee || null,
    heureDepart: heureDepart || null,
    dureeMinutes,
    statut,
    retardMinutes,
    heuresSupMinutes,
    commentaire: commentaire || null,
    valide,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  pointages.push(newPointage);

  res.status(201).json({
    success: true,
    message: 'Pointage créé avec succès',
    data: newPointage
  });
});

/**
 * PATCH /api/pointages/:id
 * Met à jour un pointage existant
 * Body: { heureArrivee?, heureDepart?, commentaire?, valide? }
 */
app.patch('/api/pointages/:id', [
  param('id').isInt().toInt(),
  body('heureArrivee').optional().matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('heureArrivee doit être au format HH:MM:SS'),
  body('heureDepart').optional().matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('heureDepart doit être au format HH:MM:SS'),
  body('commentaire').optional().isString().trim(),
  body('valide').optional().isBoolean()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const index = pointages.findIndex(p => p.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pointage non trouvé' 
    });
  }

  const pointage = pointages[index];
  const { heureArrivee, heureDepart, commentaire, valide } = req.body;

  // Mise à jour des champs
  if (heureArrivee !== undefined) pointage.heureArrivee = heureArrivee;
  if (heureDepart !== undefined) pointage.heureDepart = heureDepart;
  if (commentaire !== undefined) pointage.commentaire = commentaire;
  if (valide !== undefined) pointage.valide = valide;

  // Recalculs automatiques
  pointage.retardMinutes = calculerRetard(pointage.heureArrivee);
  pointage.heuresSupMinutes = calculerHeuresSup(pointage.heureDepart);
  pointage.dureeMinutes = calculerDuree(pointage.heureArrivee, pointage.heureDepart);
  pointage.statut = calculerStatut(pointage.heureArrivee, pointage.heureDepart, pointage.retardMinutes, pointage.heuresSupMinutes);
  pointage.updatedAt = new Date().toISOString();

  pointages[index] = pointage;

  res.json({
    success: true,
    message: 'Pointage mis à jour avec succès',
    data: pointage
  });
});

/**
 * DELETE /api/pointages/:id
 * Supprime un pointage (Admin uniquement en prod)
 */
app.delete('/api/pointages/:id', [
  param('id').isInt().toInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const index = pointages.findIndex(p => p.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pointage non trouvé' 
    });
  }

  pointages.splice(index, 1);

  res.json({
    success: true,
    message: 'Pointage supprimé avec succès'
  });
});

/**
 * GET /api/pointages/stats/:employeId
 * Statistiques pour un employé spécifique
 */
app.get('/api/pointages/stats/:employeId', [
  param('employeId').isInt().toInt(),
  query('dateDebut').optional().isISO8601(),
  query('dateFin').optional().isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filtered = pointages.filter(p => p.employeId === parseInt(req.params.employeId));

  if (req.query.dateDebut) {
    filtered = filtered.filter(p => p.date >= req.query.dateDebut);
  }
  if (req.query.dateFin) {
    filtered = filtered.filter(p => p.date <= req.query.dateFin);
  }

  const stats = {
    employeId: parseInt(req.params.employeId),
    periode: {
      debut: req.query.dateDebut || null,
      fin: req.query.dateFin || null
    },
    total: filtered.length,
    presents: filtered.filter(p => p.statut === 'PRESENT').length,
    absents: filtered.filter(p => p.statut === 'ABSENT').length,
    retards: filtered.filter(p => p.statut === 'RETARD').length,
    heuresSup: filtered.filter(p => p.statut === 'HEURES_SUP').length,
    casParticuliers: filtered.filter(p => p.statut === 'CAS_PARTICULIER').length,
    totalMinutesTravaillees: filtered.reduce((sum, p) => sum + (p.dureeMinutes || 0), 0),
    totalMinutesRetard: filtered.reduce((sum, p) => sum + (p.retardMinutes || 0), 0),
    totalMinutesHeuresSup: filtered.reduce((sum, p) => sum + (p.heuresSupMinutes || 0), 0),
    tauxPresence: filtered.length > 0 
      ? ((filtered.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD' || p.statut === 'HEURES_SUP').length / filtered.length) * 100).toFixed(2)
      : 0
  };

  res.json({
    success: true,
    data: stats
  });
});

// === ERROR HANDLING ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`✅ Serveur API Pointages démarré sur http://localhost:${PORT}`);
  console.log(`📊 ${pointages.length} pointages en mémoire`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
