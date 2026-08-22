interface SettingsSwitchItemProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onToggle: () => void;
  borderBottom?: boolean;
}

export function SettingsSwitchItem({
  label,
  sublabel,
  checked,
  onToggle,
  borderBottom = true,
}: SettingsSwitchItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 18px',
        borderBottom: borderBottom ? '1px solid #F1F5F9' : 'none',
      }}
    >
      <div>
        <div style={{ font: '600 14.5px sans-serif', color: '#0F172A' }}>{label}</div>
        {sublabel && (
          <div style={{ font: '500 12px sans-serif', color: '#94A3B8', marginTop: '2px' }}>
            {sublabel}
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        style={{
          width: '46px',
          height: '27px',
          borderRadius: '14px',
          border: 'none',
          padding: '2px',
          position: 'relative',
          background: checked ? '#2563EB' : '#E2E8F0',
          transition: 'background .15s',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '23px',
            height: '23px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            transform: `translateX(${checked ? '19px' : '0'})`,
            transition: 'transform .15s',
          }}
        />
      </button>
    </div>
  );
}
