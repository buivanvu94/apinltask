import { TaskCategory, TaskPriority, TaskRepeat } from '../../types/task';
import { CATEGORIES } from '../../constants/categories';
import { PRIORITIES } from '../../constants/priorities';
import { REPEATS } from '../../constants/repeats';

interface TaskFormPillSelectorsProps {
  priority: TaskPriority;
  category: TaskCategory;
  repeat: TaskRepeat;
  onChangePriority: (p: TaskPriority) => void;
  onChangeCategory: (c: TaskCategory) => void;
  onChangeRepeat: (r: TaskRepeat) => void;
}

export function TaskFormPillSelectors({
  priority,
  category,
  repeat,
  onChangePriority,
  onChangeCategory,
  onChangeRepeat,
}: TaskFormPillSelectorsProps) {
  const sectionTitleStyle: React.CSSProperties = {
    font: '700 12.5px sans-serif',
    color: '#94A3B8',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  };

  return (
    <>
      {/* Priority Selection */}
      <div style={sectionTitleStyle}>Mức độ ưu tiên</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {PRIORITIES.map((p) => {
          const active = priority === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChangePriority(p.key)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                font: '700 13px sans-serif',
                border: `1px solid ${active ? p.color : '#E2E8F0'}`,
                background: active ? p.bg : '#fff',
                color: active ? p.color : '#334155',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Category Selection */}
      <div style={sectionTitleStyle}>Danh mục</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChangeCategory(c.key)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                font: '600 13px sans-serif',
                border: `1px solid ${active ? c.color : '#E2E8F0'}`,
                background: active ? c.tint : '#fff',
                color: active ? c.color : '#334155',
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Repeat Selection */}
      <div style={sectionTitleStyle}>Lặp lại</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {REPEATS.map((r) => {
          const active = repeat === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onChangeRepeat(r.key)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                font: '600 13px sans-serif',
                border: `1px solid ${active ? '#2563EB' : '#E2E8F0'}`,
                background: active ? '#EFF4FF' : '#fff',
                color: active ? '#2563EB' : '#334155',
                cursor: 'pointer',
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
