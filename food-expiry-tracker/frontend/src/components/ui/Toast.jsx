import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-success-50 text-success-800 border-success-200',
    error: 'bg-danger-50 text-danger-800 border-danger-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    info: 'bg-primary-50 text-primary-800 border-primary-200',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`flex items-center justify-between p-4 rounded-lg shadow-lg border ${colors[toast.type]}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;