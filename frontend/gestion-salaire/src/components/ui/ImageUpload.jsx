import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import authService from '../../services/auth.service';

const ImageUpload = ({ label, value, onChange, onFileSelect, onUpload, uploadEndpoint, className }) => {
  const [preview, setPreview] = useState(value ? (value.startsWith('/uploads/') ? `http://localhost:3000${value}` : value) : '');
  const [uploading, setUploading] = useState(false);

  // Mettre à jour le preview quand value change
  useEffect(() => {
    setPreview(value ? (value.startsWith('/uploads/') ? `http://localhost:3000${value}` : value) : '');
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`Le fichier est trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Envoyer le fichier original au parent
    onFileSelect?.(file);

    // Preview immédiat
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onChange?.(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload vers le backend si endpoint fourni
    if (uploadEndpoint) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        const response = await authService.axios.post(uploadEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const uploadedUrl = response.data.logoUrl || response.data.url || response.data.path || '';
        if (uploadedUrl) {
          // Pour les URLs relatives commençant par /uploads/, construire l'URL complète
          const fullUrl = uploadedUrl.startsWith('/uploads/') ? `http://localhost:3000${uploadedUrl}` : uploadedUrl;
          setPreview(fullUrl);
          onUpload?.(uploadedUrl); // Garder l'URL relative pour le stockage en DB
        }
        alert('Logo uploadé avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        alert('Impossible d\'uploader le logo');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange?.('');
    onUpload?.('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">Aperçu</span>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FaUpload className="mr-2" /> {uploading ? 'Upload...' : 'Choisir fichier'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          {preview && (
            <button type="button" onClick={handleRemove} className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              <FaTimes className="mr-2" /> Supprimer
            </button>
          )}
        </div>
      </div>
      {/* URL input toujours disponible */}
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">
          Ou saisissez une URL directe:
        </label>
        <input
          type="url"
          value={typeof value === 'string' && !(value instanceof File) ? value : ''}
          onChange={(e) => {
            const url = e.target.value;
            onChange(url);
            setPreview(url || '');
          }}
          placeholder="https://example.com/logo.png"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default ImageUpload;