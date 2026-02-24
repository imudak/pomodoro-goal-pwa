import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskForm from './TaskForm'
import type { Goal } from '../types'

const mockGoals: Goal[] = [
  { id: 'goal-1', text: 'プロジェクトA', completed: false, pomodorosTarget: 3, pomodorosDone: 0 },
  { id: 'goal-2', text: 'プロジェクトB', completed: false, pomodorosTarget: 2, pomodorosDone: 1 },
]

describe('TaskForm', () => {
  // REQ-TC-001: タスク作成フォーム
  it('タスク名入力フィールドを表示する (REQ-TC-001)', () => {
    render(<TaskForm goals={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByPlaceholderText(/タスク名/)).toBeInTheDocument()
  })

  it('ゴール選択ドロップダウンにゴール一覧を表示する (REQ-TC-001)', () => {
    render(<TaskForm goals={mockGoals} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('プロジェクトA')).toBeInTheDocument()
    expect(screen.getByText('プロジェクトB')).toBeInTheDocument()
  })

  it('見積もりポモドーロ数の入力フィールドを表示する (REQ-TC-001)', () => {
    render(<TaskForm goals={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/見積もり/)).toBeInTheDocument()
  })

  it('タスク名が空の場合はエラーを表示してonSubmitを呼ばない', () => {
    const onSubmit = vi.fn()
    render(<TaskForm goals={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('追加する'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/タスク名を入力してください/)).toBeInTheDocument()
  })

  it('タスク名を入力して送信するとonSubmitが呼ばれる (REQ-TC-001)', () => {
    const onSubmit = vi.fn()
    render(<TaskForm goals={mockGoals} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/タスク名/), { target: { value: '新しいタスク' } })
    fireEvent.click(screen.getByText('追加する'))
    expect(onSubmit).toHaveBeenCalledWith({
      title: '新しいタスク',
      goalId: null,
      estimatedPomodoros: null,
    })
  })

  it('ゴールを選択して送信するとgoalIdが渡される (REQ-TC-001)', () => {
    const onSubmit = vi.fn()
    render(<TaskForm goals={mockGoals} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/タスク名/), { target: { value: 'タスク' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'goal-1' } })
    fireEvent.click(screen.getByText('追加する'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ goalId: 'goal-1' })
    )
  })

  it('ゴールなしで送信するとgoalIdがnullになる (REQ-TC-004)', () => {
    const onSubmit = vi.fn()
    render(<TaskForm goals={mockGoals} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/タスク名/), { target: { value: 'タスク' } })
    fireEvent.click(screen.getByText('追加する'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ goalId: null })
    )
  })

  it('見積もりポモドーロ数を入力して送信するとestimatedPomodorosが渡される', () => {
    const onSubmit = vi.fn()
    render(<TaskForm goals={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/タスク名/), { target: { value: 'タスク' } })
    fireEvent.change(screen.getByLabelText(/見積もり/), { target: { value: '3' } })
    fireEvent.click(screen.getByText('追加する'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ estimatedPomodoros: 3 })
    )
  })

  it('キャンセルボタンクリックでonCancelが呼ばれる', () => {
    const onCancel = vi.fn()
    render(<TaskForm goals={[]} onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('キャンセル'))
    expect(onCancel).toHaveBeenCalled()
  })
})
