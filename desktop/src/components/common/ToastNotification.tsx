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
        width: '360px',
        background: 'rgba(250,250,252,.98)',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        gap: '12px',
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
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
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
          <span style={{ font: '700 13px sans-serif', color: '#0F172A' }}>NLTASK</span>
          <span style={{ font: '500 12px sans-serif', color: '#94A3B8' }}>bây giờ</span>
        </div>
        <div style={{ font: '600 15px sans-serif', color: '#0F172A', marginTop: '2px' }}>{toast.title}</div>
        <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginTop: '2px' }}>
          Đến giờ: {toast.time}
        </div>
      </div>
    </div>
  );
}
