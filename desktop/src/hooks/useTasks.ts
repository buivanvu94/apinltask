import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput, TaskSummary, UpdateTaskInput } from '../types/task';
import {
  getTasks,
  getTaskSummary,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
} from '../services/task-service';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(new Date());

  const fetchTasksAndSummary = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedSummary] = await Promise.all([
        getTasks({ scope: 'all' }),
        getTaskSummary(),
      ]);
      setTasks(fetchedTasks);
      setSummary(fetchedSummary);
    } catch (err) {
      console.error('Failed to load tasks and summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasksAndSummary();
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTasksAndSummary]);

  const toggleTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      const updated = await apiToggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      const newSummary = await getTaskSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert by fetching
      fetchTasksAndSummary();
    }
  }, [fetchTasksAndSummary]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiDeleteTask(id);
      const newSummary = await getTaskSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasksAndSummary();
    }
  }, [fetchTasksAndSummary]);

  const createTask = useCallback(async (input: TaskInput) => {
    const created = await apiCreateTask(input);
    setTasks((prev) => [created, ...prev]);
    const newSummary = await getTaskSummary();
    setSummary(newSummary);
    return created;
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    const updated = await apiUpdateTask(id, input);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    const newSummary = await getTaskSummary();
    setSummary(newSummary);
    return updated;
  }, []);

  return {
    tasks,
    summary,
    isLoading,
    now,
    refreshTasks: fetchTasksAndSummary,
    toggleTask,
    deleteTask,
    createTask,
    updateTask,
  };
}
