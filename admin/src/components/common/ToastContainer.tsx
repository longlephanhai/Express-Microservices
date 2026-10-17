import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeToast } from '../../features/ui/uiSlice';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, toast.duration || 4000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="var(--color-success)" />,
    warning: <AlertTriangle size={18} color="var(--color-warning)" />,
    error: <XCircle size={18} color="var(--color-danger)" />,
    info: <Info size={18} color="var(--color-info)" />,
  };

  const bgBorderMap = {
    success: 'rgba(16, 185, 129, 0.2)',
    warning: 'rgba(245, 158, 11, 0.2)',
    error: 'rgba(239, 68, 68, 0.2)',
    info: 'rgba(6, 182, 212, 0.2)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass"
          style={{
            pointerEvents: 'auto',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderColor: bgBorderMap[toast.type],
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {iconMap[toast.type]}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {toast.message}
            </span>
          </div>

          <button
            onClick={() => dispatch(removeToast(toast.id))}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
