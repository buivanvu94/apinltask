import { User } from '../../types/auth';

interface SidebarUserFooterProps {
  user: User | null;
  onLogout: () => void;
}

export function SidebarUserFooter({ user, onLogout }: SidebarUserFooterProps) {
  return (
    <>
      {user && (
        <div
          style={{
            marginBottom: '14px',
            padding: '12px 10px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div
              style={{
                font: '600 14.5px sans-serif',
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </div>
            {user.role && (
              <span
                style={{
                  font: '700 10.5px sans-serif',
                  background: user.role === 'ADMIN' ? 'rgba(168,85,247,0.3)' : 'rgba(59,130,246,0.3)',
                  color: user.role === 'ADMIN' ? '#E9D5FF' : '#BFDBFE',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                {user.role}
              </span>
            )}
          </div>
          <div
            style={{
              font: '500 12.5px sans-serif',
              color: 'rgba(255,255,255,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '10px',
            }}
          >
            {user.email}
          </div>
          <button
            onClick={onLogout}
            title="Đăng xuất khỏi tài khoản"
            style={{
              width: '100%',
              background: 'rgba(239,68,68,0.18)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5',
              borderRadius: '10px',
              padding: '8px 10px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}

      <div style={{ font: '600 12.5px sans-serif', color: 'rgba(255,255,255,.35)', padding: '0 8px' }}>
        NLTASK · v1.0.0
      </div>
    </>
  );
}
