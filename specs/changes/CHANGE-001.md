# がちTODOコンセプト統合: タスク管理機能追加

**Change ID**: CHANGE-001
**Date**: 2026-02-24
**Status**: Pending

## Description

がちTODO（目標連動タスク管理アプリ）のコアコンセプトをポモドーロ×ゴールに統合する。
ADHDユーザーの「やれそう感」設計を重視したタスク管理機能を追加し、
タスクとポモドーロセッションの連携でゴール達成をサポートする。

背景:
- がちTODOのコアコンセプト（ADHDのやれそう感設計・タスク一覧・目標連動）を統合
- 既存のゴール管理・ポモドーロタイマーとシームレスに連携
- フルクライアントサイド（LocalStorage永続化）で実現

## Requirements Changes

### ADDED

<!-- タスク一覧表示 (REQ-TL) -->
- REQ-TL-001: **When** ユーザーがタスク一覧を表示する場合、**the system shall** ゴールに紐づいたタスクとゴールなしのタスクを一覧表示する。
- REQ-TL-002: **The system shall** 各タスクをシンプルなカード形式で表示し、タスク名・紐づきゴール・完了状態・見積もりポモドーロ数を含める。
- REQ-TL-003: **The system shall** 未完了タスクを優先的に上部に表示し、ADHDユーザーが「今これだけやれればOK」と感じられるUIを提供する。
- REQ-TL-004: **When** 表示中のタスクが0件の場合、**the system shall** タスク追加を促すメッセージを表示する。
<!-- タスク×ポモドーロ連動 (REQ-TP) -->
- REQ-TP-001: **When** ユーザーがタスクを選択してポモドーロ開始操作を行う場合、**the system shall** 選択タスクを紐づけてポモドーロセッションを開始する。
- REQ-TP-002: **When** ポモドーロセッションが正常完了する場合、**the system shall** 紐づいたタスクの完了ポモドーロ数を1増加させLocalStorageに保存する。
- REQ-TP-003: **While** ポモドーロセッションが進行中の場合、**the system shall** タイマー画面に現在作業中のタスク名を表示する。
- REQ-TP-004: **When** ポモドーロセッションが進行中にユーザーが中断した場合、**the system shall** タスクのポモドーロ数を増加させない。
<!-- タスク管理CRUD (REQ-TC) -->
- REQ-TC-001: **When** ユーザーがタスクを作成する場合、**the system shall** タスク名（必須）・紐づきゴール（任意）・見積もりポモドーロ数（任意）を入力として新規タスクをLocalStorageに保存する。
- REQ-TC-002: **When** ユーザーがタスクを完了にする場合、**the system shall** タスクの完了状態をtrueに更新してLocalStorageに保存する。
- REQ-TC-003: **When** ユーザーがタスクを削除する場合、**the system shall** ユーザーの確認後にタスクをLocalStorageから削除する。
- REQ-TC-004: **The system shall** タスクのゴール紐づけをオプションとし、ゴールなしタスクも作成・管理できる。
- REQ-TC-005: **When** ゴールが削除された場合、**the system shall** そのゴールに紐づいていたタスクのゴール参照をnullに更新する（タスク自体は削除しない）。

### MODIFIED

（既存要件の変更なし）

### REMOVED

（既存要件の削除なし）

### RENAMED

（要件名変更なし）

## Design Changes

### ADDED

- TaskListコンポーネント（`src/components/TaskList.tsx`）
- TaskCardコンポーネント（`src/components/TaskCard.tsx`）
- TaskFormコンポーネント（`src/components/TaskForm.tsx`）
- タスクデータ型（`src/types/task.ts`）
- タスクストレージ関数（`src/storage.ts` 拡張）

### MODIFIED

- `src/components/Timer.tsx`: タスク連携UI追加
- `src/storage.ts`: タスクCRUD操作追加
- `src/App.tsx`: TaskListコンポーネント統合

### REMOVED

（設計要素の削除なし）

## Code Changes

### ADDED

- `src/components/TaskList.tsx`
- `src/components/TaskCard.tsx`
- `src/components/TaskForm.tsx`
- `src/types/task.ts`

### MODIFIED

- `src/components/Timer.tsx`
- `src/storage.ts`
- `src/App.tsx`

### REMOVED

（なし）

### RENAMED

（なし）

## Impact Analysis

### Affected Components

- `src/components/Timer.tsx` - タスク連携UI追加
- `src/storage.ts` - タスクCRUD追加
- `src/App.tsx` - レイアウト変更（TaskList統合）

### Breaking Changes

- [x] No breaking changes（既存のゴール・ポモドーロ機能は変更なし）

### Migration Steps

1. LocalStorageに `pomodoro_tasks` キーでタスクデータを追加（既存データに影響なし）

## Testing

### Test Changes

- [ ] Unit tests updated（TaskList, TaskCard, TaskFormコンポーネント）
- [ ] Integration tests updated（タスク×ポモドーロ連動）
- [ ] E2E tests updated

### Test Coverage

- Current coverage: 未計測
- Target coverage: 80%以上（Article III準拠）

## Traceability

### Requirements → Design → Code → Tests

- REQ-TL-001 → TaskListコンポーネント → `src/components/TaskList.tsx` → TaskList.test.tsx
- REQ-TL-002 → TaskCardコンポーネント → `src/components/TaskCard.tsx` → TaskCard.test.tsx
- REQ-TL-003 → TaskListソート → `src/components/TaskList.tsx` → TaskList.test.tsx
- REQ-TL-004 → 空状態UI → `src/components/TaskList.tsx` → TaskList.test.tsx
- REQ-TP-001 → Timer連携 → `src/components/Timer.tsx` → Timer.test.tsx
- REQ-TP-002 → ポモドーロ完了ハンドラ → `src/components/Timer.tsx` → Timer.test.tsx
- REQ-TP-003 → Timer表示 → `src/components/Timer.tsx` → Timer.test.tsx
- REQ-TP-004 → 中断ハンドラ → `src/components/Timer.tsx` → Timer.test.tsx
- REQ-TC-001 → TaskFormコンポーネント → `src/components/TaskForm.tsx` → TaskForm.test.tsx
- REQ-TC-002 → タスク完了処理 → `src/storage.ts` → storage.test.ts
- REQ-TC-003 → タスク削除処理 → `src/storage.ts` → storage.test.ts
- REQ-TC-004 → タスクデータ型 → `src/types/task.ts` → types.test.ts
- REQ-TC-005 → ゴール削除連携 → `src/storage.ts` → storage.test.ts

## Approval

- [x] Technical review complete（requirements定義フェーズ）
- [x] Product review complete（がちTODO統合方針確定済み）
- [ ] Security review complete（フルクライアントサイドのため不要）
- [x] Ready to apply（requirements定義完了、次フェーズはdesign）
