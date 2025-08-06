# Todo App - タスク管理システム

![Flask](https://img.shields.io/badge/Flask-3.1.1-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Docker](https://img.shields.io/badge/Docker-compose-blue)
![Python](https://img.shields.io/badge/Python-3.11-yellow)

## 📝 プロジェクト概要

学習や仕事のタスクを効率的に管理できるWebアプリケーションです。直感的なドラッグ&ドロップ操作でタスクの移動・並び替えができ、カテゴリー別にタスクを整理できます。

### 🎯 開発目的

- **視覚的なタスク管理**: todo → progress → archive の流れで進捗を可視化
- **カテゴリー別整理**: 学習、仕事、趣味など目的別にタスクを分類
- **シンプルなUI**: 直感的で使いやすいインターフェース

## ✨ 主な機能

- 📂 **カテゴリー管理**: 追加・編集・並び替え・削除
- ✅ **タスク管理**: 追加・編集・ステータス変更・削除
- 🔄 **ドラッグ&ドロップ**: タスクの移動と並び替え
- 📱 **レスポンシブデザイン**: モバイル対応
- ⚡ **リアルタイム更新**: 非同期処理による快適な操作

## 🛠️ 技術スタック

### フロントエンド
- **HTML5/CSS3** - セマンティックなマークアップ
- **Sass** - CSS設計・管理
- **JavaScript (ES6+)** - 非同期処理・DOM操作
- **SortableJS** - ドラッグ&ドロップ機能

### バックエンド
- **Flask 3.1.1** - Webアプリケーションフレームワーク
- **SQLAlchemy 2.0** - ORM・データベース操作
- **PostgreSQL 15** - リレーショナルデータベース

### インフラ・開発環境
- **Docker & Docker Compose** - コンテナ化・環境統一
- **psycopg2** - PostgreSQL接続ライブラリ
- **python-dotenv** - 環境変数管理

## 🗄️ データベース設計

```sql
-- ユーザー情報
users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

-- カテゴリー管理
categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE
);

-- タスク管理
posts (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'todo',
    sort_order INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## 🚀 セットアップ & 起動

### 前提条件
- Docker & Docker Compose
- Git

### 1. プロジェクトのクローン
```bash
git clone https://github.com/your-username/flask-todo-app.git
cd flask-todo-app
```

### 2. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して実際の値を設定
```

### 3. アプリケーションの起動
```bash
# Docker環境で起動
docker-compose up --build

# アクセス
http://localhost:5000/admin
```

### 4. 開発環境（ローカル）
```bash
# 仮想環境の作成・有効化
python3 -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# PostgreSQL設定後、アプリケーション起動
python flaskr/main.py
```

## 📁 プロジェクト構成

```
flask_app/
├── flaskr/                 # メインアプリケーション
│   ├── main.py            # エントリーポイント・ルーティング
│   ├── models.py          # データベースモデル
│   ├── config.py          # 設定管理
│   └── db.py              # データベース接続
├── templates/             # HTMLテンプレート
├── static/               # 静的ファイル
│   ├── css/              # スタイルシート
│   └── js/               # JavaScript
├── docker-compose.yml    # Docker構成
├── Dockerfile           # Dockerイメージ定義
└── requirements.txt     # Python依存関係
```

## 🔧 技術的な工夫

### セキュリティ
- **CSRF対策**: Flaskの組み込み機能
- **XSS対策**: セキュリティヘッダーの設定
- **入力値検証**: UUID検証・サニタイゼーション

### パフォーマンス
- **非同期処理**: Fetch APIによる快適なUX
- **N+1問題対策**: SQLAlchemyのselectinload使用
- **データベースインデックス**: 適切なインデックス設計

### 保守性
- **設定外部化**: 環境変数による設定管理
- **エラーハンドリング**: 適切な例外処理とログ出力
- **コード品質**: 型ヒント・docstring・関数分割

## 🎨 UI/UX設計

- **マテリアルデザイン**: Google Material Iconsの採用
- **アニメーション**: CSS transitionによる滑らかな動作
- **カラーパレット**: 視認性を重視したシンプルなデザイン
- **操作性**: 直感的なドラッグ&ドロップインターフェース

## 📱 対応環境

- **ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **OS**: Windows, macOS, Linux
- **モバイル**: iOS Safari, Android Chrome

## 🔮 今後の予定

- [ ] **認証機能**: ユーザー登録・ログイン
- [ ] **TypeScript化**: 型安全性の向上
- [ ] **PWA対応**: オフライン機能・プッシュ通知
- [ ] **テスト実装**: 単体テスト・統合テスト
- [ ] **CI/CD**: GitHub Actions導入

## 🤝 開発者情報

**開発期間**: 2024年7月 - 現在
**開発人数**: 1名（個人開発）

### 習得技術・スキル
- Flaskによるバックエンド開発
- SQLAlchemyを使ったORM操作
- Docker/Docker Composeによる環境構築
- PostgreSQLデータベース設計
- 非同期JavaScriptプログラミング
- レスポンシブWebデザイン

---

> このプロジェクトは継続的に改善・機能追加を行っています。
> ご質問やフィードバックがございましたら、お気軽にお声がけください。
