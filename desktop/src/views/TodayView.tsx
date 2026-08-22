import { useState } from 'react';
import { Task, TaskCategory } from '../types/task';
import { CATEGORIES } from '../constants/categories';
import { QuickStatCards } from '../components/dashboard/QuickStatCards';
import { TaskItemRow } from '../components/task/TaskItemRow';
import { TaskListSkeleton } from '../components/common/SkeletonLoader';
import { isSameDay, parseDate, WEEKDAY_FULL } from '../utils/date-format-utils';

interface TodayViewProps {
  tasks: Task[];
  now: Date;
  isLoading?: boolean;
  onToggleTask: (id: string) => void;
  onSelectTask: (task: Task) => void;
}

export function TodayView({ tasks, now, isLoading = false, onToggleTask, onSelectTask }: TodayViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const catMatch = (t: Task) => filterCategory === 'all' || t.category === filterCategory;

  const overdueTasks = tasks
    .filter((t) => !t.completed && catMatch(t) && parseDate(t.dueAt) < now)
    .sort((a, b) => parseDate(a.dueAt).getTime() - parseDate(b.dueAt).getTime());

  const todayTasks = tasks
    .filter((t) => catMatch(t) && isSameDay(parseDate(t.dueAt), now) && (t.completed || parseDate(t.dueAt) >= now))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return parseDate(a.dueAt).getTime() - parseDate(b.dueAt).getTime();
    });

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const upcomingTasks = tasks
    .filter((t) => !t.completed && catMatch(t) && parseDate(t.dueAt) > endOfToday)
    .sort((a, b) => parseDate(a.dueAt).getTime() - parseDate(b.dueAt).getTime());

  const todaysAll = tasks.filter((t) => isSameDay(parseDate(t.dueAt), now));
  const todayTotalCount = todaysAll.length;
  const todayCompletedCount = todaysAll.filter((t) => t.completed).length;
  const todayProgressPct = todayTotalCount ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const filterOptions = [{ key: 'all', label: 'Tất cả' }, ...CATEGORIES];

  return (
    <div className="view-container" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '36px 40px' }}>
      {/* Date Header */}
      <div style={{ font: '600 13px sans-serif', color: '#2563EB', letterSpacing: '.02em' }}>
        {WEEKDAY_FULL[now.getDay()]}
      </div>
      <div style={{ font: "700 28px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginTop: '2px', marginBottom: '22px' }}>
        {now.getDate()} Tháng {now.getMonth() + 1}, {now.getFullYear()}
      </div>

      {/* 3 Quick Stat Cards */}
      <QuickStatCards
        completedCount={todayCompletedCount}
        totalCount={todayTotalCount}
        progressPct={todayProgressPct}
        overdueCount={overdueTasks.length}
        upcomingCount={upcomingTasks.length}
      />

      {/* Filter Category Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filterOptions.map((c) => {
          const active = filterCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilterCategory(c.key as TaskCategory | 'all')}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                font: '600 13px sans-serif',
                whiteSpace: 'nowrap',
                border: 'none',
                background: active ? 'linear-gradient(135deg,#3B7CF6,#152A63)' : '#fff',
                color: active ? '#fff' : '#334155',
                boxShadow: active
                  ? '0 8px 16px -8px rgba(21,42,99,.5)'
                  : '0 1px 2px rgba(15,23,42,.03),0 6px 14px -10px rgba(15,23,42,.14)',
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <TaskListSkeleton />
      ) : (
        <>
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ font: '700 13px sans-serif', color: '#DC2626', margin: '6px 0 10px' }}>
                Quá hạn
              </div>
              {overdueTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  now={now}
                  variant="overdue"
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))}
            </div>
          )}

          {/* Today Section */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ font: '700 13px sans-serif', color: '#0F172A', margin: '6px 0 10px' }}>
              Hôm nay
            </div>
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  now={now}
                  variant="today"
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))
            ) : (
              <div style={{ padding: '16px 4px', font: '500 13.5px sans-serif', color: '#94A3B8' }}>
                Không còn việc nào cho hôm nay.
              </div>
            )}
          </div>

          {/* Upcoming Section */}
          {upcomingTasks.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ font: '700 13px sans-serif', color: '#0F172A', margin: '18px 0 10px' }}>
                Sắp tới
              </div>
              {upcomingTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  now={now}
                  variant="upcoming"
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
