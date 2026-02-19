# MUSUBI - ポモドーロ × ゴール

ポモドーロテクニックと目標管理を組み合わせた集中力最大化PWA

## MUSUBI SDD for Claude Code

This project uses **MUSUBI** (Ultimate Specification Driven Development) with 8 skill groups.

### Commands

- `/sdd-steering` - Generate/update project memory
- `/sdd-requirements <feature>` - Create EARS requirements
- `/sdd-design <feature>` - Generate C4 + ADR design
- `/sdd-tasks <feature>` - Break down into tasks
- `/sdd-implement <feature>` - Execute implementation
- `/sdd-validate <feature>` - Validate constitutional compliance

### Project Memory

- `steering/product.ja.md` - プロダクトコンテキスト
- `steering/tech.ja.md` - 技術スタック
- `steering/structure.ja.md` - プロジェクト構造
- `steering/project.yml` - プロジェクト設定
- `steering/rules/constitution.md` - 9 Constitutional Articles

## 技術スタック

- React 18 + TypeScript + Vite
- vite-plugin-pwa（PWA対応）
- LocalStorage（データ永続化）
- Notification API（ポモドーロ完了通知）

## 主要コンポーネント

- `src/components/Timer.tsx` - ポモドーロタイマー（25/5/15分）
- `src/components/GoalList.tsx` - 目標管理
- `src/components/Stats.tsx` - 統計表示
- `src/storage.ts` - LocalStorageラッパー

## 開発コマンド

```bash
npm run dev     # 開発サーバー
npm run build   # ビルド
npm run preview # プレビュー
```

## 開発ルール

- 計画先行: 設計→承認→実装
- バックエンドサーバーなし（フルクライアントサイド）
- 機能追加時はMUSUBIプロセスを回す（/sdd-requirementsから）

## Git Push ルール

作業完了時は必ず `jj git push` を実行すること。
- MUSUBIの各ステップ完了時
- 機能実装完了時
- steering files 更新時
