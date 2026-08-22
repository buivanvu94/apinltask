interface TaskDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskDeleteModal({ onConfirm, onCancel }: TaskDeleteModalProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.45)',
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '280px',
          background: '#fff',
          borderRadius: '20px',
          padding: '22px 20px',
          textAlign: 'center',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 20px 40px -10px rgba(15,23,42,.25)',
        }}
      >
        <div style={{ font: "700 15.5px 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '6px' }}>
          Xoá công việc này?
        </div>
        <div style={{ font: '500 13px sans-serif', color: '#64748B', marginBottom: '18px' }}>
          Hành động này không thể hoàn tác.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#F1F5F9',
              border: 'none',
              font: '700 13.5px sans-serif',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#DC2626',
              border: 'none',
              font: '700 13.5px sans-serif',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
