interface TaskFormTextFieldsProps {
  title: string;
  desc: string;
  location: string;
  attemptedSave: boolean;
  onChangeTitle: (title: string) => void;
  onChangeDesc: (desc: string) => void;
  onChangeLocation: (location: string) => void;
}

export function TaskFormTextFields({
  title,
  desc,
  location,
  attemptedSave,
  onChangeTitle,
  onChangeDesc,
  onChangeLocation,
}: TaskFormTextFieldsProps) {
  return (
    <>
      <input
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
        placeholder="Tên công việc"
        style={{
          width: '100%',
          border: 'none',
          borderBottom: `2px solid ${attemptedSave && !title.trim() ? '#DC2626' : '#E2E8F0'}`,
          padding: '8px 2px 12px',
          font: "700 22px 'Space Grotesk',sans-serif",
          color: '#0F172A',
          outline: 'none',
          marginBottom: '6px',
        }}
      />
      {attemptedSave && !title.trim() && (
        <div style={{ font: '600 13px sans-serif', color: '#DC2626', margin: '-4px 0 12px' }}>
          Vui lòng nhập tên công việc
        </div>
      )}

      <textarea
        value={desc}
        onChange={(e) => onChangeDesc(e.target.value)}
        placeholder="Thêm mô tả (không bắt buộc)"
        style={{
          width: '100%',
          minHeight: '68px',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 14px',
          font: '500 15px sans-serif',
          color: '#0F172A',
          outline: 'none',
          resize: 'none',
          marginBottom: '14px',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginTop: '16px',
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"
            stroke="#94A3B8"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="9.5" r="2.2" stroke="#94A3B8" strokeWidth="2" fill="none" />
        </svg>
        <input
          value={location}
          onChange={(e) => onChangeLocation(e.target.value)}
          placeholder="Thêm địa điểm (không bắt buộc)"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            font: '500 15px sans-serif',
            color: '#0F172A',
            flex: 1,
          }}
        />
      </div>
    </>
  );
}
