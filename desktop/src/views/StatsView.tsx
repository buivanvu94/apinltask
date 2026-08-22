import { useState, useEffect } from 'react';
import { WeekStats } from '../types/stats';
import { getWeekStats } from '../services/stats-service';
import { StatsWeekBarChart } from '../components/stats/stats-week-bar-chart';
import { StatsCategoryBreakdown } from '../components/stats/stats-category-breakdown';
import { Skeleton } from '../components/common/SkeletonLoader';

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
      <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
        <div style={{ font: "700 28px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '4px' }}>
          Thống kê hiệu suất
        </div>
        <div style={{ font: '500 14.5px sans-serif', color: '#64748B', marginBottom: '24px' }}>
          Đang tải dữ liệu báo cáo tuần này...
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <Skeleton height="104px" borderRadius="10px" />
          <Skeleton height="104px" borderRadius="10px" />
          <Skeleton height="104px" borderRadius="10px" />
          <Skeleton height="104px" borderRadius="10px" />
        </div>
        <Skeleton height="260px" borderRadius="10px" style={{ marginBottom: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Skeleton height="320px" borderRadius="10px" />
          <Skeleton height="320px" borderRadius="10px" />
        </div>
      </div>
    );
  }

  const completionRateWeek = stats.completionRateWeek || 0;
  const donutStyle = `conic-gradient(#2563EB ${completionRateWeek}%, #E2E8F0 0)`;
  const todayWeekdayIndex = (now.getDay() + 6) % 7;
  const maxCount = Math.max(1, ...(stats.weekBars?.map((b) => b.count) || [1]));
  const totalWeekCompleted = stats.weekBars?.reduce((sum, b) => sum + b.count, 0) || 0;

  // Best day computation
  const weekdayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  let bestDayIndex = 0;
  let bestDayCount = 0;
  stats.weekBars?.forEach((b, i) => {
    if (b.count > bestDayCount) {
      bestDayCount = b.count;
      bestDayIndex = i;
    }
  });

  const bestDayName = bestDayCount > 0 ? weekdayNames[bestDayIndex] : 'Chưa có';

  // Smart dynamic insight advice
  let insightText = 'Chia nhỏ các mục tiêu và đặt giờ nhắc nhở cụ thể để duy trì tiến độ hoàn thành mỗi ngày.';
  let insightBadge = 'Gợi ý nâng cao hiệu suất';
  if (stats.streakDays >= 3) {
    insightText = `Tuyệt vời! Bạn đang duy trì chuỗi hoàn thành liên tục ${stats.streakDays} ngày. Hãy tiếp tục phong độ ấn tượng này!`;
    insightBadge = 'Chuỗi phong độ cao';
  } else if (completionRateWeek >= 80) {
    insightText = `Tỉ lệ hoàn thành đạt ${completionRateWeek}%, năng suất làm việc của bạn trong tuần đang ở mức xuất sắc.`;
    insightBadge = 'Hiệu suất xuất sắc';
  } else if (totalWeekCompleted >= 10) {
    insightText = `Bạn đã hoàn thành ${totalWeekCompleted} công việc tuần này. Hãy rà soát lại các mục tiêu tiếp theo để sẵn sàng cho tuần mới.`;
    insightBadge = 'Tiến độ rất tích cực';
  }

  return (
    <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ font: "700 28px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '4px' }}>
            Thống kê hiệu suất
          </div>
          <div style={{ font: '500 14.5px sans-serif', color: '#64748B' }}>
            Báo cáo tổng quan tiến độ và năng suất công việc trong tuần
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 6px 14px -10px rgba(15,23,42,.12)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={{ font: '600 13.5px sans-serif', color: '#1E293B' }}>Tuần hiện tại</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid (Uniform Height & Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {/* KPI 1: Tỉ lệ hoàn thành */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '104px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ font: "700 22px 'Space Grotesk', sans-serif", color: '#0F172A' }}>
              {completionRateWeek}%
            </div>
            <div style={{ font: '600 13.5px sans-serif', color: '#64748B' }}>Tỉ lệ hoàn thành</div>
          </div>
        </div>

        {/* KPI 2: Chuỗi liên tiếp */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '104px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div>
            <div style={{ font: "700 22px 'Space Grotesk', sans-serif", color: '#0F172A' }}>
              {stats.streakDays} ngày
            </div>
            <div style={{ font: '600 13.5px sans-serif', color: '#64748B' }}>Chuỗi liên tiếp</div>
          </div>
        </div>

        {/* KPI 3: Tổng việc hoàn thành */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '104px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div style={{ font: "700 22px 'Space Grotesk', sans-serif", color: '#0F172A' }}>
              {totalWeekCompleted} việc
            </div>
            <div style={{ font: '600 13.5px sans-serif', color: '#64748B' }}>Đã xong tuần này</div>
          </div>
        </div>

        {/* KPI 4: Ngày năng suất nhất */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 10px 22px -16px rgba(15,23,42,.14)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '104px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "700 18px 'Space Grotesk', sans-serif", color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bestDayName}
            </div>
            <div style={{ font: '600 13px sans-serif', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bestDayCount > 0 ? `${bestDayCount} việc cao nhất` : 'Năng suất cao nhất'}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Full-Width 7-Day Performance Chart */}
      <StatsWeekBarChart
        weekBars={stats.weekBars || []}
        todayWeekdayIndex={todayWeekdayIndex}
        maxCount={maxCount}
      />

      {/* Bottom Section: 2 Equal-Width Balanced Columns (50% / 50%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
        {/* Left 50%: Category Breakdown */}
        <StatsCategoryBreakdown categories={stats.categoryBreakdown || []} />

        {/* Right 50%: Productivity & AI Insights */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '24px 26px',
            boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ font: "700 17px 'Space Grotesk', sans-serif", color: '#0F172A', display: 'flex', alignItems: 'center', gap: '9px' }}>
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  Đánh giá năng suất tuần
                </div>
                <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginTop: '3px' }}>
                  Tổng kết tỉ lệ hoàn thành và chuỗi làm việc
                </div>
              </div>

              <div
                style={{
                  font: '700 12.5px sans-serif',
                  color: '#2563EB',
                  background: '#EFF6FF',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #DBEAFE',
                }}
              >
                {completionRateWeek}% đạt
              </div>
            </div>

            {/* Donut Meter & Performance Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '16px 18px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #F1F5F9',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: donutStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    font: "700 15px 'Space Grotesk', sans-serif",
                    color: '#0F172A',
                  }}
                >
                  {completionRateWeek}%
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ font: '700 15px sans-serif', color: '#0F172A', marginBottom: '2px' }}>
                  {completionRateWeek >= 80
                    ? 'Hiệu suất rất tốt'
                    : completionRateWeek >= 50
                    ? 'Tiến độ ổn định'
                    : 'Cần tăng tốc'}
                </div>
                <div style={{ font: '500 13px/1.4 sans-serif', color: '#64748B' }}>
                  {totalWeekCompleted > 0
                    ? `Đã hoàn thành ${totalWeekCompleted} công việc trong tuần này.`
                    : 'Chưa có công việc nào hoàn thành trong tuần này.'}
                </div>
              </div>
            </div>

            {/* Smart AI Advice Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
                borderRadius: '8px',
                padding: '14px 16px',
                border: '1px solid #DBEAFE',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.1)',
                  marginTop: '1px',
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18" />
                  <line x1="10" y1="22" x2="14" y2="22" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '700 12.5px sans-serif', color: '#1E293B', marginBottom: '2px' }}>
                  {insightBadge}
                </div>
                <div style={{ font: '500 13px/1.45 sans-serif', color: '#334155' }}>
                  {insightText}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid #F1F5F9',
              font: '500 13.5px sans-serif',
              color: '#64748B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }} />
              <span>Dữ liệu thời gian thực</span>
            </div>
            <div style={{ color: '#94A3B8', fontSize: '12.5px' }}>
              NLTASK Analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
