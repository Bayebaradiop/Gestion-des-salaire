import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 5000,
      type: 'info',
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Succès',
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Erreur',
      message,
      duration: 8000,
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Attention',
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Information',
      message,
      ...options
    });
  };

  const premium = (message, options = {}) => {
    return addNotification({
      type: 'premium',
      title: 'Premium',
      message,
      ...options
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    premium
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};