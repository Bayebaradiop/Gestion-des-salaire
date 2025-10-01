import React from 'react';
import EntrepriseHeader from './EntrepriseHeader';

const Layout = ({ children, showEntrepriseHeader = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showEntrepriseHeader && <EntrepriseHeader />}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;