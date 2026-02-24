# タスク管理機能 要件定義

**Feature**: task-management
**Version**: 1.0
**Date**: 2026-02-24
**Status**: Approved
**Change Origin**: CHANGE-001（がちTODOコンセプト統合）

---

## 概要

ADHDユーザーの「やれそう感」設計を重視したタスク管理機能。
がちTODOのコアコンセプト（目標連動タスク管理）をポモドーロ×ゴールに統合し、
タスクとポモドーロセッションをシームレスに連携させることでゴール達成をサポートする。

---

## ターゲットユーザー

- ADHDおよびADHD傾向のあるユーザー
- 「今何をすればいいか」の判断コストを下げたいユーザー
- ゴールとデイリータスクを紐づけて管理したいユーザー

---

## 要件一覧

### REQ-TL: タスク一覧表示

#### REQ-TL-001
**When** ユーザーがタスク一覧を表示する場合、**the system shall** ゴールに紐づいたタスクとゴールなしのタスクを一覧表示する。

**受入基準**:
- ゴール別にグループ化されたタスクが表示される
- ゴールなしタスクは「未分類」または末尾にまとめて表示される
- LocalStorageからタスクデータを読み込んで表示する

---

#### REQ-TL-002
**The system shall** 各タスクをシンプルなカード形式で表示し、タスク名・紐づきゴール・完了状態・見積もりポモドーロ数を含める。

**受入基準**:
- カードには以下の要素が表示される：タスク名、ゴール名（または「未分類」）、完了チェックボックス、見積もりポモドーロ数（設定時のみ）
- カードはコンパクトで視覚的に軽量（「やれそう感」の設計）

---

#### REQ-TL-003
**The system shall** 未完了タスクを優先的に上部に表示し、ADHDユーザーが「今これだけやれればOK」と感じられるUIを提供する。

**受入基準**:
- 未完了タスクが完了タスクよりも前に表示される
- 完了タスクは視覚的に区別される（グレーアウトなど）
- デフォルトで完了タスクは折りたたまれているか、薄く表示される

---

#### REQ-TL-004
**When** 表示中のタスクが0件の場合、**the system shall** タスク追加を促すメッセージを表示する。

**受入基準**:
- 「タスクはありません。最初のタスクを追加しましょう！」などの空状態メッセージが表示される
- タスク追加ボタンへのアクションが提供される

---

### REQ-TP: タスク×ポモドーロ連動

#### REQ-TP-001
**When** ユーザーがタスクを選択してポモドーロ開始操作を行う場合、**the system shall** 選択タスクを紐づけてポモドーロセッションを開始する。

**受入基準**:
- タスクカードに「ポモドーロ開始」ボタンが存在する
- ボタン押下でタイマーが25分セッションで起動する
- 選択タスクのIDがセッション情報に紐づいて保持される

---

#### REQ-TP-002
**When** ポモドーロセッションが正常完了する場合、**the system shall** 紐づいたタスクの完了ポモドーロ数を1増加させLocalStorageに保存する。

**受入基準**:
- 25分タイマーが0になった時点でタスクのpomodoro_countが+1される
- 更新値がLocalStorageに永続化される
- タスクカードの完了ポモドーロ数表示が更新される

---

#### REQ-TP-003
**While** ポモドーロセッションが進行中の場合、**the system shall** タイマー画面に現在作業中のタスク名を表示する。

**受入基準**:
- タイマーUIに「作業中: [タスク名]」が表示される
- タスク未選択時は作業中タスク表示がない（従来通り）

---

#### REQ-TP-004
**When** ポモドーロセッションが進行中にユーザーが中断した場合、**the system shall** タスクのポモドーロ数を増加させない。

**受入基準**:
- タイマー途中でリセット/停止した場合、タスクのpomodoro_countは変更されない
- 中断操作（リセットボタン押下等）後、タスクのカウントが従来値のまま

---

### REQ-TC: タスク管理CRUD

#### REQ-TC-001
**When** ユーザーがタスクを作成する場合、**the system shall** タスク名（必須）・紐づきゴール（任意）・見積もりポモドーロ数（任意）を入力として新規タスクをLocalStorageに保存する。

