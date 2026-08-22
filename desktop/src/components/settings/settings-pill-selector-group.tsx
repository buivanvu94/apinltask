interface SettingsPillSelectorGroupProps<T extends number> {
  title: string;
  options: T[];
  selected: T;
  onSelect: (val: T) => void;
  formatLabel?: (val: T) => string;
}

export function SettingsPillSelectorGroup<T extends number>({
  title,
  options,
  selected,
  onSelect,
  formatLabel = (v) => `${v} phút`,
}: SettingsPillSelectorGroupProps<T>) {
  return (
    <>
      <div
        style={{
          font: '700 12.5px sans-serif',
          color: '#94A3B8',
          margin: '20px 0 8px',
          textTransform: 'uppercase',
          letterSpacing: '.04em',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                font: '600 13px sans-serif',
                border: `1px solid ${active ? '#2563EB' : '#E2E8F0'}`,
                background: active ? '#2563EB' : '#fff',
                color: active ? '#fff' : '#334155',
                cursor: 'pointer',
              }}
            >
              {formatLabel(opt)}
            </button>
          );
        })}
      </div>
    </>
  );
}
