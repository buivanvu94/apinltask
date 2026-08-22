import { useState } from 'react';
import { User } from '../../types/auth';
import { CreateUserInput, UpdateUserInput } from '../../services/users-service';

interface UserCreateEditModalProps {
  userToEdit: User | null;
  onSaveCreate: (input: CreateUserInput) => Promise<void>;
  onSaveUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  onClose: () => void;
}

export function UserCreateEditModal({
  userToEdit,
  onSaveCreate,
  onSaveUpdate,
  onClose,
}: UserCreateEditModalProps) {
  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>(userToEdit?.role || 'USER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }

    if (!userToEdit) {
      if (!email.trim()) {
        setErrorMsg('Vui lòng nhập địa chỉ email.');
        return;
      }
      if (!password || password.length < 8) {
        setErrorMsg('Mật khẩu phải có tối thiểu 8 ký tự.');
        return;
      }
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (userToEdit) {
        await onSaveUpdate(userToEdit.id, { name: name.trim(), role });
      } else {
        await onSaveCreate({ name: name.trim(), email: email.trim(), password, role });
      }
      onClose();
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setErrorMsg(msg || 'Thao tác không thành công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    outline: 'none',
    background: '#F8FAFC',
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '440px',
          background: '#fff',
          borderRadius: '22px',
          padding: '24px 26px',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 25px 50px -12px rgba(15,23,42,.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ font: "700 17px 'Space Grotesk', sans-serif", color: '#0F172A' }}>
            {userToEdit ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="15" height="15"><path d="M6 6l12 12M18 6L6 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', color: '#DC2626', fontSize: '13px', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Họ và tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required style={inputStyle} />
          </div>

          {!userToEdit && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@nltask.local" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Mật khẩu (≥ 8 ký tự)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phân quyền</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('USER')}
                style={{ flex: 1, padding: '9px', borderRadius: '10px', font: '600 13px sans-serif', border: `1px solid ${role === 'USER' ? '#2563EB' : '#E2E8F0'}`, background: role === 'USER' ? '#EFF4FF' : '#fff', color: role === 'USER' ? '#2563EB' : '#334155', cursor: 'pointer' }}
              >
                USER
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                style={{ flex: 1, padding: '9px', borderRadius: '10px', font: '600 13px sans-serif', border: `1px solid ${role === 'ADMIN' ? '#7C3AED' : '#E2E8F0'}`, background: role === 'ADMIN' ? '#F5F0FF' : '#fff', color: role === 'ADMIN' ? '#7C3AED' : '#334155', cursor: 'pointer' }}
              >
                ADMIN
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: '#F1F5F9', border: 'none', font: '700 13.5px sans-serif', color: '#334155', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: isSubmitting ? '#94A3B8' : '#2563EB', border: 'none', font: '700 13.5px sans-serif', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
