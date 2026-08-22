import { useState } from 'react';
import { pad2 } from '../../utils/date-format-utils';

interface TimePickerModalProps {
  initialHour: number;
  initialMinute: number;
  title?: string;
  onConfirm: (hour: number, minute: number) => void;
  onClose: () => void;
}

export function TimePickerModal({
  initialHour,
  initialMinute,
  title = 'Chọn giờ nhắc',
  onConfirm,
  onClose,
}: TimePickerModalProps) {
  const [hour, setHour] = useState<number>(initialHour);
  const [minute, setMinute] = useState<number>(initialMinute);

  const incHour = () => setHour((h) => (h + 1) % 24);
  const decHour = () => setHour((h) => (h + 23) % 24);
  const incMinute = () => setMinute((m) => (m + 5) % 60);
  const decMinute = () => setMinute((m) => (m + 55) % 60);

  const quickTimes = [
    { h: 8, m: 0 },
    { h: 12, m: 0 },
    { h: 18, m: 0 },
    { h: 20, m: 0 },
    { h: 21, m: 0 },
  ];

  const handleQuickSet = (h: number, m: number) => {
    setHour(h);
    setMinute(m);
    onConfirm(h, m);
  };

  const stepperBtnStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#F1F5F9',
    border: 'none',
    font: '700 16px sans-serif',
    color: '#2563EB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.45)',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '300px',
          background: '#fff',
          borderRadius: '22px',
          padding: '22px 20px',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 20px 40px -10px rgba(15,23,42,.25)',
        }}
      >
        <div style={{ font: "700 15px 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '16px', textAlign: 'center' }}>
          {title}
        </div>

        {/* Stepper Display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button style={stepperBtnStyle} onClick={incHour}>
              +
            </button>
            <div style={{ font: "700 34px 'Space Grotesk',sans-serif", color: '#0F172A', width: '64px', textAlign: 'center' }}>
              {pad2(hour)}
            </div>
            <button style={stepperBtnStyle} onClick={decHour}>
              –
            </button>
          </div>

          <div style={{ font: "700 30px 'Space Grotesk',sans-serif", color: '#CBD5E1' }}>:</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button style={stepperBtnStyle} onClick={incMinute}>
              +
            </button>
            <div style={{ font: "700 34px 'Space Grotesk',sans-serif", color: '#0F172A', width: '64px', textAlign: 'center' }}>
              {pad2(minute)}
            </div>
            <button style={stepperBtnStyle} onClick={decMinute}>
              –
            </button>
          </div>
        </div>

        {/* Quick Times */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '18px' }}>
          {quickTimes.map((qt) => (
            <button
              key={`${qt.h}:${qt.m}`}
              onClick={() => handleQuickSet(qt.h, qt.m)}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#F1F5F9',
                border: 'none',
                font: '600 12.5px sans-serif',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              {pad2(qt.h)}:{pad2(qt.m)}
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#F1F5F9',
              border: 'none',
              font: '700 13.5px sans-serif',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(hour, minute)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#2563EB',
              border: 'none',
              font: '700 13.5px sans-serif',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
