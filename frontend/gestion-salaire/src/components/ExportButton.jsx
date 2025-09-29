import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { FaFileExport, FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const ExportOptionsModal = ({ isOpen, onClose, onExport, exportTypes = ['pdf', 'csv', 'excel'] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(exportTypes[0] || 'pdf');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await onExport({
        type: selectedType,
        dateDebut,
        dateFin,
        includeInactive
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Une erreur est survenue lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Options d'exportation"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            isLoading={loading}
            disabled={loading}
          >
            Exporter
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format d'export
          </label>
          <div className="grid grid-cols-3 gap-3">
            {exportTypes.includes('pdf') && (
              <div
                className={`
                  flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border-2
                  ${selectedType === 'pdf' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedType('pdf')}
              >
                <FaFilePdf size={24} className="text-red-500 mb-2" />
                <span className="text-sm font-medium">PDF</span>
              </div>
            )}
            
            {exportTypes.includes('csv') && (
              <div
                className={`
                  flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border-2
                  ${selectedType === 'csv' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedType('csv')}
              >
                <FaFileCsv size={24} className="text-green-600 mb-2" />
                <span className="text-sm font-medium">CSV</span>
              </div>
            )}
            
            {exportTypes.includes('excel') && (
              <div
                className={`
                  flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border-2
                  ${selectedType === 'excel' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedType('excel')}
              >
                <FaFileExcel size={24} className="text-green-800 mb-2" />
                <span className="text-sm font-medium">Excel</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="includeInactive"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-700">
            Inclure les éléments inactifs/archivés
          </label>
        </div>
      </div>
    </Modal>
  );
};

// Bouton d'export avec modal d'options
const ExportButton = ({ onExport, exportTypes, buttonText = 'Exporter', variant = 'outline', size = 'md' }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
      >
        <FaFileExport className="mr-2" /> {buttonText}
      </Button>
      
      <ExportOptionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onExport={onExport}
        exportTypes={exportTypes}
      />
    </>
  );
};

export default ExportButton;