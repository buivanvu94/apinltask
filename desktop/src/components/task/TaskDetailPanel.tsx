import { Task } from '../../types/task';
import { getCategoryInfo } from '../../constants/categories';
import { getPriorityInfo } from '../../constants/priorities';
import { TaskDetailInfoCard } from './task-detail-info-card';

interface TaskDetailPanelProps {
  task: Task | null;
  now: Date;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

export function TaskDetailPanel({
  task,
  now,
  onClose,
  onEdit,
  onToggle,
  onRequestDelete,
}: TaskDetailPanelProps) {
  if (!task) {
    return (
      <div
        style={{
          width: '360px',
          flex: 'none',
          background: '#fff',
          borderLeft: '1px solid #EEF1F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <svg viewBox="0 0 24 24" width="34" height="34">
          <rect x="4" y="5" width="16" height="15" rx="3" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          <path d="M8 10h8M8 14h5" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div style={{ font: '600 13.5px sans-serif', color: '#94A3B8' }}>Chọn một công việc để xem chi tiết</div>
      </div>
    );
  }

  const cat = getCategoryInfo(task.category);
  const pr = getPriorityInfo(task.priority);

  return (
    <div
      style={{
        width: '360px',
        flex: 'none',
        background: '#fff',
        borderLeft: '1px solid #EEF1F5',
        overflowY: 'auto',
        padding: '32px 26px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '6px' }}>
        <button
          onClick={() => onEdit(task)}
          title="Chỉnh sửa"
          style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '7px', display: 'flex' }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M4 20l1-4L17 4l3 3-12 12-4 1z" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onClose}
          title="Đóng panel"
          style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '7px', display: 'flex' }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M6 6l12 12M18 6L6 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Task Header & Title */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <button
          onClick={() => onToggle(task.id)}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${task.completed ? '#2563EB' : '#CBD5E1'}`,
            background: task.completed ? '#2563EB' : '#fff',
            padding: 0,
            cursor: 'pointer',
            marginTop: '2px',
          }}
        >
          {task.completed && (
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div
          style={{
            font: "700 18px/1.35 'Space Grotesk',sans-serif",
            color: task.completed ? '#94A3B8' : '#0F172A',
            textDecoration: task.completed ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </div>
      </div>

      {/* Category & Priority Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span style={{ font: '600 12px sans-serif', color: cat.color, background: cat.tint, padding: '5px 11px', borderRadius: '8px' }}>
          {cat.label}
        </span>
        <span style={{ font: '600 12px sans-serif', color: pr.color, background: pr.bg, padding: '5px 11px', borderRadius: '8px' }}>
          Ưu tiên {pr.label}
        </span>
      </div>

      {/* Description */}
      {task.desc && (
        <div style={{ font: '500 14px/1.6 sans-serif', color: '#334155', marginBottom: '16px', wordBreak: 'break-word' }}>
          {task.desc}
        </div>
      )}

      {/* Details Box & Status Card */}
      <TaskDetailInfoCard task={task} now={now} />

      <div style={{ flex: 1 }} />

      {/* Delete Button */}
      <button
        onClick={() => onRequestDelete(task.id)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          background: '#fff',
          border: '1px solid #FCA5A5',
          font: '700 13.5px sans-serif',
          color: '#DC2626',
          cursor: 'pointer',
        }}
      >
        Xoá công việc
      </button>
    </div>
  );
}
