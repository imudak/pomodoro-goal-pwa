import { useState } from 'react'
import Timer from './components/Timer'
import GoalList from './components/GoalList'
import Stats from './components/Stats'
import './App.css'

type Tab = 'timer' | 'goals' | 'stats'

export default function App() {
  const [tab, setTab] = useState<Tab>('timer')
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍅 ポモドーロ × ゴール</h1>
      </header>

      <main className="app-main">
        {tab === 'timer' && <Timer onPomodoroComplete={refresh} />}
        {tab === 'goals' && <GoalList key={refreshKey} />}
        {tab === 'stats' && <Stats key={refreshKey} />}
      </main>

      <nav className="app-nav">
        <button className={tab === 'timer' ? 'active' : ''} onClick={() => setTab('timer')}>
          <span className="nav-icon">⏱</span>
          <span className="nav-label">タイマー</span>
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
