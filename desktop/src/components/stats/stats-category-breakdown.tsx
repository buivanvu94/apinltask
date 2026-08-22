import { CategoryStat } from '../../types/stats';
import { getCategoryInfo } from '../../constants/categories';

interface StatsCategoryBreakdownProps {
  categories: CategoryStat[];
}

export function StatsCategoryBreakdown({ categories }: StatsCategoryBreakdownProps) {
  const totalTasks = categories.reduce((sum, c) => sum + c.count, 0);

  return (
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
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ font: "700 17px 'Space Grotesk', sans-serif", color: '#0F172A', display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#F5F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              Phân bổ theo danh mục
            </div>
            <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginTop: '3px' }}>
              Tỉ trọng công việc hoàn thành theo từng nhóm
            </div>
          </div>

          <div
            style={{
              font: '700 12.5px sans-serif',
              color: '#7C3AED',
              background: '#F5F0FF',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          >
            {categories.length} nhóm
          </div>
        </div>

        {/* Stacked multi-color progress bar preview */}
        {categories.length > 0 && (
          <div
            style={{
              height: '10px',
              borderRadius: '5px',
              background: '#F1F5F9',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '18px',
              gap: '2px',
            }}
          >
            {categories.map((cat) => {
              const info = getCategoryInfo(cat.category);
              return (
                <div
                  key={cat.category}
                  title={`${info.label}: ${cat.pct}%`}
                  style={{
                    height: '100%',
                    width: `${cat.pct}%`,
                    background: info.color,
                    borderRadius: '2px',
                    transition: 'width .3s ease',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Categories List */}
        {categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {categories.map((cat) => {
              const catInfo = getCategoryInfo(cat.category);
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '3px',
                          background: catInfo.color,
                          flex: 'none',
                        }}
                      />
                      <span style={{ font: '600 14px sans-serif', color: '#1E293B' }}>{catInfo.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ font: '700 13.5px sans-serif', color: '#0F172A' }}>{cat.count} việc</span>
                      <span
                        style={{
                          font: '700 11.5px sans-serif',
                          color: catInfo.color,
                          background: catInfo.tint,
                          padding: '2px 7px',
                          borderRadius: '5px',
                          minWidth: '36px',
                          textAlign: 'center',
                        }}
                      >
                        {cat.pct}%
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '7px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '4px',
                        background: catInfo.color,
                        width: `${cat.pct}%`,
                        transition: 'width .35s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '36px 12px', textAlign: 'center' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={{ font: '500 14px sans-serif', color: '#94A3B8' }}>Chưa có dữ liệu danh mục hoàn thành.</div>
          </div>
        )}
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
        <div>
          Tổng công việc đã phân loại: <strong style={{ color: '#0F172A' }}>{totalTasks}</strong>
        </div>
        <div style={{ color: '#94A3B8', fontSize: '12.5px' }}>
          Tự động thống kê
        </div>
      </div>
    </div>
  );
}
