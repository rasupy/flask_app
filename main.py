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