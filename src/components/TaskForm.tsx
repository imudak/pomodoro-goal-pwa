import { useState } from 'react'
import type { Goal, Task } from '../types'

interface Props {
  goals: Goal[]
  onSubmit: (input: Pick<Task, 'title' | 'goalId' | 'estimatedPomodoros'>) => void
  onCancel: () => void
}

export default function TaskForm({ goals, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState<string | null>(null)
  const [estimatedPomodoros, setEstimatedPomodoros] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('タスク名を入力してください')
      return
    }
    setError(null)
    onSubmit({ title: trimmed, goalId, estimatedPomodoros })
  }

  return (
    <div className="task-form">
      <div className="task-form-field">
        <label htmlFor="task-title">タスク名 *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="タスク名を入力..."
        />
        {error && <span className="task-form-error">{error}</span>}
      </div>

      <div className="task-form-field">
        <label htmlFor="task-goal">紐づきゴール（任意）</label>
        <select
          id="task-goal"
          value={goalId ?? ''}
          onChange={e => setGoalId(e.target.value || null)}
        >
          <option value="">ゴールなし</option>
          {goals.map(g => (
            <option key={g.id} value={g.id}>{g.text}</option>
          ))}
        </select>
      </div>

      <div className="task-form-field">
        <label htmlFor="task-pomodoros">見積もりポモドーロ数（任意）</label>
        <input
          id="task-pomodoros"
          type="number"
          min={1}
          value={estimatedPomodoros ?? ''}
          onChange={e => setEstimatedPomodoros(e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      <div className="task-form-actions">
        <button className="task-form-cancel" onClick={onCancel}>キャンセル</button>
        <button className="task-form-submit" onClick={handleSubmit}>追加する</button>
      </div>
    </div>
  )
}