**受入基準**:
- タスク追加フォームにタスク名入力欄（必須）が存在する
- ゴール選択プルダウン（任意、空選択可）が存在する
- 見積もりポモドーロ数の数値入力欄（任意）が存在する
- 作成されたタスクはUUIDを付与されLocalStorageに保存される
- タスク名が空の場合は作成できない（バリデーション）

---

#### REQ-TC-002
**When** ユーザーがタスクを完了にする場合、**the system shall** タスクの完了状態をtrueに更新してLocalStorageに保存する。

**受入基準**:
- タスクカードの完了チェックボックスをONにするとcompleted=trueになる
- 完了状態がLocalStorageに保存される
- 完了を取り消し（チェックOFF）するとcompleted=falseに戻る

---

#### REQ-TC-003
**When** ユーザーがタスクを削除する場合、**the system shall** ユーザーの確認後にタスクをLocalStorageから削除する。

**受入基準**:
- 削除ボタン押下時に確認ダイアログが表示される（「このタスクを削除しますか？」）
- 確認OKでタスクがLocalStorageから削除される
- 確認キャンセルでタスクは削除されない

---

#### REQ-TC-004
**The system shall** タスクのゴール紐づけをオプションとし、ゴールなしタスクも作成・管理できる。

**受入基準**:
- ゴール未選択（null）でタスク作成が可能
- ゴールなしタスクは「未分類」として表示される
- ゴール一覧が空の場合もタスク作成ができる

---

#### REQ-TC-005
**When** ゴールが削除された場合、**the system shall** そのゴールに紐づいていたタスクのゴール参照をnullに更新する（タスク自体は削除しない）。

**受入基準**:
- ゴール削除時、goal_idが一致するタスクのgoal_idがnullに更新される
- 該当タスクは削除されず「未分類」として引き続き表示される
- ゴール削除とタスク更新は一括でLocalStorageに保存される

---

## データ型定義（参考）

```typescript
interface Task {
  id: string;           // UUID
  title: string;        // タスク名（必須）
  goalId: string | null; // ゴールID（任意）
  completed: boolean;   // 完了状態
  estimatedPomodoros: number | null; // 見積もりポモドーロ数（任意）
  completedPomodoros: number;        // 完了ポモドーロ数
  createdAt: string;    // ISO8601
  updatedAt: string;    // ISO8601
}
```

---

## トレーサビリティマトリクス

| 要件ID    | 設計 | 実装ファイル | テストファイル |
|-----------|------|------------|--------------|
| REQ-TL-001 | TaskListコンポーネント | src/components/TaskList.tsx | TaskList.test.tsx |
| REQ-TL-002 | TaskCardコンポーネント | src/components/TaskCard.tsx | TaskCard.test.tsx |
| REQ-TL-003 | TaskListソート | src/components/TaskList.tsx | TaskList.test.tsx |
| REQ-TL-004 | 空状態UI | src/components/TaskList.tsx | TaskList.test.tsx |
| REQ-TP-001 | Timer連携 | src/components/Timer.tsx | Timer.test.tsx |
| REQ-TP-002 | ポモドーロ完了ハンドラ | src/components/Timer.tsx | Timer.test.tsx |
| REQ-TP-003 | Timer表示 | src/components/Timer.tsx | Timer.test.tsx |
| REQ-TP-004 | 中断ハンドラ | src/components/Timer.tsx | Timer.test.tsx |
| REQ-TC-001 | TaskFormコンポーネント | src/components/TaskForm.tsx | TaskForm.test.tsx |
| REQ-TC-002 | タスク完了処理 | src/storage.ts | storage.test.ts |
| REQ-TC-003 | タスク削除処理 | src/storage.ts | storage.test.ts |
| REQ-TC-004 | タスクデータ型 | src/types/task.ts | types.test.ts |
| REQ-TC-005 | ゴール削除連携 | src/storage.ts | storage.test.ts |

---

*Generated from CHANGE-001 via MUSUBI musubi-change workflow*
