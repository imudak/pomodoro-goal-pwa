export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface Goal {
  id: string
  text: string
  completed: boolean
  pomodorosTarget: number
  pomodorosDone: number
}

export interface DayRecord {
  date: string // YYYY-MM-DD
  totalPomodoros: number
  totalMinutes: number
  goalsCompleted: number
  goalsTotal: number
}

export interface Task {
  id: string
  title: string
  goalId: string | null
  completed: boolean
  estimatedPomodoros: number | null
  completedPomodoros: number
  createdAt: string
  updatedAt: string
}
