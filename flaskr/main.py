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
    category_id = request.args.get("category_id")
    with SessionLocal() as session:
        categories = {str(c.id): c.name for c in session.query(Category).all()}

        if category_id:
            posts = (
                session.query(Post)
                .filter(Post.category_id == category_id)
                .options(selectinload(Post.category))
                .all()
            )
        else:
            posts = (
                session.query(Post).options(selectinload(Post.category)).all()
            )

    return render_template(
        "admin.html",
        posts=posts,
        categories=categories,
        selected_category_id=category_id,
    )


# カテゴリの追加処理
@app.route("/admin/add_category", methods=["POST"])
def add_category():
    category_name = request.form["category_name"]
    with SessionLocal() as session:
        new_category = Category(name=category_name)
        session.add(new_category)
        session.commit()
    return redirect(url_for("admin"))


# タスクの追加処理
@app.route("/admin/add_task", methods=["POST"])
def add_task():
    title = request.form["title"]
    content = request.form["content"]
    category_id = request.form["category_id"]

    with SessionLocal() as session:

        # 仮のユーザーを取得（ログイン機能があればセッションから）
        user = session.query(User).first()
        if not user:
            # ユーザーが存在しない場合はエラーを返すか、適切な処理を行う
            return "No user found. Please register a user first.", 400

        new_post = Post(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            category_id=category_id,
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
