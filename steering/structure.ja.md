# プロジェクト構造 — ポモドーロ × ゴール

**Project**: pomodoro-goal-pwa
**Last Updated**: 2026-02-18
**Version**: 1.0

---

## アーキテクチャパターン

**パターン**: フルクライアントサイドSPA（React + Vite PWA）

バックエンドサーバーなし。全データはLocalStorageに保存。
3タブ構成（タイマー・目標・統計）でシンプルなUXを実現。

---

## ディレクトリ構成

```
pomodoro-goal-pwa/
├── src/
│   ├── App.tsx              # アプリルート・タブ切り替え
│   ├── main.tsx             # エントリーポイント
│   ├── App.css              # アプリスタイル
│   ├── index.css            # グローバルスタイル
│   ├── storage.ts           # LocalStorage操作（目標・統計の読み書き）
│   ├── types.ts             # 型定義（Goal, PomodoroSession等）
│   ├── assets/              # 静的アセット（アイコン等）
│   └── components/
│       ├── Timer.tsx        # ポモドーロタイマー（25/5/15分切り替え）
│       ├── Timer.css        # タイマースタイル
│       ├── GoalList.tsx     # 目標管理（作成・完了・削除）
│       ├── GoalList.css     # 目標リストスタイル
│       ├── Stats.tsx        # 統計表示（日・週・月）
│       └── Stats.css        # 統計スタイル
├── public/                  # 静的ファイル（PWAアイコン等）
├── dist/                    # ビルド成果物
├── steering/                # MUSUBIステアリング文書
├── CLAUDE.md
├── package.json
├── vite.config.ts           # Vite設定（vite-plugin-pwa含む）
├── tsconfig.json
└── tsconfig.node.json
```

---

## コンポーネント詳細

### App.tsx（ルート）
- 3タブ（timer/goals/stats）の切り替え管理
- `onPomodoroComplete`コールバックでGoalListにポモドーロ完了を通知
- `refreshKey`で目標/統計の再描画トリガー

### Timer.tsx（タイマー）
- ポモドーロサイクル管理: 作業25分 → 休憩5分（4回後は15分）
- `useEffect` + `setInterval`でカウントダウン
- 完了時: ブラウザ通知 + `onPomodoroComplete`コールバック呼び出し

### GoalList.tsx（目標管理）
- 目標の追加・完了チェック・削除
- LocalStorageで永続化（`storage.ts`経由）
- ポモドーロ完了時に進捗カウントアップ

### Stats.tsx（統計）
- 日・週・月の集中時間を集計・表示
- LocalStorageから読み込み

### storage.ts（データ層）
- 目標・ポモドーロセッションのLocalStorage読み書き
- 型安全なラッパー

---

**Last Updated**: 2026-02-18
**Maintained By**: imudak / クロウ候
