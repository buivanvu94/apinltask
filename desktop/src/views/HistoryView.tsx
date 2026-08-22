import React, { useState, useEffect, useCallback } from 'react';
import { TaskHistoryItem } from '../types/task';
import { getHistory } from '../services/history-service';
import { HistoryItemRow } from '../components/history/history-item-row';
import { TaskListSkeleton } from '../components/common/SkeletonLoader';
import { fmtDateShort, isSameDay, parseDate } from '../utils/date-format-utils';

interface HistoryViewProps {
  now: Date;
  onToggleTask: (id: string) => Promise<void>;
  onSelectTask?: (id: string) => void;
}

interface HistoryGroup {
  label: string;
  items: TaskHistoryItem[];
}

export function HistoryView({ now, onToggleTask, onSelectTask }: HistoryViewProps) {
  const [completedTasks, setCompletedTasks] = useState<TaskHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistoryData = useCallback(async (query: string) => {
    try {
      const data = await getHistory(query.trim() || undefined);
      setCompletedTasks(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchHistoryData(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search, fetchHistoryData]);

  const handleToggle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await onToggleTask(id);
    fetchHistoryData(search);
  };

  // Group tasks by date
  const groups: HistoryGroup[] = [];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  completedTasks.forEach((task) => {
    const compDate = parseDate(task.completedAt);
    let label: string;
    if (isSameDay(compDate, now)) {
      label = 'Hôm nay';
    } else if (isSameDay(compDate, yesterday)) {
      label = 'Hôm qua';
    } else {
      label = fmtDateShort(compDate);
    }

    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(task);
  });

  return (
    <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ font: "700 26px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '4px' }}>
        Lịch sử
      </div>
      <div style={{ font: '500 13.5px sans-serif', color: '#64748B', marginBottom: '20px' }}>
        Tổng {totalCount} công việc đã hoàn thành
      </div>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff',
          borderRadius: '12px',
          padding: '11px 14px',
          maxWidth: '380px',
          marginBottom: '22px',
          boxShadow: '0 1px 2px rgba(15,23,42,.04),0 10px 20px -16px rgba(15,23,42,.2)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="11" cy="11" r="7" stroke="#94A3B8" strokeWidth="2" fill="none" />
          <path d="M21 21l-4.3-4.3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm trong lịch sử..."
          style={{ border: 'none', background: 'transparent', outline: 'none', font: '500 13.5px sans-serif', color: '#0F172A', flex: 1 }}
        />
      </div>

      {/* Groups List */}
      {isLoading ? (
        <TaskListSkeleton />
      ) : groups.length > 0 ? (
        <div>
          {groups.map((group) => (
            <div key={group.label} style={{ marginBottom: '20px' }}>
              <div style={{ font: '700 13px sans-serif', color: '#94A3B8', margin: '14px 0 8px' }}>
                {group.label}
              </div>
              {group.items.map((item) => (
                <HistoryItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '30px 4px', font: '500 13.5px sans-serif', color: '#94A3B8' }}>
          Chưa có lịch sử phù hợp.
        </div>
      )}
    </div>
  );
}
