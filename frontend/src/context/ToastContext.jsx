import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const toastFn = (msg, type = 'info') => push(type, msg);
  toastFn.success = (msg) => push('success', msg);
  toastFn.error = (msg) => push('error', msg);
  toastFn.info = (msg) => push('info', msg);
  toastFn.warning = (msg) => push('warning', msg);

  return (
    <ToastContext.Provider value={{ toast: toastFn }}>
      {children}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}