import { User } from '../../types/auth';
import { fmtDateShort, parseDate } from '../../utils/date-format-utils';

interface UsersTableRowProps {
  user: User;
  currentUserId?: string;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTableRow({
  user,
  currentUserId,
  onEdit,
  onResetPassword,
  onDelete,
}: UsersTableRowProps) {
  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === 'ADMIN';
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  const roleStyle = isAdmin
    ? { color: '#7C3AED', bg: '#F5F0FF', border: 'rgba(124, 58, 237, 0.2)' }
    : { color: '#2563EB', bg: '#EFF4FF', border: 'rgba(37, 99, 235, 0.2)' };

  const createdLabel = user.createdAt ? fmtDateShort(parseDate(user.createdAt)) : '--';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #F1F5F9',
        gap: '14px',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F8FAFC';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Avatar Initials */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: isAdmin ? 'linear-gradient(135deg, #7C3AED, #4C1D95)' : 'linear-gradient(135deg, #3B7CF6, #152A63)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          font: "700 14px 'Space Grotesk', sans-serif",
          flex: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }}
      >
        {initial}
      </div>

      {/* User Info */}
      <div style={{ flex: '1.2', minWidth: 0 }}>
        <div style={{ font: '600 14px sans-serif', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
          {isSelf && (
            <span style={{ font: '600 10.5px sans-serif', color: '#16A34A', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
              Bạn
            </span>
          )}
        </div>
        <div style={{ font: '500 12.5px sans-serif', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ width: '90px', flex: 'none' }}>
        <span
          style={{
            font: '700 11.5px sans-serif',
            color: roleStyle.color,
            background: roleStyle.bg,
            border: `1px solid ${roleStyle.border}`,
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          {user.role}
        </span>
      </div>

      {/* Created At */}
      <div style={{ width: '80px', flex: 'none', font: '500 12.5px sans-serif', color: '#94A3B8' }}>
        {createdLabel}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flex: 'none' }}>
        <button
          onClick={() => onEdit(user)}
          title="Chỉnh sửa thông tin"
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '8px',
            padding: '7px',
            display: 'flex',
            color: '#2563EB',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M4 20l1-4L17 4l3 3-12 12-4 1z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => onResetPassword(user)}
          title="Đặt lại mật khẩu"
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '8px',
            padding: '7px',
            display: 'flex',
            color: '#D97706',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M21 2l-2 2m-2-2l2 2m-4 4l3-3 2 2-3 3M3 14a7 7 0 1 1 12 5l-7-7-5 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(user)}
          disabled={isSelf}
          title={isSelf ? 'Không thể xoá tài khoản đang đăng nhập' : 'Xoá thành viên'}
          style={{
            background: isSelf ? '#F8FAFC' : '#FEE2E2',
            border: 'none',
            borderRadius: '8px',
            padding: '7px',
            display: 'flex',
            color: isSelf ? '#CBD5E1' : '#DC2626',
            cursor: isSelf ? 'not-allowed' : 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
