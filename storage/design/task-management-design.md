# タスク管理機能 設計文書

**Feature**: task-management
**Change Origin**: CHANGE-001
**Version**: 1.0
**Status**: Draft
**Date**: 2026-02-24
**Author**: MUSUBI SDD / sdd-design フェーズ

---

## 目次

1. [概要](#1-概要)
2. [データモデル設計](#2-データモデル設計)
3. [LocalStorage 設計](#3-localstorage-設計)
4. [コンポーネント設計](#4-コンポーネント設計)
5. [状態管理設計](#5-状態管理設計)
6. [Timer.tsx 拡張設計](#6-timertsx-拡張設計)
7. [App.tsx 変更設計](#7-apptsx-変更設計)
8. [エラーハンドリング設計](#8-エラーハンドリング設計)
9. [トレーサビリティ](#9-トレーサビリティ)
10. [テスト設計方針（Article III 準拠）](#10-テスト設計方針article-iii-準拠)

---

## 1. 概要

### 設計目標

- ADHDユーザーの「やれそう感」を支えるシンプルなタスク管理UIを提供する
- 既存のゴール管理・ポモドーロタイマーとの後方互換性を完全に保持する
- フルクライアントサイド（LocalStorage）のみで実現する
- Article VIII（Anti-Abstraction Gate）に従い、不必要な抽象化層を排除する

### アーキテクチャ方針

```
App.tsx（状態オーナー）
├── Timer.tsx  ← activeTaskId を受け取り、タスク名表示・ポモドーロ完了通知
├── TaskList.tsx（新規）← tasks state を自己管理
│   ├── TaskCard.tsx（新規）← stateless表示コンポーネント
│   └── TaskForm.tsx（新規）← フォームstate のみ所有
├── GoalList.tsx（変更：タスク削除時のゴール連携コールバック追加）
└── Stats.tsx（変更なし）
```

---

## 2. データモデル設計

### Task 型（`src/types.ts` に追記）

```typescript
export interface Task {
  id: string                     // crypto.randomUUID() で生成
  title: string                  // タスク名（必須、1文字以上）
  goalId: string | null          // ゴールID（任意、null = 未分類）
  completed: boolean             // 完了状態（false = 未完了）
  estimatedPomodoros: number | null  // 見積もりポモドーロ数（任意、null = 未設定）
  completedPomodoros: number     // 完了したポモドーロ数（初期値 0）
  createdAt: string              // ISO 8601 形式（例: "2026-02-24T10:00:00.000Z"）
  updatedAt: string              // ISO 8601 形式（更新のたびに更新）
}
```

#### フィールド制約

| フィールド | 型 | 制約 | デフォルト |
|-----------|---|------|----------|
| `id` | string | UUID、変更不可 | `crypto.randomUUID()` |
| `title` | string | 必須、trim後1文字以上 | — |
| `goalId` | string \| null | 既存Goalのidまたはnull | `null` |
| `completed` | boolean | — | `false` |
| `estimatedPomodoros` | number \| null | 正の整数またはnull | `null` |
| `completedPomodoros` | number | 0以上の整数 | `0` |
| `createdAt` | string | ISO 8601 | 作成時刻 |
| `updatedAt` | string | ISO 8601 | 作成時刻（後に更新） |

#### 既存型との関係

```
Goal.id ─── (参照) ──→ Task.goalId
```

- Goal削除時: Task.goalId を `null` に更新（REQ-TC-005）
- Task削除時: Goal に影響なし
- 循環参照なし

---

## 3. LocalStorage 設計

### ストレージキー

```typescript
const TASKS_KEY = 'pomogoal_tasks'  // 既存の pomogoal_ プレフィックスに統一
```

> **注**: CHANGE-001.md の `pomodoro_tasks` 表記を `pomogoal_tasks` に修正。
> 既存キー `pomogoal_goals`, `pomogoal_history`, `pomogoal_today_pomos` と統一。

### データ構造

```json
// localStorage.getItem('pomogoal_tasks')
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "設計文書を書く",
    "goalId": "goal-123",
    "completed": false,
    "estimatedPomodoros": 2,
    "completedPomodoros": 1,
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T11:30:00.000Z"
  }
]
```

### `src/storage.ts` に追加する関数

```typescript
// ── タスク関連 ──────────────────────────────────────────────────

export function loadTasks(): Task[] {
  // localStorage から Task[] を読み込む
  // 失敗時は [] を返す（後方互換性保持）
}

export function saveTasks(tasks: Task[]): void {
  // Task[] を JSON で localStorage に保存
}

export function addTask(
  input: Pick<Task, 'title' | 'goalId' | 'estimatedPomodoros'>
): Task {
  // id, completed, completedPomodoros, createdAt, updatedAt を付与して保存
  // 作成したTaskを返す
}

export function toggleTaskComplete(id: string): void {
  // completed を反転させて updatedAt を更新
}

export function deleteTask(id: string): void {
  // 指定idのタスクをリストから除去して保存
}

export function incrementTaskPomodoro(id: string): void {
  // completedPomodoros を +1 して updatedAt を更新
}

export function updateTasksOnGoalDelete(goalId: string): void {
  // goalId が一致するタスクの goalId を null に更新
  // タスク自体は削除しない（REQ-TC-005）
}
```

---

## 4. コンポーネント設計

### 4.1 TaskList.tsx (`src/components/TaskList.tsx`)

**責務**: タスク一覧の表示、CRUD操作の調整、ゴール連携
**状態オーナー**: `tasks`

```typescript
interface Props {
  activeTaskId: string | null
  onSetActiveTaskId: (id: string | null) => void
}
```

#### State

```typescript
const [tasks, setTasks] = useState<Task[]>([])
const [goals, setGoals] = useState<Goal[]>([])       // ゴール名表示用
const [showForm, setShowForm] = useState(false)
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
```

#### 主要ロジック

```
初期化:
  tasks ← loadTasks()
  goals ← loadGoals()

タスク追加:
  newTask ← addTask(input)
  tasks ← [...tasks, newTask]

完了切替:
  toggleTaskComplete(id)
  tasks ← tasks.map(t => t.id === id ? {...t, completed: !t.completed, updatedAt: now} : t)

削除:
  1. deleteConfirmId = id（確認ダイアログ表示）
  2. ユーザーが確認 → deleteTask(id)
  3. activeTaskId === id なら onSetActiveTaskId(null)

表示ソート（REQ-TL-003）:
  未完了 → 作成日時昇順
  完了済み → 完了後に配置
```

#### 表示レイアウト

```
┌─────────────────────────────────────┐
│ タスク            [+ タスクを追加]  │
├─────────────────────────────────────┤
│ 🎯 目標名でグループ化（goalId別）   │
│   [TaskCard] [TaskCard]              │
│ 📋 未分類タスク                      │
│   [TaskCard]                         │
├─────────────────────────────────────┤
│ 空状態: 「タスクを追加して         │
│ 今日の集中を始めましょう！」        │
└─────────────────────────────────────┘
```

---

### 4.2 TaskCard.tsx (`src/components/TaskCard.tsx`)

**責務**: 個々のタスクカードの表示と操作受付
**状態**: なし（stateless）

```typescript
interface Props {
  task: Task
  goalName: string | null          // goalId → Goal.text の解決済み値
  isActive: boolean                // 現在ポモドーロで選択中か
  onToggleComplete: (id: string) => void
  onSelect: (id: string) => void   // ポモドーロで使うタスクとして選択
  onDelete: (id: string) => void
}
```

#### 表示内容

```
┌─────────────────────────────────────────┐
│ [✅/⬜] タスク名                        │
│         🎯 ゴール名（あれば）           │
│         🍅 完了数 / 見積もり数          │
│                          [▶] [🗑]      │
└─────────────────────────────────────────┘
```

- `isActive` の場合: カードに強調ボーダー（アクティブ中表示）
- `completed` の場合: タスク名に取り消し線
- `▶` ボタン: ポモドーロタスクとして選択（`onSelect`）
- `🗑` ボタン: 削除確認を親に通知（`onDelete`）

---

### 4.3 TaskForm.tsx (`src/components/TaskForm.tsx`)

**責務**: タスク作成フォームの表示と入力受付
**状態**: フォームフィールドのみ所有

```typescript
interface Props {
  goals: Goal[]
  onSubmit: (input: Pick<Task, 'title' | 'goalId' | 'estimatedPomodoros'>) => void
  onCancel: () => void
}
```

#### State

```typescript
const [title, setTitle] = useState('')
const [goalId, setGoalId] = useState<string | null>(null)
const [estimatedPomodoros, setEstimatedPomodoros] = useState<number | null>(null)
```

#### バリデーション

```
送信時:
  - title.trim().length === 0 → エラー表示（「タスク名を入力してください」）
  - estimatedPomodoros < 1 → エラー表示（「1以上の数値を入力してください」）
  - 正常 → onSubmit({ title: title.trim(), goalId, estimatedPomodoros })
```

#### 表示レイアウト

```
┌─────────────────────────────────────┐
│ タスク名 *                          │
│ [________________________]          │
│                                     │
│ 紐づきゴール（任意）                │
│ [ドロップダウン ▼]                 │
│                                     │
│ 見積もりポモドーロ数（任意）        │
│ [数値入力]                          │
│                                     │
│      [キャンセル] [追加する]        │
└─────────────────────────────────────┘
```

---

## 5. 状態管理設計

### 状態オーナーシップ一覧

| State | オーナー | 型 | 役割 |
|-------|---------|---|-----|
| `tab` | App.tsx | `'timer' \| 'tasks' \| 'goals' \| 'stats'` | 現在のタブ |
| `activeGoalId` | App.tsx | `string \| null` | タイマー連携中のゴールID |
| `activeTaskId` | App.tsx | `string \| null` | タイマー連携中のタスクID |
| `refreshKey` | App.tsx | `number` | 子コンポーネント強制再描画用 |
| `tasks` | TaskList.tsx | `Task[]` | タスク一覧（LocalStorageと同期） |
| `goals` | TaskList.tsx | `Goal[]` | ゴール名解決用（読み取り専用） |
| `showForm` | TaskList.tsx | `boolean` | フォーム表示状態 |
| `deleteConfirmId` | TaskList.tsx | `string \| null` | 削除確認ダイアログ対象 |
| `title` | TaskForm.tsx | `string` | フォーム入力値 |
| `goalId` (form) | TaskForm.tsx | `string \| null` | フォーム入力値 |
| `estimatedPomodoros` (form) | TaskForm.tsx | `number \| null` | フォーム入力値 |

### Props フロー

```
App.tsx
  activeTaskId, onSetActiveTaskId
    ↓
  Timer.tsx     ← タスク名表示・ポモドーロ完了通知
  TaskList.tsx  ← タスク選択のコールバック受け渡し

App.tsx
  onPomodoroComplete
    ↓
  Timer.tsx → App.tsx → incrementTaskPomodoro(activeTaskId)
                      → incrementGoalPomodoro(activeGoalId)  // 既存処理
```

---

## 6. Timer.tsx 拡張設計

### Props の変更

```typescript
// 変更前
interface Props {
  onPomodoroComplete: () => void
  activeGoalId: string | null
  onSetActiveGoalId: (id: string | null) => void
}

// 変更後（追加のみ）
interface Props {
  onPomodoroComplete: () => void
  activeGoalId: string | null
  onSetActiveGoalId: (id: string | null) => void
  activeTaskId: string | null           // 追加
  activeTaskTitle: string | null        // 追加（App.tsx で解決済みの名前を渡す）
  onSetActiveTaskId: (id: string | null) => void  // 追加
}
```

> `activeTaskTitle` はApp.tsxでTasksから解決して渡す。Timer.tsx内でLoadTasksを呼ばない（単一責任）。

### State の変更

変更なし。`running`, `mode`, `seconds`, `todayCount`, `goals` はそのまま。

### 表示の変更（REQ-TP-003）

```
タイマー画面（既存）:
  ┌─────────────────────────┐
  │ 作業中 / 小休憩 / 大休憩 │
  │    ⊙  MM:SS           │
  │  [目標選択ドロップダウン] │  ← 既存
  │  [スタート] [リセット]   │
  └─────────────────────────┘

タイマー画面（変更後）:
  ┌─────────────────────────┐
  │ 作業中 / 小休憩 / 大休憩 │
  │    ⊙  MM:SS           │
  │  🎯 ゴール名（既存）     │
  │  ✅ タスク名（新規追加） │  ← activeTaskTitle が null でなければ表示
  │  [スタート] [リセット]   │
  └─────────────────────────┘
```

- `activeTaskTitle` が `null` の場合: タスク表示行を非表示（スペースを取らない）
- Timer.tsx はタスク選択UIを持たない。タスク選択は TaskList.tsx の TaskCard から行う

### ポモドーロ完了ハンドラ（REQ-TP-002, REQ-TP-004）

```
onPomodoroComplete() 呼び出し（既存）
  ↓ App.tsx で処理
  ├── incrementGoalPomodoro(activeGoalId)  // 既存処理
  └── incrementTaskPomodoro(activeTaskId) // 追加（activeTaskIdがnullでなければ）
```

中断時（リセットボタン押下・ブレークへ手動移行）は `onPomodoroComplete` を呼ばないため、REQ-TP-004 は自動的に満たされる。

---

## 7. App.tsx 変更設計

### 型の変更

```typescript
// 変更前
type Tab = 'timer' | 'goals' | 'stats'

// 変更後
type Tab = 'timer' | 'tasks' | 'goals' | 'stats'
```

### State の追加

```typescript
// 追加
const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
```

### `handlePomodoroComplete` の変更

```typescript
// 変更前
const handlePomodoroComplete = () => {
  if (activeGoalId) incrementGoalPomodoro(activeGoalId)
  setRefreshKey(k => k + 1)
}

// 変更後
const handlePomodoroComplete = () => {
  if (activeGoalId) incrementGoalPomodoro(activeGoalId)
  if (activeTaskId) incrementTaskPomodoro(activeTaskId)  // 追加
  setRefreshKey(k => k + 1)
}
```

### `activeTaskTitle` の解決

```typescript
// App.tsx 内で解決（Timer.tsx をストレージから切り離すため）
const [tasks, setTasks] = useState<Task[]>([])

useEffect(() => {
  setTasks(loadTasks())
}, [refreshKey])

const activeTaskTitle = activeTaskId
  ? tasks.find(t => t.id === activeTaskId)?.title ?? null
  : null
```

> `tasks` state をApp.tsxが持つのは `activeTaskTitle` 解決のためだけ。
> TaskList.tsx も独自に `loadTasks()` してCRUDを管理する（二重管理だが、refreshKeyで同期）。

### ナビゲーションの変更

```typescript
// 変更前
<nav>
  <button onClick={() => setTab('timer')}>⏱ タイマー</button>
  <button onClick={() => setTab('goals')}>🎯 目標</button>
  <button onClick={() => setTab('stats')}>📊 統計</button>
</nav>

// 変更後
<nav>
  <button onClick={() => setTab('timer')}>⏱ タイマー</button>
  <button onClick={() => setTab('tasks')}>✅ タスク</button>   {/* 追加 */}
  <button onClick={() => setTab('goals')}>🎯 目標</button>
  <button onClick={() => setTab('stats')}>📊 統計</button>
</nav>
```

### レンダリングの変更

```tsx
{tab === 'tasks' && (
  <TaskList
    activeTaskId={activeTaskId}
    onSetActiveTaskId={setActiveTaskId}
  />
)}
```

### GoalList との連携（REQ-TC-005）

```tsx
// GoalList.tsx に onGoalDelete コールバックを追加
<GoalList
  activeGoalId={activeGoalId}
  onSetActiveGoalId={setActiveGoalId}
  onGoalDelete={(goalId) => {           // 追加
    updateTasksOnGoalDelete(goalId)
    setRefreshKey(k => k + 1)
  }}
/>
```

---

## 8. エラーハンドリング設計

### LocalStorage 障害

```typescript
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Task[]
  } catch (e) {
    console.error('[storage] loadTasks failed:', e)
    return []  // 空配列にフォールバック（UIを壊さない）
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('[storage] saveTasks failed:', e)
    // localStorageが満杯の場合も含む。UIは変更を表示するが永続化は失敗している。
    // 今フェーズではユーザー通知UIは実装しない（シンプルさ優先）
  }
}
```

### UUID 生成

```typescript
// crypto.randomUUID() はモダンブラウザで利用可能
// フォールバックは不要（React 19 + Vite 7 の想定環境は対応済み）
const id = crypto.randomUUID()
```

### goalId の参照切れ

```typescript
// TaskCard.tsx で goalName を受け取る際
// App.tsx / TaskList.tsx が goals を持ち、find で解決してから渡す
const goalName = goals.find(g => g.id === task.goalId)?.text ?? null
// null の場合は TaskCard がゴール行を非表示にする
```

### タスク削除時のアクティブタスク解除

```typescript
// TaskList.tsx
const handleDelete = (id: string) => {
  deleteTask(id)
  setTasks(prev => prev.filter(t => t.id !== id))
  if (activeTaskId === id) {
    onSetActiveTaskId(null)  // アクティブタスク解除（REQ-TP-004に準じて）
  }
}
```

---

## 9. トレーサビリティ

| 要件ID | 設計要素 | 実装ファイル | テストファイル |
|--------|---------|------------|--------------|
| REQ-TL-001 | TaskList - ゴール別グループ化表示 | `src/components/TaskList.tsx` | `src/components/TaskList.test.tsx` |
| REQ-TL-002 | TaskCard - カード形式表示 | `src/components/TaskCard.tsx` | `src/components/TaskCard.test.tsx` |
| REQ-TL-003 | TaskList - 未完了優先ソート | `src/components/TaskList.tsx` | `src/components/TaskList.test.tsx` |
| REQ-TL-004 | TaskList - 空状態メッセージ | `src/components/TaskList.tsx` | `src/components/TaskList.test.tsx` |
| REQ-TP-001 | TaskCard.onSelect → Timer連携 | `src/components/TaskCard.tsx`, `src/App.tsx` | `src/App.test.tsx` |
| REQ-TP-002 | App.handlePomodoroComplete → incrementTaskPomodoro | `src/App.tsx`, `src/storage.ts` | `src/storage.test.ts` |
| REQ-TP-003 | Timer.tsx - activeTaskTitle 表示 | `src/components/Timer.tsx` | `src/components/Timer.test.tsx` |
| REQ-TP-004 | 中断時は onPomodoroComplete 非呼び出し | `src/components/Timer.tsx` | `src/components/Timer.test.tsx` |
| REQ-TC-001 | TaskForm - タスク作成フォーム | `src/components/TaskForm.tsx`, `src/storage.ts` | `src/components/TaskForm.test.tsx` |
| REQ-TC-002 | toggleTaskComplete | `src/storage.ts` | `src/storage.test.ts` |
| REQ-TC-003 | deleteTask + 確認ダイアログ | `src/storage.ts`, `src/components/TaskList.tsx` | `src/storage.test.ts` |
| REQ-TC-004 | Task.goalId が null 許容 | `src/types.ts` | `src/storage.test.ts` |
| REQ-TC-005 | updateTasksOnGoalDelete | `src/storage.ts` | `src/storage.test.ts` |

---

## 10. テスト設計方針（Article III 準拠）

### Red-Green-Blue サイクル

実装前にテストを作成（テスト先行）:

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小実装
3. **Blue（Refactor）**: コードを整理

### テストファイル一覧

| ファイル | テスト対象 | 主なテストケース |
|---------|----------|----------------|
| `src/storage.test.ts` | storage関数 | addTask, toggleTaskComplete, deleteTask, incrementTaskPomodoro, updateTasksOnGoalDelete |
| `src/components/TaskList.test.tsx` | TaskList | ゴール別グループ化, 未完了優先表示, 空状態, CRUD操作 |
| `src/components/TaskCard.test.tsx` | TaskCard | 完了表示, アクティブ表示, ボタン動作 |
| `src/components/TaskForm.test.tsx` | TaskForm | バリデーション, 送信, キャンセル |
| `src/components/Timer.test.tsx` | Timer（拡張） | タスク名表示, ポモドーロ完了通知 |

### ユニットテスト優先（Article IX: Integration-First は LocalStorage で実現）

```typescript
// storage.test.ts の例
beforeEach(() => {
  localStorage.clear()
})

it('addTask: id/completedPomodoros/createdAt を自動付与する', () => {
  const task = addTask({ title: 'テスト', goalId: null, estimatedPomodoros: null })
  expect(task.id).toBeDefined()
  expect(task.completedPomodoros).toBe(0)
  expect(task.completed).toBe(false)
})

it('updateTasksOnGoalDelete: 対象goalIdのタスクがnullになる', () => {
  addTask({ title: 'A', goalId: 'goal-1', estimatedPomodoros: null })
  addTask({ title: 'B', goalId: 'goal-2', estimatedPomodoros: null })
  updateTasksOnGoalDelete('goal-1')
  const tasks = loadTasks()
  expect(tasks.find(t => t.title === 'A')?.goalId).toBeNull()
  expect(tasks.find(t => t.title === 'B')?.goalId).toBe('goal-2')
})
```

---

## 変更ファイルサマリー

### 新規作成

| ファイル | 内容 |
|---------|------|
| `src/components/TaskList.tsx` | タスク一覧コンポーネント |
| `src/components/TaskCard.tsx` | タスクカードコンポーネント |
| `src/components/TaskForm.tsx` | タスク作成フォームコンポーネント |
| `src/components/TaskList.test.tsx` | TaskList テスト |
| `src/components/TaskCard.test.tsx` | TaskCard テスト |
| `src/components/TaskForm.test.tsx` | TaskForm テスト |
| `src/storage.test.ts` | storage 関数テスト（タスク関連追加） |

### 変更

| ファイル | 変更内容 |
|---------|---------|
| `src/types.ts` | `Task` interface を追加 |
| `src/storage.ts` | `loadTasks`, `saveTasks`, `addTask`, `toggleTaskComplete`, `deleteTask`, `incrementTaskPomodoro`, `updateTasksOnGoalDelete` を追加 |
| `src/App.tsx` | `tab` 型に `'tasks'` 追加, `activeTaskId` state追加, TaskList統合, handlePomodoroComplete拡張, GoalList に onGoalDelete 追加 |
| `src/components/Timer.tsx` | `activeTaskId`, `activeTaskTitle`, `onSetActiveTaskId` props追加, タスク名表示UI追加 |
| `src/components/GoalList.tsx` | `onGoalDelete` prop追加, 削除時に呼び出し |

### Breaking Changes

なし。既存の `pomogoal_goals`, `pomogoal_history`, `pomogoal_today_pomos` には一切変更なし。
