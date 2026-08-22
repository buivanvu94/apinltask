import { useAuth } from '../../contexts/AuthContext';
import { SidebarUserFooter } from './sidebar-user-footer';

export type NavTab = 'today' | 'history' | 'stats' | 'settings' | 'users';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAdd: () => void;
}

export function Sidebar({ currentTab, onSelectTab, onOpenAdd }: SidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const getNavStyle = (tab: NavTab) => {
    const active = currentTab === tab;
    return {
      bg: active ? 'rgba(255,255,255,.14)' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,.55)',
    };
  };

  const navToday = getNavStyle('today');
  const navHistory = getNavStyle('history');
  const navStats = getNavStyle('stats');
  const navSettings = getNavStyle('settings');
  const navUsers = getNavStyle('users');

  return (
    <div
      style={{
        width: '256px',
        flex: 'none',
        background: 'linear-gradient(180deg,#152A63 0%,#0B1220 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '0 6px', marginBottom: '22px' }}>
        <img
          src="/logo.png"
          alt="NLTECH Logo"
          style={{
            width: '36px',
            height: '36px',
            objectFit: 'contain',
            flex: 'none',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
          }}
        />
        <div>
          <div style={{ font: "700 17px 'Space Grotesk',sans-serif", color: '#fff', letterSpacing: '.02em', lineHeight: 1.2 }}>
            NLTECH
          </div>
          <div style={{ font: "600 11px sans-serif", color: 'rgba(255,255,255,0.5)', letterSpacing: '.04em' }}>
            TASK MANAGER
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={onOpenAdd}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          background: '#fff',
          border: 'none',
          font: '700 15px sans-serif',
          color: '#152A63',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 5v14M5 12h14" stroke="#152A63" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        Thêm công việc
      </button>

      {/* Navigation Tabs */}
      <button
        onClick={() => onSelectTab('today')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: navToday.bg, marginBottom: '3px', textAlign: 'left', width: '100%' }}
      >
        <svg viewBox="0 0 24 24" width="19" height="19">
          <rect x="4" y="5" width="16" height="15" rx="3" stroke={navToday.color} strokeWidth="2" fill="none" />
          <path d="M8 10h8M8 14h5" stroke={navToday.color} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ font: '600 15px sans-serif', color: navToday.color }}>Hôm nay</span>
      </button>

      <button
        onClick={() => onSelectTab('history')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: navHistory.bg, marginBottom: '3px', textAlign: 'left', width: '100%' }}
      >
        <svg viewBox="0 0 24 24" width="19" height="19">
          <circle cx="12" cy="12" r="8.5" stroke={navHistory.color} strokeWidth="2" fill="none" />
          <path d="M12 8v4l3 2" stroke={navHistory.color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <span style={{ font: '600 15px sans-serif', color: navHistory.color }}>Lịch sử</span>
      </button>

      <button
        onClick={() => onSelectTab('stats')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: navStats.bg, marginBottom: '3px', textAlign: 'left', width: '100%' }}
      >
        <svg viewBox="0 0 24 24" width="19" height="19">
          <rect x="5" y="12" width="3.5" height="7" rx="1" fill={navStats.color} />
          <rect x="10.5" y="8" width="3.5" height="11" rx="1" fill={navStats.color} />
          <rect x="16" y="4" width="3.5" height="15" rx="1" fill={navStats.color} />
        </svg>
        <span style={{ font: '600 15px sans-serif', color: navStats.color }}>Thống kê</span>
      </button>

      <button
        onClick={() => onSelectTab('settings')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: navSettings.bg, marginBottom: '3px', textAlign: 'left', width: '100%' }}
      >
        <svg viewBox="0 0 24 24" width="19" height="19">
          <circle cx="7" cy="7" r="2" stroke={navSettings.color} strokeWidth="2" fill="none" />
          <path d="M4 7h6M13 7h7" stroke={navSettings.color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="17" cy="15" r="2" stroke={navSettings.color} strokeWidth="2" fill="none" />
          <path d="M4 15h10M20 15h0" stroke={navSettings.color} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ font: '600 15px sans-serif', color: navSettings.color }}>Cài đặt</span>
      </button>

      {/* Admin Tab: Thành viên */}
      {isAdmin && (
        <button
          onClick={() => onSelectTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: navUsers.bg, textAlign: 'left', width: '100%' }}
        >
          <svg viewBox="0 0 24 24" width="19" height="19">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={navUsers.color} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke={navUsers.color} strokeWidth="2" fill="none" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={navUsers.color} strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <span style={{ font: '600 15px sans-serif', color: navUsers.color }}>Thành viên</span>
            <span style={{ font: '700 11px sans-serif', background: 'rgba(124,58,237,0.3)', color: '#D8B4FE', padding: '2px 6px', borderRadius: '6px' }}>ADMIN</span>
          </div>
        </button>
      )}
      <div style={{ flex: 1 }} />

      {/* User Footer Component */}
      <SidebarUserFooter user={user} onLogout={logout} />
    </div>
  );
}
