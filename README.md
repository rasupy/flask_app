## FLASK_APP
ミニアプリを開発 - ToDo

### アプリ名 :

`Todo_App`

---

### 開発の背景、目的

* 勉学のスケージュールなどをタスクで管理してモチベを上げる 
* なにをやるか、やったかを視覚的に把握できると便利
* シンプルで手軽なツールを目指す

---

### 想定ユーザー

* 活動家、学生、主婦、会社員、経営者、ゲーマーなど

---

### 利用シーン

* 学習内容を記録したい
* 食事の献立を管理したい
* 業務の段取りを確認したい

---

### 機能要件

| 機能 |
| -------------------- | 
| ユーザー登録・ログイン | 
| カテゴリーの追加、編集、並べ替え、削除　|　
| タスクの追加、編集、並べ替え、移動、削除　| 

---

### 使用技術

| 項目     | 内容                                  |
| ------ | -------------------------------------- |
| フロント   | HTML-CSS, SASS, JavaScript, TypeScript（予定） |
| バックエンド | Flask (Python)                         |
| DB     | PostgreSQL + SQLAlchemy                |
| 環境     | Venv → Docker 移行予定                     |
| IDE    | VSCode-WSL2 / Copilot + ChatGPT                   |

---

### データベース設計(todo_db)

| テーブル名  | カラム名      | 型       | 説明      |
| ---------- | ------------ | -------- | ------- |
| users      | id           | uuid     | ユーザーID  |
|            | name         | text      | ユーザー名  |
|            | email        | text      | メール      |
|            | password     | text     | パスワード |
|            | created_at   | timezone | 登録日 |
| posts      | id           | uuid     | タスクID  |
|            | title        | text     | タスク名  |
|            | content      | text     | 内容      |
|            | user_id      | uuid     | ユーザーID   |
|            | category_id  | uuid     | カテゴリーID |
|            | status       | text     | ステータス   |
|            | sort_order   | int      | 並び順      |
| categories | id           | uuid     | カテゴリID  |
|            | name         | text      | カテゴリ名   |
|            | sort_order   | int      | 並び順 |

---

### 画面設計

* `/login` : ログイン画面
* `/admin` : 開発者用
* `/<user_name>`: ユーザー用

---

### 開発中のアイデア
- Docker、TypeScriptに移行予定

```t
# tips
最小のアプリでも機能が増えると管理が大変になる。
```

## セットアップ手順

### 1. 環境変数の設定
```bash
# .envファイルを作成
cp .env.example .env

# .envファイルを編集して実際の値を設定
nano .env
```

### 2. 開発環境での起動
```bash
# venv環境での起動
source venv/bin/activate
python flaskr/main.py

# Docker環境での起動
docker-compose up --build
```

### 3. 本番環境での注意点
- SECRET_KEYは必ず変更してください
- データベースのパスワードは強力なものを使用してください
- 環境変数は安全に管理してください
