import { useState } from 'react';
import { User } from '../../types/auth';

interface UserResetPasswordModalProps {
  user: User;
  onConfirm: (id: string, newPass: string) => Promise<void>;
  onClose: () => void;
}

export function UserResetPasswordModal({
  user,
  onConfirm,
  onClose,
}: UserResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm(user.id, newPassword);
      onClose();
    } catch (err) {
      console.error('Failed to reset password:', err);
      setErrorMsg('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 60, backdropFilter: 'blur(4px)' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '380px',
          background: '#fff',
          borderRadius: '20px',
          padding: '22px 24px',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 25px 50px -12px rgba(15,23,42,.3)',
        }}
      >
        <div style={{ font: "700 16px 'Space Grotesk', sans-serif", color: '#0F172A', marginBottom: '6px' }}>
          Đặt lại mật khẩu
        </div>
        <div style={{ font: '500 13px sans-serif', color: '#64748B', marginBottom: '16px' }}>
          Đặt mật khẩu mới cho tài khoản <strong>{user.email}</strong>.
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', color: '#DC2626', fontSize: '12.5px', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              Mật khẩu mới (≥ 8 ký tự)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', background: '#F8FAFC' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#F1F5F9', border: 'none', font: '700 13px sans-serif', color: '#334155', cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', background: isSubmitting ? '#94A3B8' : '#D97706', border: 'none', font: '700 13px sans-serif', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
