import { fmtDateFull, fmtDateShort, pad2 } from '../../utils/date-format-utils';

interface TaskFormDatetimeInputsProps {
  date: Date | null;
  time: { h: number; m: number; set: boolean };
  attemptedSave: boolean;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  onPreviewNotification: () => void;
}

export function TaskFormDatetimeInputs({
  date,
  time,
  attemptedSave,
  onOpenDatePicker,
  onOpenTimePicker,
  onPreviewNotification,
}: TaskFormDatetimeInputsProps) {
  const reminderText =
    date && time.set
      ? `Sẽ nhắc bạn vào ${fmtDateFull(date)} lúc ${pad2(time.h)}:${pad2(time.m)}`
      : 'Chọn ngày & giờ để đặt nhắc nhở';

  return (
    <>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
        <button
          type="button"
          onClick={onOpenDatePicker}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '14px',
            background: '#F8FAFC',
            border: `1px solid ${attemptedSave && !date ? '#FCA5A5' : '#E2E8F0'}`,
            cursor: 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17">
            <rect x="4" y="5" width="16" height="15" rx="3" stroke="#2563EB" strokeWidth="2" fill="none" />
            <path d="M4 10h16M8 3v4M16 3v4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ font: '600 13.5px sans-serif', color: '#0F172A' }}>
            {date ? fmtDateShort(date) : 'Chọn ngày'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenTimePicker}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '14px',
            background: '#F8FAFC',
            border: `1px solid ${attemptedSave && !time.set ? '#FCA5A5' : '#E2E8F0'}`,
            cursor: 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17">
            <circle cx="12" cy="12" r="8.5" stroke="#2563EB" strokeWidth="2" fill="none" />
            <path d="M12 8v4l3 2" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <span style={{ font: '600 13.5px sans-serif', color: '#0F172A' }}>
            {time.set ? `${pad2(time.h)}:${pad2(time.m)}` : 'Chọn giờ'}
          </span>
        </button>
      </div>

      {attemptedSave && (!date || !time.set) && (
        <div style={{ font: '600 12px sans-serif', color: '#DC2626', margin: '0 0 12px' }}>
          Chọn ngày và giờ để đặt nhắc nhở
        </div>
      )}

      {/* Reminder Banner */}
      <div
        style={{
          background: '#EFF4FF',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 0 18px',
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path d="M12 6v6l4 2" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="2" fill="none" />
        </svg>
        <div style={{ font: '600 12.5px sans-serif', color: '#2563EB', flex: 1 }}>{reminderText}</div>
      </div>

      <button
        type="button"
        onClick={onPreviewNotification}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '14px',
          background: '#fff',
          border: '1px solid #E2E8F0',
          font: '700 13.5px sans-serif',
          color: '#2563EB',
          cursor: 'pointer',
        }}
      >
        Xem trước thông báo nhắc nhở
      </button>
    </>
  );
}
