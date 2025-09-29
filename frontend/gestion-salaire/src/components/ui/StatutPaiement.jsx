import React from 'react';
import Badge from './Badge';

// Composant affichant le statut de paiement sous forme de badge avec texte explicatif
const StatutPaiement = ({ montantTotal, montantPaye, showDetails = true, className = '' }) => {
  // Calcul du statut de paiement
  const calculStatutPaiement = () => {
    if (montantPaye === 0) {
      return { 
        status: 'EN_ATTENTE', 
        label: 'En attente', 
        variant: 'danger',
        description: 'Aucun paiement enregistré'
      };
    } 
    
    if (montantPaye < montantTotal) {
      const pourcentage = Math.round((montantPaye / montantTotal) * 100);
      return { 
        status: 'PARTIEL', 
        label: 'Partiel', 
        variant: 'warning',
        description: `Payé à ${pourcentage}%`
      };
    }
    
    return { 
      status: 'PAYE', 
      label: 'Payé', 
      variant: 'success',
      description: 'Paiement complet'
    };
  };

  // Fonction utilitaire pour formater les montants en devise
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant || 0);
  };

  const statutPaiement = calculStatutPaiement();

  return (
    <div className={`flex items-center ${className}`}>
      <Badge variant={statutPaiement.variant}>{statutPaiement.label}</Badge>
      
      {showDetails && (
        <span className="text-xs ml-2 text-gray-600">
          {formatMontant(montantPaye)} / {formatMontant(montantTotal)}
        </span>
      )}
    </div>
  );
};

export default StatutPaiement;