# ==========================================================
# データベースの接続用
# ==========================================================
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
dbname = os.getenv("DB_NAME")

db_url = f"postgresql+psycopg2://{user}:{password}@{host}/{dbname}"

engine = create_engine(db_url, echo=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
