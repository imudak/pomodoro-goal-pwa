import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from './TaskCard'
import type { Task } from '../types'

const baseTask: Task = {
  id: 'task-1',
  title: 'テストタスク',
  goalId: null,
  completed: false,
  estimatedPomodoros: 2,
  completedPomodoros: 1,
  createdAt: '2026-02-24T00:00:00.000Z',
  updatedAt: '2026-02-24T00:00:00.000Z',
}

describe('TaskCard', () => {
  // REQ-TL-002: カード形式表示
  it('タスク名を表示する (REQ-TL-002)', () => {
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  it('完了ポモドーロ数/見積もりポモドーロ数を表示する (REQ-TL-002)', () => {
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/1.*2/)).toBeInTheDocument()
  })

  it('ゴール名を表示する (REQ-TL-002)', () => {
    render(
      <TaskCard
        task={baseTask}
        goalName="プロジェクトA"
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/プロジェクトA/)).toBeInTheDocument()
  })

  it('ゴール名がnullの場合はゴール行を非表示にする', () => {
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.queryByText(/プロジェクト/)).not.toBeInTheDocument()
  })

  it('完了状態のタスクは完了マークを表示する', () => {
    const completedTask = { ...baseTask, completed: true }
    render(
      <TaskCard
        task={completedTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('isActiveの場合はアクティブ表示になる', () => {
    const { container } = render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={true}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(container.firstChild).toHaveClass('active')
  })

  it('チェックボックスクリックでonToggleCompleteが呼ばれる (REQ-TC-002)', () => {
    const onToggleComplete = vi.fn()
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={onToggleComplete}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggleComplete).toHaveBeenCalledWith('task-1')
  })

  it('選択ボタンクリックでonSelectが呼ばれる (REQ-TP-001)', () => {
    const onSelect = vi.fn()
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTitle('このタスクで作業する'))
    expect(onSelect).toHaveBeenCalledWith('task-1')
  })

  it('削除ボタンクリックでonDeleteが呼ばれる (REQ-TC-003)', () => {
    const onDelete = vi.fn()
    render(
      <TaskCard
        task={baseTask}
        goalName={null}
        isActive={false}
        onToggleComplete={vi.fn()}
        onSelect={vi.fn()}
        onDelete={onDelete}
      />
    )
    fireEvent.click(screen.getByTitle('タスクを削除'))
    expect(onDelete).toHaveBeenCalledWith('task-1')
  })
})
