import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskList from './TaskList'
import { addTask, saveTasks } from '../storage'
import type { Goal } from '../types'

beforeEach(() => {
  localStorage.clear()
})

const mockGoal: Goal = {
  id: 'goal-1',
  text: 'プロジェクトA',
  completed: false,
  pomodorosTarget: 3,
  pomodorosDone: 0,
}

function saveGoalsForTest(goals: Goal[]) {
  // GoalList.tsxと同じ形式で保存
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem('pomogoal_goals', JSON.stringify({ date: today, goals }))
}

describe('TaskList', () => {
  // REQ-TL-004: 空状態メッセージ
  it('タスクが0件の場合は空状態メッセージを表示する (REQ-TL-004)', () => {
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    expect(screen.getByText(/タスクを追加して/)).toBeInTheDocument()
  })

  // REQ-TL-001: タスク一覧表示
  it('タスクを一覧表示する (REQ-TL-001)', () => {
    addTask({ title: 'タスクA', goalId: null, estimatedPomodoros: null })
    addTask({ title: 'タスクB', goalId: null, estimatedPomodoros: null })
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    expect(screen.getByText('タスクA')).toBeInTheDocument()
    expect(screen.getByText('タスクB')).toBeInTheDocument()
  })

  // REQ-TL-003: 未完了タスクを上部に表示
  it('未完了タスクが完了タスクより上に表示される (REQ-TL-003)', () => {
    const task1 = addTask({ title: '未完了タスク', goalId: null, estimatedPomodoros: null })
    const task2 = addTask({ title: '完了タスク', goalId: null, estimatedPomodoros: null })
    // task2を完了状態、task1を未完了状態にする（addTaskは未完了で作成するのでtask1はそのままでよい）
    const tasks = [
      { ...task2, completed: true },
      { ...task1, completed: false },
    ]
    saveTasks(tasks)

    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    const items = screen.getAllByRole('listitem')
    // 各liのdata-testidか位置でチェック
    const undoneEl = screen.getByText('未完了タスク').closest('li')
    const doneEl = screen.getByText('完了タスク').closest('li')
    expect(undoneEl).toBeTruthy()
    expect(doneEl).toBeTruthy()
    // 未完了が先に来ることをDOM順で確認
    const allItems = Array.from(items)
    const undoneIdx = allItems.indexOf(undoneEl as HTMLElement)
    const doneIdx = allItems.indexOf(doneEl as HTMLElement)
    expect(undoneIdx).toBeLessThan(doneIdx)
  })

  it('タスク追加ボタンでフォームを表示する', () => {
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /タスクを追加/ }))
    expect(screen.getByPlaceholderText(/タスク名/)).toBeInTheDocument()
  })

  it('アクティブタスクIDが一致するTaskCardにisActive=trueが渡される', () => {
    const task = addTask({ title: 'アクティブタスク', goalId: null, estimatedPomodoros: null })
    const { container } = render(
      <TaskList activeTaskId={task.id} onSetActiveTaskId={vi.fn()} />
    )
    const activeCard = container.querySelector('.task-card.active')
    expect(activeCard).toBeInTheDocument()
  })

  // REQ-TL-001: ゴール紐づきタスクの表示
  it('ゴールに紐づいたタスクを表示する (REQ-TL-001)', () => {
    saveGoalsForTest([mockGoal])
    addTask({ title: 'ゴール付きタスク', goalId: 'goal-1', estimatedPomodoros: null })
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    expect(screen.getByText('ゴール付きタスク')).toBeInTheDocument()
    expect(screen.getByText(/プロジェクトA/)).toBeInTheDocument()
  })

  // REQ-TC-003: 削除確認
  it('削除ボタンクリックで確認ダイアログが表示される (REQ-TC-003)', () => {
    addTask({ title: '削除タスク', goalId: null, estimatedPomodoros: null })
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    fireEvent.click(screen.getByTitle('タスクを削除'))
    expect(screen.getByText(/削除しますか/)).toBeInTheDocument()
  })

  it('削除確認でタスクが削除される (REQ-TC-003)', () => {
    addTask({ title: '削除タスク', goalId: null, estimatedPomodoros: null })
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    fireEvent.click(screen.getByTitle('タスクを削除'))
    fireEvent.click(screen.getByText('削除する'))
    expect(screen.queryByText('削除タスク')).not.toBeInTheDocument()
  })

  it('削除キャンセルでタスクは残る (REQ-TC-003)', () => {
    addTask({ title: '残すタスク', goalId: null, estimatedPomodoros: null })
    render(<TaskList activeTaskId={null} onSetActiveTaskId={vi.fn()} />)
    fireEvent.click(screen.getByTitle('タスクを削除'))
    fireEvent.click(screen.getByText('キャンセル'))
    expect(screen.getByText('残すタスク')).toBeInTheDocument()
  })
})
