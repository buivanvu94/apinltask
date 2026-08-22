import React from 'react';
import { Task } from '../../types/task';
import { getCategoryInfo } from '../../constants/categories';
import { getPriorityInfo } from '../../constants/priorities';
import { fmtDateShort, fmtTime, humanize, parseDate } from '../../utils/date-format-utils';

interface TaskItemRowProps {
  task: Task;
  now: Date;
  variant: 'overdue' | 'today' | 'upcoming';
  onSelect: () => void;
  onToggle: () => void;
}

export function TaskItemRow({ task, now, variant, onSelect, onToggle }: TaskItemRowProps) {
  const cat = getCategoryInfo(task.category);
  const pr = getPriorityInfo(task.priority);
  const due = parseDate(task.dueAt);
  const diffMs = due.getTime() - now.getTime();
  const overdue = !task.completed && diffMs < 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const isOverdueVariant = variant === 'overdue';
  const isUpcomingVariant = variant === 'upcoming';

  const relativeText = task.completed
    ? ''
    : overdue
    ? `Quá hạn ${humanize(diffMs)}`
    : `Còn ${humanize(diffMs)}`;

  const relativeColor = overdue ? '#DC2626' : diffMs < 3600000 ? '#D97706' : '#64748B';

  return (
    <div
      onClick={onSelect}
      style={{
        background: '#fff',
        border: isOverdueVariant ? '1px solid #FECACA' : '1px solid rgba(15,23,42,.04)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '8px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        boxShadow: isOverdueVariant
          ? '0 6px 16px -14px rgba(220,38,38,.25)'
          : '0 1px 2px rgba(15,23,42,.03),0 8px 18px -16px rgba(15,23,42,.12)',
        cursor: 'pointer',
        transition: 'all .15s ease',
      }}
    >
      <button
        onClick={handleToggle}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${task.completed ? '#2563EB' : '#CBD5E1'}`,
          background: task.completed ? '#2563EB' : '#fff',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" width="13" height="13">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.color, flex: 'none' }} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          font: '600 15.5px sans-serif',
          color: task.completed ? '#94A3B8' : '#0F172A',
          textDecoration: task.completed ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {task.title}
      </div>

      {isUpcomingVariant && (
        <span style={{ font: '600 12.5px sans-serif', color: '#94A3B8', flex: 'none' }}>
          {fmtDateShort(due)}
        </span>
      )}

      <span style={{ font: '500 13.5px sans-serif', color: '#64748B', flex: 'none' }}>
        {fmtTime(due)}
      </span>

      <span
        style={{
          font: '700 12px sans-serif',
          color: pr.color,
          background: pr.bg,
          padding: '3px 10px',
          borderRadius: '6px',
          flex: 'none',
        }}
      >
        {pr.label}
      </span>

      {!isUpcomingVariant && relativeText && (
        <span
          style={{
            font: '600 13px sans-serif',
            color: relativeColor,
            flex: 'none',
            width: '125px',
            textAlign: 'right',
          }}
        >
          {relativeText}
        </span>
      )}
    </div>
  );
}
