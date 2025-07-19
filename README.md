## FLASK_APP
ミニアプリを開発
### 使用するもの
- venv
- Flask
- SQLAlchemy
- psycopg2-binary
- python-dotenv
- PostgreSQL
- requirements.txt

#### STEP 1 準備
venvを起動する
```bash
# bash
$ python3 -m venv venv
$ source venv/bin/activate
```
使用するものをインストールする
```bash
# bash
$ pip install Flask SQLAlchemy psycopg2-binary python-dotenv
```
環境をメモする
```bash
$ pip freeze > requirements.txt
```
.env を用意する
```bash
$ touch .env
```

### STEP 2 データベースを作成
PostgreSQLの導入(todo_app) </br>
※データベース本体なので sudo で install する
```bash
$ sudo apt update
$ sudo apt install postgresql postgresql-contrib
```
PostgreSQLにログイン：
```bash
$ psql -h localhost -d postgres -U postgres
```
データベースの作成 :
```bash
# CREATE DATABASE todo_app;
```
終了：
```bash
# \q
```

以降の接続：
```bash
$ psql -U postgres -h localhost -W
$ psql -U postgres -h localhost
```

### STEP 3
テーブルの情報を取得する
```python
# main.py
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv  # type: ignore
import os

def main():
    load_dotenv()

    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    dbname = os.getenv("DB_NAME")

    # 接続文字列を作成
    db_url = f"postgresql+psycopg2://{user}:{password}@{host}/{dbname}"
    
    engine = create_engine(
        db_url,
        echo=True,
    )
    
    # テーブルの情報を取得
    inspector = inspect(engine)
    print(inspector.get_table_names())


if __name__ == "__main__":
    main()

```
```t
# .env
DB_USER=          # ユーザー名 例：postgres
DB_PASSWORD=      # パスワード
DB_HOST=localhost # ホスト名
DB_NAME=todo_db   # データベース名
```
空のデータベースであることを確認、