import React from 'react';
import { TaskHistoryItem } from '../../types/task';
import { getCategoryInfo } from '../../constants/categories';
import { fmtTime } from '../../utils/date-format-utils';

interface HistoryItemRowProps {
  item: TaskHistoryItem;
  onToggle: (e: React.MouseEvent, id: string) => void;
  onSelect?: (id: string) => void;
}

export function HistoryItemRow({ item, onToggle, onSelect }: HistoryItemRowProps) {
  const cat = getCategoryInfo(item.category);
  const compTime = fmtTime(item.completedAt);

  return (
    <div
      onClick={() => onSelect?.(item.id)}
      style={{
        background: '#fff',
        border: '1px solid rgba(15,23,42,.04)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '8px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(15,23,42,.03),0 8px 18px -16px rgba(15,23,42,.12)',
        maxWidth: '840px',
        cursor: 'pointer',
      }}
    >
      <button
        onClick={(e) => onToggle(e, item.id)}
        title="Bỏ đánh dấu hoàn thành"
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #2563EB',
          background: '#2563EB',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.color, flex: 'none' }} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          font: '600 15.5px sans-serif',
          color: '#94A3B8',
          textDecoration: 'line-through',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.title}
      </div>

      <span style={{ font: '500 13.5px sans-serif', color: '#64748B', flex: 'none' }}>
        Hoàn thành lúc {compTime}
      </span>
    </div>
  );
}
