import { DayBarData } from '../../types/stats';

interface StatsWeekBarChartProps {
  weekBars: DayBarData[];
  todayWeekdayIndex: number;
  maxCount: number;
}

export function StatsWeekBarChart({ weekBars, todayWeekdayIndex, maxCount }: StatsWeekBarChartProps) {
  const weekdayShort = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const totalCount = weekBars.reduce((sum, b) => sum + b.count, 0);
  const avgPerDay = (totalCount / 7).toFixed(1);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '24px 28px',
        boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
        border: '1px solid rgba(226, 232, 240, 0.7)',
        marginBottom: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ font: "700 18px 'Space Grotesk', sans-serif", color: '#0F172A', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            Biểu đồ công việc hoàn thành 7 ngày trong tuần
          </div>
          <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginTop: '4px' }}>
            Theo dõi tiến độ hoàn thành công việc theo từng ngày thực tế
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              font: '600 13px sans-serif',
              color: '#334155',
              background: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
            }}
          >
            Trung bình: <strong style={{ color: '#0F172A' }}>{avgPerDay}</strong> việc/ngày
          </div>

          <div
            style={{
              font: '700 13px sans-serif',
              color: '#2563EB',
              background: '#EFF6FF',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #DBEAFE',
            }}
          >
            Tổng: {totalCount} việc
          </div>
        </div>
      </div>

      {/* Full-width 7-Day Chart Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '170px',
          gap: '16px',
          padding: '16px 20px 10px',
          background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
        }}
      >
        {weekBars.map((bar, i) => {
          const isCurrentDay = i === todayWeekdayIndex;
          const barHeight = bar.count > 0 ? Math.max(16, Math.round((bar.count / maxCount) * 105)) : 6;
          const barBg = isCurrentDay
            ? 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)'
            : bar.count > 0
            ? 'linear-gradient(180deg, #93C5FD 0%, #2563EB 100%)'
            : '#CBD5E1';

          // Format date DD/MM from YYYY-MM-DD
          const dateParts = bar.dateKey ? bar.dateKey.split('-') : [];
          const dateDisplay = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : '';

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              {/* Value Badge on Top */}
              <div
                style={{
                  font: '700 13px sans-serif',
                  color: isCurrentDay ? '#2563EB' : bar.count > 0 ? '#0F172A' : '#94A3B8',
                  background: isCurrentDay ? '#EFF6FF' : bar.count > 0 ? '#fff' : 'transparent',
                  padding: bar.count > 0 ? '2px 8px' : '0',
                  borderRadius: '4px',
                  border: bar.count > 0 ? `1px solid ${isCurrentDay ? '#BFDBFE' : '#E2E8F0'}` : 'none',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {bar.count > 0 ? bar.count : '0'}
              </div>

              {/* Bar track container */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: '110px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '6px',
                  padding: '3px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    borderRadius: '5px',
                    background: barBg,
                    height: `${barHeight}px`,
                    transition: 'height .35s ease',
                    boxShadow: isCurrentDay && bar.count > 0 ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                  }}
                />
              </div>

              {/* Day Label & Date */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <div
                  style={{
                    font: isCurrentDay ? '700 13.5px sans-serif' : '600 13px sans-serif',
                    color: isCurrentDay ? '#2563EB' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{weekdayShort[i]}</span>
                  {isCurrentDay && (
                    <span
                      style={{
                        font: '700 9.5px sans-serif',
                        background: '#2563EB',
                        color: '#fff',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Hôm nay
                    </span>
                  )}
                </div>
                {dateDisplay && (
                  <div style={{ font: '500 11.5px sans-serif', color: isCurrentDay ? '#2563EB' : '#94A3B8' }}>
                    {dateDisplay}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
