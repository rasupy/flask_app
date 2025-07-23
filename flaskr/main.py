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
    category_id = request.args.get("category_id")  # ← URLパラメータ取得
    with SessionLocal() as session:
        categories = {str(c.id): c.name for c in session.query(Category).all()}

        if category_id:
            # 指定されたカテゴリの投稿だけ取得
            posts = (
                session.query(Post)
                .filter(Post.category_id == category_id)
                .options(selectinload(Post.category))
                .all()
            )
        else:
            # 全ての投稿を取得
            posts = (
                session.query(Post).options(selectinload(Post.category)).all()
            )

    return render_template(
        "admin.html",
        categories=categories,
        posts=posts,
        selected_category_id=category_id,
    )


@app.route("/admin/create", methods=["POST"])
def create_post():
    title = request.form["title"]
    content = request.form["content"]
    category_name = request.form["category_name"]

    with SessionLocal() as session:
        # カテゴリがすでに存在するかチェック
        category = (
            session.query(Category).filter_by(name=category_name).first()
        )
        if not category:
            category = Category(id=uuid.uuid4(), name=category_name)
            session.add(category)
            session.flush()  # category.id を得るため

        # 仮のユーザーを取得（ログイン機能があればセッションから）
        user = session.query(User).first()

        new_post = Post(
            id=uuid.uuid4(),
            title=title,
            content=content,
            category_id=category.id,
            user_id=user.id,
            completed=False,
        )
        session.add(new_post)
        session.commit()
    return redirect(url_for("admin"))


@app.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


if __name__ == "__main__":
    app.run(debug=True)
