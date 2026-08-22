import { useState, useEffect } from 'react';
import { WeekStats } from '../types/stats';
import { getWeekStats } from '../services/stats-service';
import { StatsWeekBarChart } from '../components/stats/stats-week-bar-chart';
import { StatsCategoryBreakdown } from '../components/stats/stats-category-breakdown';

interface StatsViewProps {
  now: Date;
}

export function StatsView({ now }: StatsViewProps) {
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getWeekStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load week stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div style={{ flex: 1, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ font: '600 14px sans-serif', color: '#94A3B8' }}>Đang tải thống kê...</div>
      </div>
    );
  }

  const completionRateWeek = stats.completionRateWeek || 0;
  const donutStyle = `conic-gradient(#2563EB ${completionRateWeek}%, #E2E8F0 0)`;
  const todayWeekdayIndex = (now.getDay() + 6) % 7;
  const maxCount = Math.max(1, ...(stats.weekBars?.map((b) => b.count) || [1]));

  return (
    <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ font: "700 26px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '4px' }}>
        Thống kê
      </div>
      <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginBottom: '22px' }}>
        Tuần này
      </div>

      {/* Top 3 Cards Row */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Donut Card */}
        <div
          style={{
            width: '220px',
            flex: 'none',
            background: '#fff',
            borderRadius: '18px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
          }}
        >
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: donutStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 17px 'Space Grotesk',sans-serif", color: '#0F172A' }}>
              {completionRateWeek}%
            </div>
          </div>
          <div style={{ font: '600 12.5px sans-serif', color: '#64748B' }}>Tỉ lệ hoàn thành</div>
        </div>

        {/* Streak Card */}
        <div
          style={{
            width: '220px',
            flex: 'none',
            background: '#fff',
            borderRadius: '18px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M12 2c1 3-3 4-3 8a4 4 0 0 0 8 0c0-1.5-1-2.5-1-2.5s.5 2-1 2.5c1-2 -0.5-4.5 -2-6 0 2-2 3-2 5a2 2 0 0 0 4 0"
                stroke="#D97706"
                strokeWidth="1.6"
                fill="#FEF3C7"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ font: "700 22px 'Space Grotesk',sans-serif", color: '#0F172A' }}>
            {stats.streakDays} ngày
          </div>
          <div style={{ font: '600 12.5px sans-serif', color: '#64748B' }}>Chuỗi liên tiếp</div>
        </div>

        {/* 7-Day Chart Card Component */}
        <StatsWeekBarChart
          weekBars={stats.weekBars || []}
          todayWeekdayIndex={todayWeekdayIndex}
          maxCount={maxCount}
        />
      </div>

      {/* Category Breakdown Card Component */}
      <StatsCategoryBreakdown categories={stats.categoryBreakdown || []} />
    </div>
  );
}
