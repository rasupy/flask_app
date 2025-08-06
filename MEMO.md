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
# database.py
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
空のデータベースであることを確認。</br>
models.py を作っておく。

### 4 テーブルを作成する

Base クラスに DeclarativeBase を継承して</br>
クラスとテーブルを自動で結び付ける
```python
# models.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```
#### users テーブルの定義（ログイン機能）
- ユーザーID
- ユーザー名
- メールアドレス
- パスワード
- 登録日
```python
# models.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Text, Uuid, ForeignKey, DateTime
import uuid
from datetime import date, datetime
from zoneinfo import ZoneInfo


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=False,
        )
    email: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=True,
    )
    password: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
        nullable=False,
    )
```
#### categories テーブルの定義（カテゴリ管理機能）
- カテゴリID
- カテゴリ名
#### posts テーブルの定義(記事投稿機能)
- 記事ID
- 記事タイトル
- 記事内容
- 完了状態
- ユーザーID
- カテゴリID
#### リレーションシップ
python上でオブジェクト同士の結びつきを利用して</br>
オブジェクトにアクセスしやすくする仕組み
```python
# models.py
from sqlalchemy.orm import relationship

# class User
post: Mapped[list["Post"]] = relationship(
    back_populates="user"
)

# class Post
category: Mapped["Category"] = relationship(
    back_populates="post"
)
```
```python
# database.py
""" データベース作成用 """
Base.metadata.create_all(engine)
```
```bash
# bash
$ python database.py
```
todo_db データベースにテーブルが作成される。
#### データベースにテストユーザーを登録
```python
# text.py
from flaskr.db import SessionLocal
from flaskr.models import User
import uuid

with SessionLocal() as session:
    dummy_user = User(
        id=uuid.uuid4(),
        name="テストユーザー",
        email="test@example.com",
        password="dummy_password",  # 本来はハッシュ化したパスワードにする
    )
    session.add(dummy_user)
    session.commit()
    print("ダミーユーザーを追加しました:", dummy_user)
```


#### ページを作る
あとは、Flaskでページと機能をmain.pyで作っていく。</br>
main.py で動作する為に __init__.py と db.py を作成する。</br>
db.py は、データベースにアクセスする為の機能</br>

#### Docker
```bash
# bash
# 既存のコンテナを停止・削除
docker-compose down -v

# 新しい構成でビルド・起動
docker-compose up --build
```
# 1. 現在のDockerデータベースの状態を確認
docker-compose exec db psql -U postgres -d todo_db -c "\dt"

# 2. テーブルの内容を確認
docker-compose exec db psql -U postgres -d todo_db -c "SELECT * FROM users;"
docker-compose exec db psql -U postgres -d todo_db -c "SELECT * FROM categories;"
docker-compose exec db psql -U postgres -d todo_db -c "SELECT * FROM posts;"

# 3. データが空の場合、バックアップから復元
docker-compose exec -T db psql -U postgres -d todo_db < backup.sql
```