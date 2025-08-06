# ==========================================================
# データベースの作成用
# ==========================================================
from sqlalchemy import (
    create_engine,
    inspect,
    select,
    or_,
    update,
    delete,
    text,
)
from sqlalchemy.orm import Session, selectinload, sessionmaker
from .models import Base, User, Post, Category
from datetime import date
from dotenv import load_dotenv  # type: ignore
import os
import uuid


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

    with Session(engine) as session:
        categories = session.query(Category).all()
        for index, cat in enumerate(categories):
            cat.sort_order = index
        session.commit()

    """ データベースの情報を取得
    inspector = inspect(engine)
    print(inspector.get_table_names())
    """

    """ データベース作成用
    Base.metadata.create_all(engine)
    """

    """ データを追加する
    with Session(engine) as session:
        user = User(
            name="",
            email="",
            password="",
        )
        session.add(user)
        session.commit()
    """

    """ 複数のデータを追加する
    with Session(engine) as session:
        user_1 = User(name="田中", birthday=date(1992, 7, 11))
        user_2 = User(name="佐藤", birthday=date(2001, 5, 25))
        user_3 = User(name="山田", birthday=date(2006, 10, 4))
        user_4 = User(name="佐々木")
        session.add_all([user_1, user_2, user_3, user_4])
        session.commit()
    """

    """ 値を取得する
    with Session(engine) as session:
        stmt = select(User).where(User.name == "田中")
        user = session.scalars(stmt).one()
        print(user.id, user.name, user.birthday)
    """

    """ 複数の値を取得する
    with Session(engine) as session:
        stmt = select(User)
        result = session.scalars(stmt)
        for user in result:
            print(user.name, user.birthday)
    """

    """ POSTテーブルにデータを追加する
    with Session(engine) as session:
        stmt = select(User).where(User.name == "鈴木")
        user = session.scalars(stmt).one()
        post_1 = Post(
            title="Pythonについて",
            body="Pythonはインタープリンタ型の"
            "高水準用プログラミング言語である。",
            user_id=user.id,
        )
        post_2 = Post(
            title="Javaについて",
            body="Javaは、汎用プログラミング言語"
            "とソフトウェアプラットフォームの"
            "双方を指している双方を指している総称ブランドである。",
            user_id=user.id,
        )
        session.add_all([post_1, post_2])
        session.commit()
    """

    """
    ユーザーの情報を取得する(N+1問題対策)
    with Session(engine) as session:
        stmt = select(Post).options(selectinload(Post.user))
        result = session.scalars(stmt)
        for post in result:
            print(post.title, post.user.name)
    """

    """ テーブル内容を変更する
    with Session(engine) as session:
        stmt = select(User).where(User.name == "田中")
        user = session.scalars(stmt).one()
        user.birthday = date(2002, 7, 11)
        session.commit()
    """

    """ 複数の内容を変更する
    with Session(engine) as session:
        stmt = (
            update(User)
            .where(User.name.like("%木"))
            .values(birthday=date(1999, 7, 7))
        )
        session.execute(stmt)
        session.commit()
    """

    """ テーブルのデータを削除
    with Session(engine) as session:
        stmt = select(User).where(User.name == "rasupy")
        user = session.scalars(stmt).one()
        session.delete(user)
        session.commit()
    """

    """ 複数のデータを削除
    with Session(engine) as session:
        stmt = delete(User).where(User.name.like("佐%"))
        session.execute(stmt)
        session.commit()
    """


# Docker環境用のデータベース初期化
# ------------------------------------------
def init_database():
    """Docker環境用のデータベース初期化"""
    from .config import get_config
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import Session
    from .models import Base, User
    import uuid

    config = get_config()

    # DEBUG属性の安全な取得
    debug_mode = getattr(config, "DEBUG", False)
    engine = create_engine(config.database_url, echo=debug_mode)

    try:
        # 残りのコードは変更なし
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'users'
                """
                )
            )

            if not result.fetchone():
                print("テーブルが存在しないため、作成します...")
                Base.metadata.create_all(engine)

                # デフォルトユーザーを作成
                with Session(engine) as session:
                    existing_user = session.query(User).first()
                    if not existing_user:
                        default_user = User(
                            id=uuid.uuid4(),
                            name=config.DEFAULT_USER_NAME,
                            email=config.DEFAULT_USER_EMAIL,
                            password=config.DEFAULT_USER_PASSWORD,  # 本番では要ハッシュ化
                        )
                        session.add(default_user)
                        session.commit()
                        print(
                            f"デフォルトユーザーを作成しました: {default_user.name}"
                        )
            else:
                print("既存のテーブルを使用します")

    except Exception as e:
        print(f"データベース初期化エラー: {e}")
        # 初期化に失敗した場合でもテーブルを作成
        Base.metadata.create_all(engine)


if __name__ == "__main__":
    main()
