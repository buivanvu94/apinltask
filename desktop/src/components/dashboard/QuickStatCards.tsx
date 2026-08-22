interface QuickStatCardsProps {
  completedCount: number;
  totalCount: number;
  progressPct: number;
  overdueCount: number;
  upcomingCount: number;
}

export function QuickStatCards({
  completedCount,
  totalCount,
  progressPct,
  overdueCount,
  upcomingCount,
}: QuickStatCardsProps) {
  const donutGradient = `conic-gradient(#2563EB ${progressPct}%, #E2E8F0 0)`;

  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {/* Today Progress Card */}
      <div
        style={{
          flex: 1,
          minWidth: '180px',
          background: '#fff',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: donutGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: "700 11px 'Space Grotesk',sans-serif",
              color: '#152A63',
            }}
          >
            {progressPct}%
          </div>
        </div>
        <div>
          <div style={{ font: "700 19px 'Space Grotesk',sans-serif", color: '#0F172A' }}>
            {completedCount}/{totalCount}
          </div>
          <div style={{ font: '600 12px sans-serif', color: '#94A3B8' }}>Hôm nay</div>
        </div>
      </div>

      {/* Overdue Card */}
      <div
        style={{
          flex: 1,
          minWidth: '180px',
          background: '#fff',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 8v5M12 16h0" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div>
          <div style={{ font: "700 19px 'Space Grotesk',sans-serif", color: '#0F172A' }}>{overdueCount}</div>
          <div style={{ font: '600 12px sans-serif', color: '#94A3B8' }}>Quá hạn</div>
        </div>
      </div>

      {/* Upcoming Card */}
      <div
        style={{
          flex: 1,
          minWidth: '180px',
          background: '#fff',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#EFF4FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <rect x="4" y="5" width="16" height="15" rx="3" stroke="#2563EB" strokeWidth="2" fill="none" />
            <path d="M4 10h16M8 3v4M16 3v4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ font: "700 19px 'Space Grotesk',sans-serif", color: '#0F172A' }}>{upcomingCount}</div>
          <div style={{ font: '600 12px sans-serif', color: '#94A3B8' }}>Sắp tới</div>
        </div>
      </div>
    </div>
  );
}
