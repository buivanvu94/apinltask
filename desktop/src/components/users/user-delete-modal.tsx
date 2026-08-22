import { User } from '../../types/auth';

interface UserDeleteModalProps {
  user: User;
  onConfirm: (id: string) => Promise<void>;
  onCancel: () => void;
}

export function UserDeleteModal({ user, onConfirm, onCancel }: UserDeleteModalProps) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 60, backdropFilter: 'blur(4px)' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '320px',
          background: '#fff',
          borderRadius: '20px',
          padding: '22px 24px',
          textAlign: 'center',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 25px 50px -12px rgba(15,23,42,.3)',
        }}
      >
        <div style={{ font: "700 16px 'Space Grotesk', sans-serif", color: '#0F172A', marginBottom: '6px' }}>
          Xoá thành viên?
        </div>
        <div style={{ font: '500 13px sans-serif', color: '#64748B', marginBottom: '18px', lineHeight: 1.4 }}>
          Bạn có chắc chắn muốn xoá tài khoản <strong>{user.email}</strong>? Tất cả công việc của người dùng này sẽ bị xoá.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: '10px', background: '#F1F5F9', border: 'none', font: '700 13px sans-serif', color: '#334155', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            style={{ flex: 1, padding: '11px', borderRadius: '10px', background: '#DC2626', border: 'none', font: '700 13px sans-serif', color: '#fff', cursor: 'pointer' }}
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
