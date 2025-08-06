from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    Text,
    Uuid,
    ForeignKey,
    DateTime,
    Integer,
    String,
)
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid


class Base(DeclarativeBase):
    """SQLAlchemy ORM のベースクラス"""

    pass


class User(Base):
    """ユーザー情報を管理するテーブル"""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
    )

    # 関連テーブルとのリレーション
    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    posts = relationship(
        "Post", back_populates="user", cascade="all, delete-orphan"
    )


class Category(Base):
    """カテゴリー情報を管理するテーブル"""

    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
    )

    # 関連テーブルとのリレーション
    user = relationship("User", back_populates="categories")
    posts = relationship(
        "Post", back_populates="category", cascade="all, delete-orphan"
    )


class Post(Base):
    """タスク（投稿）情報を管理するテーブル"""

    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="todo")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
        onupdate=lambda: datetime.now(ZoneInfo("Asia/Tokyo")),
    )

    # 関連テーブルとのリレーション
    user = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
