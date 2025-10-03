import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  X
} from 'lucide-react';

/**
 * 📊 PREMIUM DATA TABLE - Tableau de données moderne
 */
export const DataTable = ({ 
  columns = [], 
  data = [], 
  actions,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
  hoverable = true,
  striped = false,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Filter className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucune donnée
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border-2 border-gray-300 dark:border-gray-700 shadow-lg ${className}`}>
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
          <tr>
            {actions && (
              <th className="px-6 py-5 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-lg border-2 border-gray-400 dark:border-gray-500 text-indigo-600 focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-5 text-left text-sm font-extrabold text-gray-900 dark:text-gray-50 uppercase tracking-wide"
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                  >
                    <span>{column.label}</span>
                    {sortConfig.key === column.key ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          <AnimatePresence>
            {sortedData.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: rowIndex * 0.05 }}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                  ${hoverable ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer' : ''}
                  ${selectedRows.has(row.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                  transition-colors
                `}
              >
                {actions && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <TableActions actions={actions} row={row} />
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

/**
 * ⚡ TABLE ACTIONS - Menu d'actions pour chaque ligne
 */
const TableActions = ({ actions, row }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 z-20 overflow-hidden"
            >
              <div className="py-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm font-medium
                      flex items-center gap-3
                      ${action.variant === 'danger' 
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      transition-colors
                    `}
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🏷️ STATUS BADGE - Badge de statut pour tableaux
 */
export const StatusBadge = ({ status, variant = 'default' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2
      ${variants[variant]}
    `}>
      <span className={`w-2 h-2 rounded-full mr-2 ${
        variant === 'success' ? 'bg-emerald-600' :
        variant === 'warning' ? 'bg-amber-600' :
        variant === 'danger' ? 'bg-red-600' :
        variant === 'info' ? 'bg-blue-600' :
        'bg-gray-600'
      }`} />
      {status}
    </span>
  );
};

/**
 * 📄 PAGINATION - Composant de pagination
 */
export const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  className = ''
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(page => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown className="w-5 h-5 rotate-90" />
      </motion.button>

      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <React.Fragment key={page}>
            {showEllipsis && (
              <span className="px-3 py-2 text-gray-400">...</span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page)}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all
                ${page === currentPage 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              {page}
            </motion.button>
          </React.Fragment>
        );
      })}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown className="w-5 h-5 -rotate-90" />
      </motion.button>
    </div>
  );
};

/**
 * 🔢 TABLE STATS - Statistiques du tableau
 */
export const TableStats = ({ 
  totalItems, 
  currentPage, 
  itemsPerPage,
  className = '' 
}) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <p>
        Affichage de <span className="font-bold text-gray-900 dark:text-white">{start}</span> à{' '}
        <span className="font-bold text-gray-900 dark:text-white">{end}</span> sur{' '}
        <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> résultats
      </p>
    </div>
  );
};
