import type { Goal, DayRecord } from './types'

const GOALS_KEY = 'pomogoal_goals'
const HISTORY_KEY = 'pomogoal_history'
const TODAY_POMOS_KEY = 'pomogoal_today_pomos'

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

export function loadHistory(): DayRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}
