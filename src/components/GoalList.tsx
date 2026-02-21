import { useState, useEffect } from 'react'
import type { Goal } from '../types'
import { loadGoals, saveGoals, saveCurrentDayRecord } from '../storage'
import './GoalList.css'

interface Props {
  activeGoalId: string | null
  onSetActiveGoalId: (id: string | null) => void
}

export default function GoalList({ activeGoalId, onSetActiveGoalId }: Props) {
  const [goals, setGoals] = useState<Goal[]>(loadGoals)
  const [input, setInput] = useState('')

  useEffect(() => {
    saveGoals(goals)
    saveCurrentDayRecord(goals)
  }, [goals])

  const addGoal = () => {
    const text = input.trim()
    if (!text) return
    setGoals(prev => [
      ...prev,
      {
        id: Date.now().toString(36),
        text,
        completed: false,
        pomodorosTarget: 1,
        pomodorosDone: 0,
      },
    ])
    setInput('')
  }

  const toggle = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }

  const remove = (id: string) => {
    if (activeGoalId === id) onSetActiveGoalId(null)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const updateTarget = (id: string, delta: number) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, pomodorosTarget: Math.max(1, g.pomodorosTarget + delta) } : g
    ))
  }

  const incrementPomo = (id: string) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, pomodorosDone: g.pomodorosDone + 1 } : g
    ))
  }

  const toggleFocus = (id: string) => {
    onSetActiveGoalId(activeGoalId === id ? null : id)
  }

  const completedCount = goals.filter(g => g.completed).length

  return (
    <div className="goals">
      <div className="goals-summary">
        <span>今日の目標</span>
        <span className="goals-count">{completedCount} / {goals.length}</span>
      </div>

      <div className="goals-input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder="新しい目標を入力..."
          className="goals-input"
        />
        <button className="goals-add" onClick={addGoal}>追加</button>
      </div>

      <ul className="goals-list">
        {goals.map(g => (
          <li key={g.id} className={`goal-item ${g.completed ? 'done' : ''} ${activeGoalId === g.id ? 'focused' : ''}`}>
            <button className="goal-check" onClick={() => toggle(g.id)}>
              {g.completed ? '✅' : '⬜'}
            </button>
            <div className="goal-body">
              <span className="goal-text">{g.text}</span>
              <div className="goal-pomo-row">
                <span className="goal-pomo-label">🍅</span>
                <button className="pomo-adj" onClick={() => updateTarget(g.id, -1)}>−</button>
                <span className="goal-pomo-count">{g.pomodorosDone}/{g.pomodorosTarget}</span>
                <button className="pomo-adj" onClick={() => updateTarget(g.id, 1)}>+</button>
                <button className="pomo-inc" onClick={() => incrementPomo(g.id)}>+1</button>
                <button
                  className={`goal-focus-btn ${activeGoalId === g.id ? 'active' : ''}`}
                  onClick={() => toggleFocus(g.id)}
                >
                  {activeGoalId === g.id ? '✓ フォーカス中' : '▶ フォーカス'}
                </button>
              </div>
            </div>
            <button className="goal-delete" onClick={() => remove(g.id)}>✕</button>
          </li>
        ))}
      </ul>

      {goals.length === 0 && (
        <p className="goals-empty">目標を追加して、今日の集中を始めましょう！</p>
      )}
    </div>
  )
}
