import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = nextId;
    setNextId(id + 1);
    
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [nextId]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: toast.type === 'success' ? '#d4edda' : 
                            toast.type === 'error' ? '#f8d7da' : 
                            toast.type === 'warning' ? '#fff3cd' : '#d1ecf1',
            color: toast.type === 'success' ? '#155724' : 
                   toast.type === 'error' ? '#721c24' : 
                   toast.type === 'warning' ? '#856404' : '#0c5460',
            border: `1px solid ${toast.type === 'success' ? '#c3e6cb' : 
                                 toast.type === 'error' ? '#f5c6cb' : 
                                 toast.type === 'warning' ? '#ffeeba' : '#bee5eb'}`,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <span style={{ fontSize: '20px' }}>
              {toast.type === 'success' ? '✓' : 
               toast.type === 'error' ? '✕' : 
               toast.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'inherit',
              opacity: 0.7,
              padding: '0 4px'
            }}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
