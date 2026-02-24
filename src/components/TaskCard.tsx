import type { Task } from '../types'

interface Props {
  task: Task
  goalName: string | null
  isActive: boolean
  onToggleComplete: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, goalName, isActive, onToggleComplete, onSelect, onDelete }: Props) {
  return (
    <li className={`task-card ${task.completed ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        aria-label={`${task.title}を完了にする`}
      />
      <div className="task-card-body">
        <span className={`task-card-title ${task.completed ? 'strikethrough' : ''}`}>
          {task.title}
        </span>
        {goalName && (
          <span className="task-card-goal">🎯 {goalName}</span>
        )}
        <span className="task-card-pomodoros">
          🍅 {task.completedPomodoros}
          {task.estimatedPomodoros != null ? ` / ${task.estimatedPomodoros}` : ''}
        </span>
      </div>
      <div className="task-card-actions">
        <button
          className={`task-select-btn ${isActive ? 'active' : ''}`}
          onClick={() => onSelect(task.id)}
          title="このタスクで作業する"
          aria-label="このタスクで作業する"
        >
          {isActive ? '✓' : '▶'}
        </button>
        <button
          className="task-delete-btn"
          onClick={() => onDelete(task.id)}
          title="タスクを削除"
          aria-label="タスクを削除"
        >
          🗑
        </button>
      </div>
    </li>
  )
}
