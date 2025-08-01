from flask import Flask, render_template, request, redirect, url_for, jsonify
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
        # カテゴリの取得を並び順にソート
        categories = {
            str(c.id): c.name
            for c in session.query(Category)
            .order_by(Category.sort_order)
            .all()
        }
        posts = session.query(Post).options(selectinload(Post.category)).all()

        # 未選択なら最初のカテゴリをデフォルトに
        if not category_id and categories:
            category_id = next(iter(categories))  # 最初のキー

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
        posts=[],
        categories=categories,
        category_id=None,
        selected_category_id=None,
        category_posts=category_posts,
    )


# カテゴリーの並べ替え
@app.route("/update_category_order", methods=["POST"])
def update_category_order():
    data = request.get_json()

    if not data or "category_ids" not in data:
        return jsonify({"error": "No category_ids provided"}), 400

    try:
        with SessionLocal() as session:
            for index, category_id_str in enumerate(data["category_ids"]):
                try:
                    category_id = uuid.UUID(category_id_str)
                    category = session.get(Category, category_id)

                    if category:
                        category.sort_order = index

                except ValueError:

                    return (
                        jsonify({"error": f"Invalid UUID: {category_id_str}"}),
                        400,
                    )

            session.commit()
        return jsonify({"message": "Category order updated"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# カテゴリの追加処理
@app.route("/admin/add_category", methods=["POST"])
def add_category():
    category_name = request.form["category_name"]

    with SessionLocal() as session:
        new_category = Category(name=category_name)
        session.add(new_category)
        session.commit()

    return redirect(url_for("admin"))


# カテゴリの削除処理
@app.route("/admin/delete_category/<category_id>", methods=["POST"])
def delete_category(category_id):
    with SessionLocal() as session:
        category = session.query(Category).filter_by(id=category_id).first()

        if not category:
            return "カテゴリが見つかりません", 404

        # 関連するタスクも削除
        session.query(Post).filter_by(category_id=category_id).delete()
        session.delete(category)
        session.commit()

    return "", 204


# タスクの並び替え、移動処理
@app.route("/update_task_order", methods=["POST"])
def update_task_order():
    data = request.get_json()
    # print("受け取ったデータ:", data)  # デバッグ用

    if "posts" not in data:
        return jsonify({"error": "No posts data provided"}), 400

    with SessionLocal() as session:
        for post_data in data["posts"]:
            post_id = uuid.UUID(post_data["id"])
            post = session.get(Post, post_id)

            if post:
                post.sort_order = post_data["sort_order"]
                post.status = post_data["status"]

        session.commit()
        return jsonify({"message": "Posts updated"})


# タスクの追加処理
# ------------------------------------------------------------
@app.route("/add_task", methods=["POST"])
def add_task():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    print("受け取ったデータ:", data)  # デバッグ用

    title = data.get("title")
    content = data.get("content")
    category_id = data.get("category_id")

    # 仮のユーザーID、実際はログインユーザーのIDを使用する
    user_id = "6b3ad4bf-5b9a-4946-be4f-77aa04d40d8e"

    if not title or not category_id or not user_id:
        return (
            jsonify({"error": "タイトル、カテゴリID、ユーザーIDは必須です"}),
            400,
        )

    with SessionLocal() as session:
        new_post = Post(
            title=title,
            content=content,
            category_id=category_id,
            user_id=user_id,  # ログインユーザーのIDを使用
        )
        session.add(new_post)
        session.commit()

        return (
            jsonify(
                {
                    "id": str(new_post.id),
                    "title": new_post.title,
                    "content": new_post.content,
                    "category_id": str(new_post.category_id),
                    # "status": new_post.status,
                }
            ),
            200,
        )


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
