# ==========================================================
# データベースの接続用
# ==========================================================
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import get_config

# 設定を取得
config = get_config()

# データベース接続エンジンを作成
engine = create_engine(config.database_url, echo=config.DEBUG)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
