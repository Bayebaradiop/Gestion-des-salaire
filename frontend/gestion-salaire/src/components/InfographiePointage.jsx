import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Clock, TrendingUp, Settings, 
  FileText, Bell, Edit, Calendar, MapPin, Camera 
} from 'lucide-react';

/**
 * InfograhiePointage - Composant React Premium
 * 
 * Affiche une infographie interactive expliquant le système de pointage
 * avec 5 statuts (Présent, Absent, Retard, Heures Sup, Cas Particulier)
 * 
 * @param {Object} props
 * @param {boolean} props.darkMode - Active le mode sombre
 * @param {function} props.onExportPDF - Callback pour export PDF
 * @param {boolean} props.reduceMotion - Réduit les animations (accessibilité)
 */
const InfographiePointage = ({ 
  darkMode = false, 
  onExportPDF = () => {}, 
  reduceMotion = false 
}) => {
  const [activeCard, setActiveCard] = useState(null);

  // Variantes d'animations Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.6, ease: 'easeOut' }
    }
  };

  const pulseVariants = {
    pulse: reduceMotion ? {} : {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // Données des statuts
  const statuts = [
    {
      id: 'present',
      titre: 'PRÉSENT',
      badge: '✓ Validé',
      description: "L'employé a correctement pointé son arrivée et son départ.",
      exemple: {
        titre: 'Exemple concret :',
        detail: 'Arrivée 08h00 → Départ 17h00',
        resultat: '9h de travail',
        note: 'Calcul automatique de la durée • Présence validée'
      },
      icon: CheckCircle2,
      color: 'green',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      borderLight: 'border-green-200',
      borderDark: 'dark:border-green-700',
      textLight: 'text-green-600',
      textDark: 'dark:text-green-400',
      iconBgLight: 'bg-green-100',
      iconBgDark: 'dark:bg-green-900/30',
      badgeBgLight: 'bg-green-100',
      badgeBgDark: 'dark:bg-green-900/40',
      exampleBgLight: 'bg-green-50',
      exampleBgDark: 'dark:bg-green-900/10',
      borderLeftLight: 'border-green-500',
      borderLeftDark: 'dark:border-green-600'
    },
    {
      id: 'absent',
      titre: 'ABSENT',
      badge: '⚠ À justifier',
      description: 'Aucun pointage enregistré pour la journée.',
      exemple: {
        titre: 'Exemple concret :',
        detail: 'Aucune arrivée, aucun départ',
        resultat: 'Journée vide',
        note: 'Absence signalée • Justification requise (congé, maladie)'
      },
      icon: XCircle,
      color: 'red',
      bgLight: 'bg-red-50',
      bgDark: 'dark:bg-red-900/20',
      borderLight: 'border-red-200',
      borderDark: 'dark:border-red-700',
      textLight: 'text-red-600',
      textDark: 'dark:text-red-400',
      iconBgLight: 'bg-red-100',
      iconBgDark: 'dark:bg-red-900/30',
      badgeBgLight: 'bg-red-100',
      badgeBgDark: 'dark:bg-red-900/40',
      exampleBgLight: 'bg-red-50',
      exampleBgDark: 'dark:bg-red-900/10',
      borderLeftLight: 'border-red-500',
      borderLeftDark: 'dark:border-red-600',
      pulse: true
    },
    {
      id: 'retard',
      titre: 'RETARD',
      badge: '⏰ Signalé',
      description: "L'employé arrive après l'heure prévue.",
      exemple: {
        titre: 'Exemple concret :',
        detail: 'Heure prévue 08h00 → Arrivée 08h27',
        resultat: '27 min de retard',
        note: 'Retard calculé • Notifié au service RH pour suivi'
      },
      icon: Clock,
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      borderLight: 'border-orange-200',
      borderDark: 'dark:border-orange-700',
      textLight: 'text-orange-600',
      textDark: 'dark:text-orange-400',
      iconBgLight: 'bg-orange-100',
      iconBgDark: 'dark:bg-orange-900/30',
      badgeBgLight: 'bg-orange-100',
      badgeBgDark: 'dark:bg-orange-900/40',
      exampleBgLight: 'bg-orange-50',
      exampleBgDark: 'dark:bg-orange-900/10',
      borderLeftLight: 'border-orange-500',
      borderLeftDark: 'dark:border-orange-600'
    },
    {
      id: 'heures-sup',
      titre: 'HEURES SUP',
      badge: '💰 Majorées',
      description: "L'employé part après l'heure prévue.",
      exemple: {
        titre: 'Exemple concret :',
        detail: 'Départ prévu 17h00 → Départ 20h15',
        resultat: '3h15 d\'heures sup',
        note: 'Comptabilisées pour majoration de salaire (+25% ou +50%)'
      },
      icon: TrendingUp,
      color: 'blue',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      borderLight: 'border-blue-200',
      borderDark: 'dark:border-blue-700',
      textLight: 'text-blue-600',
      textDark: 'dark:text-blue-400',
      iconBgLight: 'bg-blue-100',
      iconBgDark: 'dark:bg-blue-900/30',
      badgeBgLight: 'bg-blue-100',
      badgeBgDark: 'dark:bg-blue-900/40',
      exampleBgLight: 'bg-blue-50',
      exampleBgDark: 'dark:bg-blue-900/10',
      borderLeftLight: 'border-blue-500',
      borderLeftDark: 'dark:border-blue-600'
    }
  ];

  const casParticuliers = [
    { titre: 'Arrivée sans départ', note: 'Badge oublié en partant' },
    { titre: 'Départ sans arrivée', note: 'Badge oublié en arrivant' },
    { titre: 'Double pointage', note: 'Erreur technique système' }
  ];

  const regles = [
    { 
      icon: CheckCircle2, 
      titre: 'Un seul pointage par jour', 
      desc: 'Arrivée + Départ pour chaque employé',
      color: 'green'
    },
    { 
      icon: TrendingUp, 
      titre: 'Calcul automatique', 
      desc: 'Durée, retards et heures supplémentaires',
      color: 'blue'
    },
    { 
      icon: Edit, 
      titre: 'Correction manuelle', 
      desc: 'Interface manager pour cas particuliers',
      color: 'purple'
    },
    { 
      icon: FileText, 
      titre: 'Historique complet', 
      desc: '12 mois d\'archives consultables',
      color: 'amber'
    },
    { 
      icon: Bell, 
      titre: 'Notifications temps réel', 
      desc: 'Alertes automatiques pour anomalies (email + SMS + dashboard)',
      color: 'red',
      fullWidth: true
    }
  ];

  const etapes = [
    {
      numero: 1,
      titre: 'Marquer Arrivée',
      sousTitre: 'Badge, App mobile ou Interface web',
      points: [
        'Horodatage automatique',
        'Géolocalisation (si activée)',
        'Photo facultative'
      ],
      color: 'green',
      icon: Calendar
    },
    {
      numero: 2,
      titre: 'Marquer Départ',
      sousTitre: 'Même interface que l\'arrivée',
      points: [
        'Horodatage de sortie',
        'Validation automatique',
        'Durée calculée en temps réel'
      ],
      color: 'blue',
      icon: Clock
    },
    {
      numero: 3,
      titre: 'Calcul & Signalement',
      sousTitre: 'Traitement automatique',
      points: [
        'Détection retards/heures sup',
        'Notification email/SMS',
        'Mise à jour dashboard RH'
      ],
      color: 'purple',
      icon: TrendingUp
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HEADER */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 rounded-3xl shadow-2xl p-12 mb-12 text-center text-white"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
              Comment fonctionne le pointage des employés ?
            </h1>
            <p className="text-xl sm:text-2xl font-semibold opacity-90">
              Système automatisé de gestion du temps de travail
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm opacity-75">
              <FileText className="w-5 h-5" />
              <span>5 statuts essentiels pour une gestion RH optimale</span>
            </div>
          </div>
        </motion.header>

        {/* GRID STATUTS */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {statuts.map((statut, index) => {
              const Icon = statut.icon;
              return (
                <motion.div
                  key={statut.id}
                  variants={cardVariants}
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  onHoverStart={() => setActiveCard(statut.id)}
                  onHoverEnd={() => setActiveCard(null)}
                  className={`
                    bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 
                    ${statut.borderLight} ${statut.borderDark}
                    p-8 transition-shadow duration-300 hover:shadow-xl
                  `}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      variants={statut.pulse ? pulseVariants : {}}
                      animate={statut.pulse && activeCard !== statut.id ? "pulse" : ""}
                      className={`
                        w-16 h-16 ${statut.iconBgLight} ${statut.iconBgDark} 
                        rounded-xl flex items-center justify-center flex-shrink-0
                      `}
                    >
                      <Icon className={`w-10 h-10 ${statut.textLight} ${statut.textDark}`} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className={`
                        text-2xl font-bold ${statut.textLight} ${statut.textDark} 
                        mb-3 flex items-center gap-2
                      `}>
                        {statut.titre}
                        <span className={`
                          text-sm font-semibold ${statut.badgeBgLight} ${statut.badgeBgDark}
                          ${statut.textLight} ${statut.textDark} px-3 py-1 rounded-full
                        `}>
                          {statut.badge}
                        </span>
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4 text-base leading-relaxed">
                        {statut.description}
                      </p>
                      <div className={`
                        ${statut.exampleBgLight} ${statut.exampleBgDark} 
                        border-l-4 ${statut.borderLeftLight} ${statut.borderLeftDark}
                        p-4 rounded-lg
                      `}>
                        <p className={`text-sm font-bold ${statut.textLight} ${statut.textDark} mb-1`}>
                          📌 {statut.exemple.titre}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-bold">{statut.exemple.detail}</span> = <span className={`${statut.textLight} ${statut.textDark} font-extrabold`}>{statut.exemple.resultat}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {statut.exemple.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CAS PARTICULIER (Full Width) */}
          <motion.div
            variants={cardVariants}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-300 dark:border-gray-700 p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-10 h-10 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  CAS PARTICULIER
                  <span className="text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                    🔧 Correction manuelle
                  </span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4 text-base leading-relaxed">
                  Pointage incomplet nécessitant une correction manuelle par le manager.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 dark:border-gray-600 p-4 rounded-lg">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                    📌 Exemples concrets :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    {casParticuliers.map((cas, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={reduceMotion ? {} : { scale: 1.05 }}
                        className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <span className="font-bold text-gray-900 dark:text-white">{cas.titre}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cas.note}</p>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    🔧 Anomalie signalée • Validation manager requise • Interface de correction dédiée
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* RÈGLES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Règles & Fonctionnement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regles.map((regle, idx) => {
              const Icon = regle.icon;
              const colorMap = {
                green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              };
              return (
                <motion.div
                  key={idx}
                  whileHover={reduceMotion ? {} : { scale: 1.03 }}
                  className={`
                    flex items-start gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm
                    ${regle.fullWidth ? 'md:col-span-2' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[regle.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{regle.titre}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{regle.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* FLOW 3 ÉTAPES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Processus en 3 Étapes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Flèche Desktop */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-indigo-300 dark:border-indigo-700"></div>
              </div>
            </div>
            
            {etapes.map((etape, idx) => {
              const Icon = etape.icon;
              const colorMap = {
                green: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-700 bg-green-600 dark:bg-green-700',
                blue: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-700 bg-blue-600 dark:bg-blue-700',
                purple: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-700 bg-purple-600 dark:bg-purple-700'
              };
              const [gradientClass, borderClass, bgClass] = colorMap[etape.color].split(' ');
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 border-2 ${borderClass} text-center relative z-10`}>
                    <div className={`w-16 h-16 ${bgClass} text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 shadow-lg`}>
                      {etape.numero}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{etape.titre}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-semibold">{etape.sousTitre}</p>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-left">
                      {etape.points.map((point, pidx) => (
                        <p key={pidx} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          ✓ {point}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 inline mr-2" />
              <span className="font-bold text-indigo-900 dark:text-indigo-300">Temps de traitement moyen :</span> 
              Moins de 2 secondes entre pointage et notification
            </p>
          </div>
        </motion.section>

        {/* FOOTER + EXPORT */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-950 dark:to-black rounded-2xl shadow-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Besoin d'exporter cette infographie ?</h3>
              <p className="text-sm text-gray-300">Téléchargez en PDF haute résolution (1920×1080) pour vos présentations PowerPoint</p>
            </div>
            <motion.button
              whileHover={reduceMotion ? {} : { scale: 1.05 }}
              whileTap={reduceMotion ? {} : { scale: 0.95 }}
              onClick={onExportPDF}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
            >
              <FileText className="w-6 h-6" />
              Télécharger PDF
            </motion.button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-800 text-center text-sm text-gray-400">
            <p>© 2025 Gestion des Salaires • Infographie créée par Dr. UI/UX & Dr. Full-Stack Developer</p>
            <p className="mt-2">Conforme WCAG AA • Design responsive • Accessible à tous</p>
          </div>
        </motion.footer>

      </div>
    </div>
  );
};

export default InfographiePointage;
