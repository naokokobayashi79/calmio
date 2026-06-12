# Calmio

音と呼吸で、いまの体感を整える。

Calmioは、音・呼吸・やさしいリズムで、今のコンディションを記録しながら整えるセルフケアアプリです。

## 機能

- 呼吸ガイド付き調整セッション（3分 / 5分 / 10分）
- サウンド再生（432Hz / 528Hz / 環境音）
- スマホ振動対応（Vibration API）
- セッション前後の体感スコア記録
- 履歴表示と平均変化の確認
- 結果のシェア（Web Share API / クリップボード）
- レスポンシブ対応（スマホ優先UI）
- PWA対応構成

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Web Audio API
- Vibration API
- localStorage

## セットアップ

```bash
npm install
```

## ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## ビルド

```bash
npm run build
npm start
```

## Vercelへのデプロイ

1. [Vercel](https://vercel.com) にGitHubリポジトリを接続
2. フレームワークプリセットで「Next.js」を選択
3. デプロイボタンを押す

追加設定は不要です。

## 今後の拡張

- Supabase連携によるデータ永続化
- ユーザー認証（メール / OAuth）
- セッション種類の追加
- グラフ表示による体感変化の可視化
- PWAのService Worker実装

## 注意事項

本アプリはセルフケア、リラクゼーション、体感記録を目的としたものです。医療行為、診断、治療、予防を目的とするものではありません。
