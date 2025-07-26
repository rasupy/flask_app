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
        posts = session.query(Post).options(selectinload(Post.category)).all()

        # 全投稿 → カテゴリーごとに分類
        category_posts = {}
        for post in posts:
            cid = str(post.category_id)
            category_posts.setdefault(cid, []).append(
                {
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "category_id": post.category_id,
                    "category_name": (
                        post.category.name if post.category else ""
                    ),
                }
            )

    return render_template(
        "admin.html",
        posts=[],  # 最初は空表示
        categories=categories,
        selected_category_id=category_id,
        category_posts=category_posts,
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


# タスクの編集処理
@app.route("/admin/edit_task/<task_id>", methods=["POST"])
def edit_task(task_id):
    title = request.form["title"]
    content = request.form["content"]
    category_id = request.form["category_id"]

    with SessionLocal() as session:
        post = session.query(Post).filter_by(id=task_id).first()
        if not post:
            return "Task not found", 404

        post.title = title
        post.content = content
        post.category_id = category_id
        session.commit()

    return redirect(url_for("admin"))


# タスクの削除処理
@app.route("/admin/delete_task/<task_id>", methods=["POST"])
def delete_task(task_id):
    with SessionLocal() as session:
        post = session.query(Post).filter_by(id=task_id).first()
        if not post:
            return "Task not found", 404

        session.delete(post)
        session.commit()
    return "", 204  # 成功時は No Content を返す


@app.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


if __name__ == "__main__":
    app.run(debug=True)
