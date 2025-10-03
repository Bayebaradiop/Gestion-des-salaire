import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PaiementProvider } from './context/PaiementContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <PaiementProvider>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </PaiementProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);