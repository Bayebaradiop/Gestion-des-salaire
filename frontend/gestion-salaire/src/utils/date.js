/**
 * Fonctions utilitaires pour la manipulation des dates
 */

/**
 * Formater une date en format local (JJ/MM/AAAA)
 * @param {string|Date} date - La date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  // Si la date est une chaîne, la convertir en objet Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Vérifier que la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  // Formatter la date au format JJ/MM/AAAA
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formater une date et heure en format local (JJ/MM/AAAA HH:MM)
 * @param {string|Date} date - La date à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  // Si la date est une chaîne, la convertir en objet Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Vérifier que la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  // Formatter la date et l'heure au format JJ/MM/AAAA HH:MM
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtenir le premier jour du mois pour une date donnée
 * @param {Date|string|number} date - La date de référence, ou l'année si month est fourni
 * @param {number} [month] - Le mois (0-11) si date est une année
 * @returns {Date} Premier jour du mois
 */
export const getFirstDayOfMonth = (date, month) => {
  let year, monthIndex;
  
  if (typeof date === 'number' && typeof month === 'number') {
    // Si date est une année et month est fourni
    year = date;
    monthIndex = month;
  } else {
    // Sinon, utiliser la date fournie
    const dateObj = new Date(date);
    year = dateObj.getFullYear();
    monthIndex = dateObj.getMonth();
  }
  
  return new Date(year, monthIndex, 1);
};

/**
 * Obtenir le dernier jour du mois pour une date donnée
 * @param {Date|string|number} date - La date de référence, ou l'année si month est fourni
 * @param {number} [month] - Le mois (0-11) si date est une année
 * @returns {Date} Dernier jour du mois
 */
export const getLastDayOfMonth = (date, month) => {
  let year, monthIndex;
  
  if (typeof date === 'number' && typeof month === 'number') {
    // Si date est une année et month est fourni
    year = date;
    monthIndex = month;
  } else {
    // Sinon, utiliser la date fournie
    const dateObj = new Date(date);
    year = dateObj.getFullYear();
    monthIndex = dateObj.getMonth();
  }
  
  // Le jour 0 du mois suivant correspond au dernier jour du mois actuel
  return new Date(year, monthIndex + 1, 0);
};

/**
 * Formater un montant en format monétaire (ex: 1 234,56 FCFA)
 * @param {number} amount - Le montant à formater
 * @param {string} [currency='FCFA'] - La devise
 * @returns {string} Montant formaté
 */
export const formatAmount = (amount, currency = 'FCFA') => {
  if (amount === null || amount === undefined) return '';
  
  // Formatter le montant avec séparateur de milliers et 2 décimales
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${formatter.format(amount)} ${currency}`;
};