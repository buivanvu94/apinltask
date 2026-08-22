import { CategoryStat } from '../../types/stats';
import { getCategoryInfo } from '../../constants/categories';

interface StatsCategoryBreakdownProps {
  categories: CategoryStat[];
}

export function StatsCategoryBreakdown({ categories }: StatsCategoryBreakdownProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '18px',
        padding: '22px 24px',
        marginTop: '20px',
        maxWidth: '640px',
        boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
      }}
    >
      <div style={{ font: '700 14.5px sans-serif', color: '#0F172A', marginBottom: '14px' }}>
        Theo danh mục
      </div>
      {categories.length > 0 ? (
        categories.map((cat) => {
          const catInfo = getCategoryInfo(cat.category);
          return (
            <div key={cat.category} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 13px sans-serif', color: '#334155', marginBottom: '6px' }}>
                <span>{catInfo.label}</span>
                <span>{cat.count}</span>
              </div>
              <div style={{ height: '8px', borderRadius: '5px', background: '#F1F5F9', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '5px',
                    background: catInfo.color,
                    width: `${cat.pct}%`,
                    transition: 'width .3s ease',
                  }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ font: '500 13px sans-serif', color: '#94A3B8' }}>Chưa có dữ liệu danh mục.</div>
      )}
    </div>
  );
}
