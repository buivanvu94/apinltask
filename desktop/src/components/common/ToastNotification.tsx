import { useEffect } from 'react';

export interface ToastMessage {
  title: string;
  time: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({ toast, onClose, duration = 3200 }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '340px',
        background: 'rgba(250,250,252,.98)',
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        boxShadow: '0 16px 32px -12px rgba(15,23,42,.3)',
        zIndex: 70,
        animation: 'toastIn .2s ease-out',
        cursor: 'pointer',
        border: '1px solid rgba(226,232,240,.8)',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          background: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17">
          <path
            d="M12 21a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zM18 9a6 6 0 1 0-12 0c0 3.2-1 4.5-2 5.5h16c-1-1-2-2.3-2-5.5z"
            stroke="#fff"
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ font: '700 12px sans-serif', color: '#0F172A' }}>NLTASK</span>
          <span style={{ font: '500 11px sans-serif', color: '#94A3B8' }}>bây giờ</span>
        </div>
        <div style={{ font: '600 13.5px sans-serif', color: '#0F172A', marginTop: '1px' }}>{toast.title}</div>
        <div style={{ font: '500 12.5px sans-serif', color: '#64748B', marginTop: '1px' }}>
          Đến giờ: {toast.time}
        </div>
      </div>
    </div>
  );
}
