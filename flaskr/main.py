from flask import Flask, render_template, request, redirect, url_for
from flaskr.db import SessionLocal
from flaskr.models import Post, Category, User
from sqlalchemy.orm import selectinload
import uuid
import os

template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)


@app.route("/admin")
def admin():
    with SessionLocal() as session:
        posts = session.query(Post).options(selectinload(Post.category)).all()

        # カテゴリごとに投稿をグループ化
        category_map = {}

        for post in posts:
            category_name = post.category.name if post.category else "未分類"
            category_map.setdefault(category_name, []).append(post)

    return render_template("admin.html", category_map=category_map)


@app.route("/create", methods=["GET", "POST"])
def create():
    with SessionLocal() as session:
        if request.method == "POST":
            title = request.form["post_title"]
            content = request.form["post_content"]
            category_name = request.form["post_category"]

            category = Category(name=category_name)
            category = (
                session.query(Category).filter_by(name=category_name).first()
            )

            if not category:
                category = Category(id=uuid.uuid4(), name=category_name)
                session.add(category)
                session.commit()

            # サーバー側でバリデーション
            # content（本文）は必須ではありません
            if not title or not category_name:
                categories = session.query(Category).all()
                error = "タイトルとカテゴリーは必須です"
                return render_template(
                    "create.html", categories=categories, error=error
                )

            # 投稿を作成
            # 仮のユーザーを取得（ログイン機能があればセッションから）
            user = session.query(User).first()

            new_post = Post(
                id=uuid.uuid4(),
                title=title,
                content=content,
                category_id=category.id,
                user_id=user.id,  # 仮のユーザーIDを指定,
                completed=False,
            )
            session.add(new_post)
            session.commit()

            return redirect(url_for("admin"))  # 投稿後、adminページへ

        # GET時：カテゴリ一覧を取得してフォームに渡す
        categories = session.query(Category).all()
    return render_template("create.html", categories=categories)


@app.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


if __name__ == "__main__":
    app.run(debug=True)
