import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadTasks,
  saveTasks,
  addTask,
  toggleTaskComplete,
  deleteTask,
  incrementTaskPomodoro,
  updateTasksOnGoalDelete,
} from './storage'

beforeEach(() => {
  localStorage.clear()
})

describe('loadTasks', () => {
  it('LocalStorageが空の場合は空配列を返す', () => {
    expect(loadTasks()).toEqual([])
  })

  it('保存済みタスクを返す', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    const tasks = loadTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe(task.id)
  })
})

// REQ-TC-001: タスク作成
describe('addTask', () => {
  it('id/completedPomodoros/createdAt/updatedAtを自動付与する (REQ-TC-001)', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    expect(task.id).toBeDefined()
    expect(task.completedPomodoros).toBe(0)
    expect(task.completed).toBe(false)
    expect(task.createdAt).toBeDefined()
    expect(task.updatedAt).toBeDefined()
  })

  it('goalIdがnullのタスクを作成できる (REQ-TC-004)', () => {
    const task = addTask({ title: 'ゴールなし', goalId: null, estimatedPomodoros: null })
    expect(task.goalId).toBeNull()
  })

  it('goalIdあり・estimatedPomodorosありのタスクを作成できる', () => {
    const task = addTask({ title: '目標付きタスク', goalId: 'goal-123', estimatedPomodoros: 3 })
    expect(task.goalId).toBe('goal-123')
    expect(task.estimatedPomodoros).toBe(3)
  })

  it('作成したタスクがLocalStorageに保存される', () => {
    addTask({ title: 'A', goalId: null, estimatedPomodoros: null })
    expect(loadTasks()).toHaveLength(1)
  })
})

// REQ-TC-002: タスク完了
describe('toggleTaskComplete', () => {
  it('未完了タスクを完了状態にする (REQ-TC-002)', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    toggleTaskComplete(task.id)
    const tasks = loadTasks()
    expect(tasks[0].completed).toBe(true)
  })

  it('完了タスクを未完了状態に戻す', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    toggleTaskComplete(task.id)
    toggleTaskComplete(task.id)
    expect(loadTasks()[0].completed).toBe(false)
  })

  it('updatedAtが更新される', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    const before = task.updatedAt
    toggleTaskComplete(task.id)
    const after = loadTasks()[0].updatedAt
    expect(after >= before).toBe(true)
  })
})

// REQ-TC-003: タスク削除
describe('deleteTask', () => {
  it('指定IDのタスクを削除する (REQ-TC-003)', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    deleteTask(task.id)
    expect(loadTasks()).toHaveLength(0)
  })

  it('他のタスクは削除されない', () => {
    const task1 = addTask({ title: 'A', goalId: null, estimatedPomodoros: null })
    addTask({ title: 'B', goalId: null, estimatedPomodoros: null })
    deleteTask(task1.id)
    const tasks = loadTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('B')
  })
})

// REQ-TP-002: ポモドーロ完了でcompletedPomodoros増加
describe('incrementTaskPomodoro', () => {
  it('completedPomodorosを1増加させる (REQ-TP-002)', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: 2 })
    incrementTaskPomodoro(task.id)
    expect(loadTasks()[0].completedPomodoros).toBe(1)
  })

  it('複数回インクリメントできる', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: 3 })
    incrementTaskPomodoro(task.id)
    incrementTaskPomodoro(task.id)
    expect(loadTasks()[0].completedPomodoros).toBe(2)
  })
})

// REQ-TC-005: ゴール削除時のタスクgoalId更新
describe('updateTasksOnGoalDelete', () => {
  it('対象goalIdのタスクのgoalIdをnullに更新する (REQ-TC-005)', () => {
    addTask({ title: 'A', goalId: 'goal-1', estimatedPomodoros: null })
    addTask({ title: 'B', goalId: 'goal-2', estimatedPomodoros: null })
    updateTasksOnGoalDelete('goal-1')
    const tasks = loadTasks()
    expect(tasks.find(t => t.title === 'A')?.goalId).toBeNull()
    expect(tasks.find(t => t.title === 'B')?.goalId).toBe('goal-2')
  })

  it('タスク自体は削除されない (REQ-TC-005)', () => {
    addTask({ title: 'A', goalId: 'goal-1', estimatedPomodoros: null })
    updateTasksOnGoalDelete('goal-1')
    expect(loadTasks()).toHaveLength(1)
  })
})

describe('saveTasks', () => {
  it('タスク配列をLocalStorageに保存する', () => {
    const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
    const tasks = loadTasks()
    saveTasks(tasks)
    expect(loadTasks()).toHaveLength(1)
    expect(loadTasks()[0].id).toBe(task.id)
  })
})
