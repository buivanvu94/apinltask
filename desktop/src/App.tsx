import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthView } from './views/AuthView';
import { Sidebar, NavTab } from './components/sidebar/Sidebar';
import { TodayView } from './views/TodayView';
import { HistoryView } from './views/HistoryView';
import { StatsView } from './views/StatsView';
import { SettingsView } from './views/SettingsView';
import { UsersView } from './views/UsersView';
import { TaskDetailPanel } from './components/task/TaskDetailPanel';
import { TaskAddEditModal } from './components/task/TaskAddEditModal';
import { TaskDeleteModal } from './components/task/TaskDeleteModal';
import { ToastNotification, ToastMessage } from './components/common/ToastNotification';
import { useTasks } from './hooks/useTasks';
import { useSettings } from './hooks/useSettings';
import { notifyTaskDue } from './services/notification-service';
import { Task } from './types/task';
import { parseDate } from './utils/date-format-utils';

function MainApp() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { tasks, now, isLoading: tasksLoading, toggleTask, deleteTask, createTask, updateTask } = useTasks();
  const { settings, toggleSetting, setRemindBefore, setSnooze, setQuietHours } = useSettings();

  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notifiedRef = useRef<Set<string>>(new Set());

  // Task reminder scheduler
  useEffect(() => {
    if (!settings.push && !settings.sound) return;

    const curTimeMs = now.getTime();
    const remindOffsetMs = (settings.remindBefore || 0) * 60 * 1000;

    tasks.forEach((t) => {
      if (t.completed) return;
      const dueMs = parseDate(t.dueAt).getTime();
      const triggerTimeMs = dueMs - remindOffsetMs;
      const diff = curTimeMs - triggerTimeMs;

      // 45s trigger window
      if (diff >= 0 && diff < 45000) {
        const notifKey = `${t.id}_${t.dueAt}_${settings.remindBefore}`;
        if (!notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);
          notifyTaskDue(t.title, t.dueAt, settings);
        }
      }
    });
  }, [now, tasks, settings]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#F5F7FB' }}>
        <div style={{ font: "700 18px 'Space Grotesk', sans-serif", color: '#152A63' }}>NLTASK...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) || null : null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#F5F7FB', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAdd={() => {
          setEditingTask(null);
          setShowAddEditModal(true);
        }}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>
        {currentTab === 'today' && (
          <>
            <TodayView
              tasks={tasks}
              now={now}
              isLoading={tasksLoading}
              onToggleTask={toggleTask}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
            />
            <TaskDetailPanel
              task={selectedTask}
              now={now}
              onClose={() => setSelectedTaskId(null)}
              onEdit={(task) => {
                setEditingTask(task);
                setShowAddEditModal(true);
              }}
              onToggle={toggleTask}
              onRequestDelete={(id) => setDeletingTaskId(id)}
            />
          </>
        )}

        {currentTab === 'history' && (
          <HistoryView
            now={now}
            onToggleTask={toggleTask}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setCurrentTab('today');
            }}
          />
        )}

        {currentTab === 'stats' && <StatsView now={now} />}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            user={user}
            onLogout={logout}
            onToggle={toggleSetting}
            onSetRemindBefore={setRemindBefore}
            onSetSnooze={setSnooze}
            onSetQuietHours={setQuietHours}
          />
        )}

        {currentTab === 'users' && user?.role === 'ADMIN' && <UsersView />}
      </div>

      {/* Add / Edit Task Modal */}
      {showAddEditModal && (
        <TaskAddEditModal
          editingTask={editingTask}
          now={now}
          onSave={async (input) => {
            if (editingTask) {
              await updateTask(editingTask.id, input);
            } else {
              await createTask(input);
            }
          }}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingTask(null);
          }}
          onPreviewToast={(title, time) => {
            setToast({ title, time });
          }}
        />
      )}

      {/* Delete Task Confirmation Modal */}
      {deletingTaskId && (
        <TaskDeleteModal
          onConfirm={async () => {
            const id = deletingTaskId;
            setDeletingTaskId(null);
            if (selectedTaskId === id) setSelectedTaskId(null);
            await deleteTask(id);
          }}
          onCancel={() => setDeletingTaskId(null)}
        />
      )}

      {/* Toast Notification Banner */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
