from flask import Flask, render_template, request, redirect, url_for, jsonify
from flaskr.db import SessionLocal
from flaskr.models import Post, Category, User
from flaskr.config import get_config
from sqlalchemy.orm import selectinload
import uuid
import os

# アプリケーション設定
config = get_config()
template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
app.config["SECRET_KEY"] = config.SECRET_KEY


def post_to_dict(post):
    """PostオブジェクトをJSON形式の辞書に変換"""
    return {
        "id": str(post.id),
        "title": post.title,
        "content": post.content,
        "status": post.status,
        "category_id": str(post.category_id),
        "sort_order": post.sort_order,
        "user_id": str(post.user_id),
        "category_name": post.category.name if post.category else None,
        "user_name": post.user.name if post.user else None,
    }


def get_or_create_default_user(session):
    """デフォルトユーザーを取得または作成"""
    user = session.query(User).first()
    if not user:
        user = User(
            name=config.DEFAULT_USER_NAME,
            email=config.DEFAULT_USER_EMAIL,
            password=config.DEFAULT_USER_PASSWORD,
        )
        session.add(user)
        session.commit()
    return user


@app.route("/admin")
def admin():
    """管理画面のメインページ"""
    category_id = request.args.get("category_id")

    with SessionLocal() as session:
        # カテゴリ一覧を取得
        categories_list = (
            session.query(Category)
            .options(selectinload(Category.user))
            .order_by(Category.sort_order)
            .all()
        )

        categories = {str(cat.id): cat.name for cat in categories_list}

        # タスク一覧を取得
        posts = {}
        if category_id:
            # 特定カテゴリのタスクのみ取得
            posts_in_category = (
                session.query(Post)
                .filter(Post.category_id == category_id)
                .options(selectinload(Post.user), selectinload(Post.category))
                .order_by(Post.sort_order)
                .all()
            )
            posts[category_id] = [
                post_to_dict(post) for post in posts_in_category
            ]
        else:
            # 全カテゴリのタスクを取得
            all_posts = (
                session.query(Post)
                .options(selectinload(Post.user), selectinload(Post.category))
                .order_by(Post.sort_order)
                .all()
            )

            # カテゴリ別にタスクを分類
            for post in all_posts:
                category_key = str(post.category_id)
                if category_key not in posts:
                    posts[category_key] = []
                posts[category_key].append(post_to_dict(post))

    return render_template(
        "admin.html",
        categories=categories,
        category_posts=posts,
    )


@app.route("/update_category_order", methods=["POST"])
def update_category_order():
    """カテゴリの並び順を更新"""
    data = request.get_json()

    if not data or "category_ids" not in data:
        return jsonify({"error": "カテゴリIDが提供されていません"}), 400

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
                        jsonify({"error": f"無効なUUID: {category_id_str}"}),
                        400,
                    )

            session.commit()
        return jsonify({"message": "カテゴリの並び順を更新しました"})

    except Exception as e:
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


@app.route("/admin/add_category", methods=["POST"])
def add_category():
    """新しいカテゴリを追加"""
    category_name = request.form.get("category_name", "").strip()

    if not category_name:
        return redirect(url_for("admin"))

    with SessionLocal() as session:
        user = get_or_create_default_user(session)

        # 新しいカテゴリを作成
        new_category = Category(
            name=category_name, user_id=user.id, sort_order=0
        )
        session.add(new_category)
        session.commit()

    return redirect(url_for("admin"))


@app.route("/admin/delete_category/<category_id>", methods=["POST"])
def delete_category(category_id):
    """カテゴリを削除（関連タスクも削除）"""
    try:
        category_uuid = uuid.UUID(category_id)
    except ValueError:
        return jsonify({"error": "無効なカテゴリID"}), 400

    with SessionLocal() as session:
        category = session.query(Category).filter_by(id=category_uuid).first()

        if not category:
            return jsonify({"error": "カテゴリが見つかりません"}), 404

        # 関連するタスクも削除（CASCADE設定により自動削除されるが明示的に実行）
        session.query(Post).filter_by(category_id=category_uuid).delete()
        session.delete(category)
        session.commit()

    return "", 204


