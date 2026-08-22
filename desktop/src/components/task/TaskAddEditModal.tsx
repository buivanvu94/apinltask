import { useState } from 'react';
import { Task, TaskCategory, TaskInput, TaskPriority, TaskRepeat } from '../../types/task';
import { DatePickerModal } from '../pickers/DatePickerModal';
import { TimePickerModal } from '../pickers/TimePickerModal';
import { TaskFormPillSelectors } from './task-form-pill-selectors';
import { TaskFormDatetimeInputs } from './task-form-datetime-inputs';
import { TaskFormTextFields } from './task-form-text-fields';
import { pad2, parseDate } from '../../utils/date-format-utils';

interface TaskAddEditModalProps {
  editingTask: Task | null;
  now: Date;
  onSave: (input: TaskInput) => Promise<void>;
  onClose: () => void;
  onPreviewToast: (title: string, time: string) => void;
}

export function TaskAddEditModal({
  editingTask,
  now,
  onSave,
  onClose,
  onPreviewToast,
}: TaskAddEditModalProps) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [desc, setDesc] = useState(editingTask?.desc || '');
  const [date, setDate] = useState<Date | null>(() => (editingTask ? parseDate(editingTask.dueAt) : null));
  const [time, setTime] = useState<{ h: number; m: number; set: boolean }>(() => {
    if (editingTask) {
      const d = parseDate(editingTask.dueAt);
      return { h: d.getHours(), m: d.getMinutes(), set: true };
    }
    return { h: 9, m: 0, set: false };
  });
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(editingTask?.category || 'work');
  const [repeat, setRepeat] = useState<TaskRepeat>(editingTask?.repeat || 'none');
  const [location, setLocation] = useState(editingTask?.location || '');

  const [attemptedSave, setAttemptedSave] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !date || !time.set) {
      setAttemptedSave(true);
      return;
    }

    const dueAt = new Date(date);
    dueAt.setHours(time.h, time.m, 0, 0);

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        desc: desc.trim() || undefined,
        category,
        priority,
        repeat,
        location: location.trim() || undefined,
        dueAt: dueAt.toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 30 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '560px',
          maxHeight: '86vh',
          background: '#fff',
          borderRadius: '22px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalPop .18s ease-out',
          boxShadow: '0 25px 50px -12px rgba(15,23,42,.3)',
        }}
      >
        {/* Header */}
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ font: "700 16px 'Space Grotesk',sans-serif", color: '#0F172A' }}>
            {editingTask ? 'Sửa công việc' : 'Thêm công việc'}
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M6 6l12 12M18 6L6 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <TaskFormTextFields
            title={title}
            desc={desc}
            location={location}
            attemptedSave={attemptedSave}
            onChangeTitle={setTitle}
            onChangeDesc={setDesc}
            onChangeLocation={setLocation}
          />

          <div style={{ marginTop: '14px' }}>
            <TaskFormDatetimeInputs
              date={date}
              time={time}
              attemptedSave={attemptedSave}
              onOpenDatePicker={() => setShowDatePicker(true)}
              onOpenTimePicker={() => setShowTimePicker(true)}
              onPreviewNotification={() => {
                const timeStr = time.set ? `${pad2(time.h)}:${pad2(time.m)}` : '--:--';
                onPreviewToast(title.trim() || 'Công việc của bạn', timeStr);
              }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <TaskFormPillSelectors
              priority={priority}
              category={category}
              repeat={repeat}
              onChangePriority={setPriority}
              onChangeCategory={setCategory}
              onChangeRepeat={setRepeat}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ flex: 'none', display: 'flex', gap: '10px', padding: '16px 22px', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#F1F5F9', border: 'none', font: '700 13.5px sans-serif', color: '#334155', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: isSaving ? '#94A3B8' : '#2563EB', border: 'none', font: '700 13.5px sans-serif', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu công việc'}
          </button>
        </div>
      </div>

      {showDatePicker && (
        <DatePickerModal
          initialDate={date}
          now={now}
          onSelectDate={(newDate) => {
            setDate(newDate);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showTimePicker && (
        <TimePickerModal
          initialHour={time.h}
          initialMinute={time.m}
          onConfirm={(h, m) => {
            setTime({ h, m, set: true });
            setShowTimePicker(false);
          }}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}
