import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import GoalList from './components/GoalList'
import TaskList from './components/TaskList'
import Stats from './components/Stats'
import { incrementGoalPomodoro, incrementTaskPomodoro, loadTasks, updateTasksOnGoalDelete } from './storage'
import type { Task } from './types'
import './App.css'

type Tab = 'timer' | 'tasks' | 'goals' | 'stats'

export default function App() {
  const [tab, setTab] = useState<Tab>('timer')
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  useEffect(() => {
    setTasks(loadTasks())
  }, [refreshKey])

  const activeTaskTitle = activeTaskId
    ? tasks.find(t => t.id === activeTaskId)?.title ?? null
    : null

  const handlePomodoroComplete = () => {
    if (activeGoalId) {
      incrementGoalPomodoro(activeGoalId)
    }
    if (activeTaskId) {
      incrementTaskPomodoro(activeTaskId)
    }
    setRefreshKey(k => k + 1)
  }

  const handleGoalDelete = (goalId: string) => {
    updateTasksOnGoalDelete(goalId)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍅 ポモドーロ × ゴール</h1>
      </header>

      <main className="app-main">
        {tab === 'timer' && (
          <Timer
            onPomodoroComplete={handlePomodoroComplete}
            activeGoalId={activeGoalId}
            onSetActiveGoalId={setActiveGoalId}
            activeTaskId={activeTaskId}
            activeTaskTitle={activeTaskTitle}
            onSetActiveTaskId={setActiveTaskId}
          />
        )}
        {tab === 'tasks' && (
          <TaskList
            activeTaskId={activeTaskId}
            onSetActiveTaskId={setActiveTaskId}
          />
        )}
        {tab === 'goals' && (
          <GoalList
            key={refreshKey}
            activeGoalId={activeGoalId}
            onSetActiveGoalId={setActiveGoalId}
            onGoalDelete={handleGoalDelete}
          />
        )}
        {tab === 'stats' && <Stats key={refreshKey} />}
      </main>

      <nav className="app-nav">
        <button className={tab === 'timer' ? 'active' : ''} onClick={() => setTab('timer')}>
          <span className="nav-icon">⏱</span>
          <span className="nav-label">タイマー</span>
        </button>
        <button className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')}>
          <span className="nav-icon">✅</span>
          <span className="nav-label">タスク</span>
        </button>
        <button className={tab === 'goals' ? 'active' : ''} onClick={() => setTab('goals')}>
          <span className="nav-icon">🎯</span>
          <span className="nav-label">目標</span>
        </button>
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">統計</span>
        </button>
      </nav>
    </div>
  )
}
