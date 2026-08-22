import { Task } from '../../types/task';
import { getRepeatInfo } from '../../constants/repeats';
import { fmtDateFull, fmtTime, humanize, parseDate } from '../../utils/date-format-utils';

interface TaskDetailInfoCardProps {
  task: Task;
  now: Date;
}

export function TaskDetailInfoCard({ task, now }: TaskDetailInfoCardProps) {
  const rep = getRepeatInfo(task.repeat);
  const due = parseDate(task.dueAt);
  const diffMs = due.getTime() - now.getTime();
  const overdue = !task.completed && diffMs < 0;

  return (
    <>
      {/* Date, Location, Repeat Box */}
      <div
        style={{
          background: '#F8FAFC',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '14px',
          border: '1px solid #EEF2F6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="4" y="5" width="16" height="15" rx="3" stroke="#2563EB" strokeWidth="2" fill="none" />
            <path d="M4 10h16M8 3v4M16 3v4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ font: '600 14.5px sans-serif', color: '#0F172A' }}>
            {fmtDateFull(due)} · {fmtTime(due)}
          </div>
        </div>

        {task.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" stroke="#2563EB" strokeWidth="2" fill="none" />
              <circle cx="12" cy="9.5" r="2.2" stroke="#2563EB" strokeWidth="2" fill="none" />
            </svg>
            <div style={{ font: '600 14.5px sans-serif', color: '#0F172A' }}>{task.location}</div>
          </div>
        )}

        {task.repeat !== 'none' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M4 8h11a3 3 0 0 1 3 3v1M20 16H9a3 3 0 0 1-3-3v-1" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M15 5l3 3-3 3M9 19l-3-3 3-3" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ font: '600 14.5px sans-serif', color: '#0F172A' }}>{rep.label}</div>
          </div>
        )}
      </div>

      {/* Completion Time Status */}
      {task.completed && task.completedAt && (
        <div
          style={{
            font: '600 14px sans-serif',
            color: '#16A34A',
            background: '#DCFCE7',
            padding: '12px 14px',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          Đã hoàn thành lúc {fmtTime(task.completedAt)}
        </div>
      )}

      {/* Countdown / Overdue Status */}
      {!task.completed && (
        <div
          style={{
            font: '700 14.5px sans-serif',
            color: overdue ? '#DC2626' : '#2563EB',
            padding: '12px 14px',
            borderRadius: '10px',
            background: overdue ? '#FEE2E2' : '#EFF4FF',
            marginBottom: '16px',
          }}
        >
          {overdue ? `Quá hạn ${humanize(diffMs)}` : `Còn ${humanize(diffMs)} nữa`}
        </div>
      )}
    </>
  );
}
