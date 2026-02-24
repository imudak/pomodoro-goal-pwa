import type { Goal, DayRecord, Task } from './types'

const GOALS_KEY = 'pomogoal_goals'
const HISTORY_KEY = 'pomogoal_history'
const TODAY_POMOS_KEY = 'pomogoal_today_pomos'
const TASKS_KEY = 'pomogoal_tasks'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (parsed.date !== today()) {
      // New day: archive and reset
      saveDayRecord(parsed.goals, parsed.pomodoros || 0)
      localStorage.removeItem(GOALS_KEY)
      localStorage.removeItem(TODAY_POMOS_KEY)
      return []
    }
    return parsed.goals
  } catch {
    return []
  }
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify({ date: today(), goals }))
}

export function getTodayPomodoros(): number {
  try {
    const raw = localStorage.getItem(TODAY_POMOS_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    if (parsed.date !== today()) return 0
    return parsed.count
  } catch {
    return 0
  }
}

export function incrementTodayPomodoros(): number {
  const count = getTodayPomodoros() + 1
  localStorage.setItem(TODAY_POMOS_KEY, JSON.stringify({ date: today(), count }))
  return count
}

function saveDayRecord(goals: Goal[], pomodoros: number): void {
  if (!goals.length && !pomodoros) return
  const history = loadHistory()
  const date = goals.length > 0 ? JSON.parse(localStorage.getItem(GOALS_KEY) || '{}').date : today()
  if (!date) return
  const record: DayRecord = {
    date,
    totalPomodoros: pomodoros,
    totalMinutes: pomodoros * 25,
    goalsCompleted: goals.filter(g => g.completed).length,
    goalsTotal: goals.length,
  }
  // Replace if same date exists
  const idx = history.findIndex(h => h.date === date)
  if (idx >= 0) history[idx] = record
  else history.push(record)
  // Keep last 90 days
  history.sort((a, b) => a.date.localeCompare(b.date))
  while (history.length > 90) history.shift()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function saveCurrentDayRecord(goals: Goal[]): void {
  const pomodoros = getTodayPomodoros()
  const history = loadHistory()
  const date = today()
  const record: DayRecord = {
    date,
    totalPomodoros: pomodoros,
    totalMinutes: pomodoros * 25,
    goalsCompleted: goals.filter(g => g.completed).length,
    goalsTotal: goals.length,
  }
  const idx = history.findIndex(h => h.date === date)
  if (idx >= 0) history[idx] = record
  else history.push(record)
  history.sort((a, b) => a.date.localeCompare(b.date))
  while (history.length > 90) history.shift()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function incrementGoalPomodoro(goalId: string): Goal | null {
  const goals = loadGoals()
  const updated = goals.map(g =>
    g.id === goalId ? { ...g, pomodorosDone: g.pomodorosDone + 1 } : g
  )
  saveGoals(updated)
  return updated.find(g => g.id === goalId) ?? null
}

export function loadHistory(): DayRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

// ── タスク関連 ──────────────────────────────────────────────────

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Task[]
  } catch (e) {
    console.error('[storage] loadTasks failed:', e)
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('[storage] saveTasks failed:', e)
  }
}

export function addTask(
  input: Pick<Task, 'title' | 'goalId' | 'estimatedPomodoros'>
): Task {
  const now = new Date().toISOString()
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    goalId: input.goalId,
    completed: false,
    estimatedPomodoros: input.estimatedPomodoros,
    completedPomodoros: 0,
    createdAt: now,
    updatedAt: now,
  }
  const tasks = loadTasks()
  saveTasks([...tasks, task])
  return task
}

export function toggleTaskComplete(id: string): void {
  const tasks = loadTasks()
  const updated = tasks.map(t =>
    t.id === id
      ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
      : t
  )
  saveTasks(updated)
}

export function deleteTask(id: string): void {
  const tasks = loadTasks()
  saveTasks(tasks.filter(t => t.id !== id))
}

export function incrementTaskPomodoro(id: string): void {
  const tasks = loadTasks()
  const updated = tasks.map(t =>
    t.id === id
      ? { ...t, completedPomodoros: t.completedPomodoros + 1, updatedAt: new Date().toISOString() }
      : t
  )
  saveTasks(updated)
}

export function updateTasksOnGoalDelete(goalId: string): void {
  const tasks = loadTasks()
  const updated = tasks.map(t =>
    t.goalId === goalId
      ? { ...t, goalId: null, updatedAt: new Date().toISOString() }
      : t
  )
  saveTasks(updated)
}
