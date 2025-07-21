from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Text, Uuid, ForeignKey, DateTime
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo


# Base クラスに DeclarativeBase を継承してクラスとテーブルを自動で結び付ける
class Base(DeclarativeBase):
    pass


# users テーブルの定義（ログイン機能）
# ユーザーID、ユーザー名、メールアドレス、パスワード, 登録日
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
    post: Mapped[list["Post"]] = relationship(back_populates="user")


# categories テーブルの定義（カテゴリ管理機能）
# カテゴリID、カテゴリ名
class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=True,
    )
    post: Mapped[list["Post"]] = relationship(back_populates="category")


# posts テーブルの定義(記事投稿機能)
# 記事ID、記事タイトル、記事内容、完了状態, ユーザーID、カテゴリID
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )
    completed: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
    )
    user: Mapped["User"] = relationship(back_populates="post")
    category: Mapped["Category"] = relationship(back_populates="post")
