import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { EmployeProvider } from './context/EmployerContext';
import { EntrepriseProvider } from './context/EntrepriseContext';
import { CyclePaieProvider } from './context/cyclepaiContext';
import { BulletinPaieProvider } from './context/BulletinPaieContext';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <EmployeProvider>
          <EntrepriseProvider>
            <CyclePaieProvider>
              <BulletinPaieProvider>
                <App />
                <ToastContainer position="top-right" autoClose={3000} />
              </BulletinPaieProvider>
            </CyclePaieProvider>
          </EntrepriseProvider>
        </EmployeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);