import { useState } from 'react';
import { isSameDay } from '../../utils/date-format-utils';

interface DatePickerModalProps {
  initialDate: Date | null;
  now: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function DatePickerModal({ initialDate, now, onSelectDate, onClose }: DatePickerModalProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    if (initialDate) {
      return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const canGoPrev = calendarMonth.getTime() > curMonthStart.getTime();

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    const m = new Date(calendarMonth);
    m.setMonth(m.getMonth() - 1);
    setCalendarMonth(m);
  };

  const handleNextMonth = () => {
    const m = new Date(calendarMonth);
    m.setMonth(m.getMonth() + 1);
    setCalendarMonth(m);
  };

  const generateCells = () => {
    const year = calendarMonth.getFullYear();
    const mo = calendarMonth.getMonth();
    const first = new Date(year, mo, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(year, mo, 1 - startOffset);
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);

      const inMonth = d.getMonth() === mo;
      const isPast = d < todayMid;
      const isToday = isSameDay(d, now);
      const isSelected = initialDate ? isSameDay(d, initialDate) : false;

      let color = '#0F172A';
      if (!inMonth) color = '#E2E8F0';
      else if (isPast) color = '#CBD5E1';
      else if (isSelected) color = '#fff';
      else if (isToday) color = '#2563EB';

      cells.push({
        date: d,
        dayNum: d.getDate(),
        isPast,
        isSelected,
        color,
      });
    }
    return cells;
  };

  const cells = generateCells();

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
          width: '320px',
          background: '#fff',
          borderRadius: '22px',
          padding: '20px',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 20px 40px -10px rgba(15,23,42,.25)',
        }}
      >
        {/* Month Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <button
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              color: canGoPrev ? '#0F172A' : '#E2E8F0',
              cursor: canGoPrev ? 'pointer' : 'default',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ font: "700 15px 'Space Grotesk',sans-serif", color: '#0F172A' }}>
            Tháng {calendarMonth.getMonth() + 1}, {calendarMonth.getFullYear()}
          </div>
          <button
            onClick={handleNextMonth}
            style={{ background: 'none', border: 'none', color: '#0F172A', padding: '6px', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', font: '600 11px sans-serif', color: '#94A3B8', marginBottom: '6px' }}>
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
          <div>CN</div>
        </div>

        {/* 42 Calendar Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
          {cells.map((cell, idx) => (
            <button
              key={idx}
              disabled={cell.isPast}
              onClick={() => {
                if (!cell.isPast) onSelectDate(cell.date);
              }}
              style={{
                width: '38px',
                height: '38px',
                border: 'none',
                borderRadius: '12px',
                font: '600 13.5px sans-serif',
                cursor: cell.isPast ? 'default' : 'pointer',
                background: cell.isSelected ? '#2563EB' : 'transparent',
                color: cell.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cell.dayNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
