# 技術スタック — ポモドーロ × ゴール

**Project**: pomodoro-goal-pwa
**Last Updated**: 2026-02-18
**Version**: 1.0

---

## 概要

React + TypeScript + Vite + vite-plugin-pwa による集中力最大化PWA。
バックエンドなし、全データはLocalStorageに保存。

---

## プライマリ技術

| 技術 | バージョン | 役割 |
|------|-----------|------|
| TypeScript | 5.x | 全コード（型安全） |
| React | 18+ | UIコンポーネント |
| Vite | 5.x | ビルドツール・開発サーバー |
| vite-plugin-pwa | - | PWA対応（Service Worker/Manifest自動生成） |

### ストレージ

| 技術 | 役割 |
|------|------|
| LocalStorage | 目標・統計データの永続化 |

### Web API

| API | 役割 |
|-----|------|
| Notification API | ポモドーロ完了通知 |
| Service Worker | PWAオフラインキャッシュ |

---

## パッケージマネージャー

npm

---

## 開発コマンド

```bash
npm install     # 依存関係インストール
npm run dev     # 開発サーバー起動（localhost:5173）
npm run build   # プロダクションビルド
npm run preview # ビルド確認
```

---

## デプロイ

| 項目 | 内容 |
|------|------|
| 予定 | Vercel / GitHub Pages |
| ホスティング形式 | 静的ファイル（SPA） |

---

**Last Updated**: 2026-02-18
**Maintained By**: imudak / クロウ候