@app.route("/update_task_order", methods=["POST"])
def update_task_order():
    """タスクの並び順とステータスを更新"""
    data = request.get_json()

    if not data or "posts" not in data:
        return jsonify({"error": "タスクデータが提供されていません"}), 400

    try:
        with SessionLocal() as session:
            for post_data in data["posts"]:
                try:
                    post_id = uuid.UUID(post_data["id"])
                    post = session.get(Post, post_id)

                    if post:
                        post.sort_order = post_data.get(
                            "sort_order", post.sort_order
                        )
                        post.status = post_data.get("status", post.status)

                except (ValueError, KeyError) as e:
                    return (
                        jsonify({"error": f"無効なタスクデータ: {str(e)}"}),
                        400,
                    )

            session.commit()
            return jsonify({"message": "タスクを更新しました"})

    except Exception as e:
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


@app.route("/add_task", methods=["POST"])
def add_task():
    """新しいタスクを追加"""
    if not request.is_json:
        return jsonify({"error": "JSON形式のリクエストが必要です"}), 400

    data = request.get_json()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category_id = data.get("category_id")

    if not title or not category_id:
        return jsonify({"error": "タイトルとカテゴリIDは必須です"}), 400

    try:
        category_uuid = uuid.UUID(category_id)
    except ValueError:
        return jsonify({"error": "無効なカテゴリID"}), 400

    try:
        with SessionLocal() as session:
            user = get_or_create_default_user(session)

            # カテゴリの存在確認
            category = session.get(Category, category_uuid)
            if not category:
                return (
                    jsonify({"error": "指定されたカテゴリが見つかりません"}),
                    404,
                )

            new_post = Post(
                title=title,
                content=content,
                category_id=category_uuid,
                user_id=user.id,
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
                        "message": "タスクを追加しました",
                    }
                ),
                201,
            )

    except Exception as e:
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


@app.route("/admin/edit_task/<task_id>", methods=["POST"])
def edit_task(task_id):
    """タスクを編集"""
    try:
        task_uuid = uuid.UUID(task_id)
    except ValueError:
        return jsonify({"error": "無効なタスクID"}), 400

    title = request.form.get("title", "").strip()
    content = request.form.get("content", "").strip()
    category_id = request.form.get("category_id")

    if not title:
        return jsonify({"error": "タイトルは必須です"}), 400

    try:
        category_uuid = uuid.UUID(category_id) if category_id else None
    except ValueError:
        return jsonify({"error": "無効なカテゴリID"}), 400

    with SessionLocal() as session:
        post = session.query(Post).filter_by(id=task_uuid).first()

        if not post:
            return jsonify({"error": "タスクが見つかりません"}), 404

        # カテゴリの存在確認
        if category_uuid:
            category = session.get(Category, category_uuid)
            if not category:
                return (
                    jsonify({"error": "指定されたカテゴリが見つかりません"}),
                    404,
                )

        post.title = title
        post.content = content
        if category_uuid:
            post.category_id = category_uuid
        session.commit()

    return redirect(url_for("admin"))


@app.route("/admin/delete_task/<task_id>", methods=["POST"])
def delete_task(task_id):
    """タスクを削除"""
    try:
        task_uuid = uuid.UUID(task_id)
    except ValueError:
        return jsonify({"error": "無効なタスクID"}), 400

    with SessionLocal() as session:
        post = session.query(Post).filter_by(id=task_uuid).first()

        if not post:
            return jsonify({"error": "タスクが見つかりません"}), 404

        session.delete(post)
        session.commit()

    return "", 204


@app.route("/register", methods=["GET", "POST"])
def register():
    """ユーザー登録画面（将来実装予定）"""
    return render_template("register.html")


# セキュリティ設定
@app.after_request
def after_request(response):
    """セキュリティヘッダーを追加"""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


if __name__ == "__main__":
    # 本番環境ではdebug=Falseにする
    app.run(debug=config.DEBUG if hasattr(config, "DEBUG") else False)
