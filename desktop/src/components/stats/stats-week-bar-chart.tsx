import { DayBarData } from '../../types/stats';

interface StatsWeekBarChartProps {
  weekBars: DayBarData[];
  todayWeekdayIndex: number;
  maxCount: number;
}

export function StatsWeekBarChart({ weekBars, todayWeekdayIndex, maxCount }: StatsWeekBarChartProps) {
  const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div
      style={{
        flex: 1,
        minWidth: '340px',
        background: '#fff',
        borderRadius: '18px',
        padding: '22px 24px',
        boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
      }}
    >
      <div style={{ font: '700 14.5px sans-serif', color: '#0F172A', marginBottom: '16px' }}>
        Công việc hoàn thành theo ngày
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '10px' }}>
        {weekBars.map((bar, i) => {
          const isCurrentDay = i === todayWeekdayIndex;
          const barHeight = Math.max(10, Math.round(10 + (bar.count / maxCount) * 85));
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ font: '600 11.5px sans-serif', color: '#94A3B8' }}>{bar.count}</div>
              <div
                style={{
                  width: '22px',
                  borderRadius: '6px',
                  background: isCurrentDay ? '#2563EB' : '#BFDBFE',
                  height: `${barHeight}px`,
                  transition: 'height .3s ease',
                }}
              />
              <div style={{ font: '600 11.5px sans-serif', color: isCurrentDay ? '#2563EB' : '#94A3B8' }}>
                {weekdayLabels[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
