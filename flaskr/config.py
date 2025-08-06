# flaskr/config.py
import os
from dotenv import load_dotenv


class Config:
    """基本設定クラス"""

    def __init__(self):
        # Dockerコンテナ内では.envを読まない
        if not os.getenv("DOCKER_ENV"):
            load_dotenv()

    # データベース設定
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_NAME = os.getenv("DB_NAME", "todo_db")

    # アプリケーション設定
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"

    # ダミーユーザー設定
    DEFAULT_USER_NAME = os.getenv("DEFAULT_USER_NAME", "デフォルトユーザー")
    DEFAULT_USER_EMAIL = os.getenv("DEFAULT_USER_EMAIL", "default@example.com")
    DEFAULT_USER_PASSWORD = os.getenv(
        "DEFAULT_USER_PASSWORD", "secure_password_123"
    )

    @property
    def database_url(self):
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"


class DevelopmentConfig(Config):
    """開発環境設定"""

    DEBUG = True
    FLASK_ENV = "development"


class ProductionConfig(Config):
    """本番環境設定"""

    DEBUG = False
    FLASK_ENV = "production"

    def __init__(self):
        super().__init__()
        # 本番環境では必須環境変数をチェック
        required_vars = ["DB_USER", "DB_PASSWORD", "SECRET_KEY"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(
                f"本番環境で必須の環境変数が設定されていません: {missing_vars}"
            )


class DockerConfig(Config):
    """Docker環境設定"""

    def __init__(self):
        super().__init__()
        self.DB_HOST = "db"  # Docker Composeのサービス名
        self.FLASK_ENV = "development"
        self.DEBUG = True  # Docker環境ではデバッグモードを有効


def get_config():
    """環境に応じた設定を取得"""
    env = os.getenv("FLASK_ENV", "development")

    if os.getenv("DOCKER_ENV"):
        return DockerConfig()
    elif env == "production":
        return ProductionConfig()
    else:
        return DevelopmentConfig()
