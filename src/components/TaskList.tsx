import { useState } from 'react'
import type { Goal, Task } from '../types'
import { loadTasks, loadGoals, addTask, toggleTaskComplete, deleteTask } from '../storage'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

interface Props {
  activeTaskId: string | null
  onSetActiveTaskId: (id: string | null) => void
}

export default function TaskList({ activeTaskId, onSetActiveTaskId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [goals] = useState<Goal[]>(() => loadGoals())
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // REQ-TL-003: 未完了タスクを優先して上部に表示
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return a.createdAt.localeCompare(b.createdAt)
  })

  const handleAdd = (input: Pick<Task, 'title' | 'goalId' | 'estimatedPomodoros'>) => {
    const newTask = addTask(input)
    setTasks(prev => [...prev, newTask])
    setShowForm(false)
  }

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id)
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
        : t
    ))
  }

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return
    deleteTask(deleteConfirmId)
    setTasks(prev => prev.filter(t => t.id !== deleteConfirmId))
    if (activeTaskId === deleteConfirmId) {
      onSetActiveTaskId(null)
    }
    setDeleteConfirmId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
  }

  const getGoalName = (goalId: string | null): string | null => {
    if (!goalId) return null
    return goals.find(g => g.id === goalId)?.text ?? null
  }

  const deleteTargetTask = tasks.find(t => t.id === deleteConfirmId)

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>タスク</h2>
        {!showForm && (
          <button className="task-add-btn" onClick={() => setShowForm(true)}>
            + タスクを追加
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          goals={goals}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deleteConfirmId && deleteTargetTask && (
        <div className="task-delete-confirm">
          <p>「{deleteTargetTask.title}」を削除しますか？</p>
          <div className="task-delete-confirm-actions">
            <button onClick={handleDeleteCancel}>キャンセル</button>
            <button className="danger" onClick={handleDeleteConfirm}>削除する</button>
          </div>
        </div>
      )}

      {sortedTasks.length === 0 && !showForm ? (
        <p className="task-list-empty">タスクを追加して今日の集中を始めましょう！</p>
      ) : (
        <ul className="task-list-items">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              goalName={getGoalName(task.goalId)}
              isActive={activeTaskId === task.id}
              onToggleComplete={handleToggleComplete}
              onSelect={onSetActiveTaskId}
              onDelete={handleDeleteRequest}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
