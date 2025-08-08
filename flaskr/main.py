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

        # 全タスクを取得
        all_posts = (
            session.query(Post)
            .options(selectinload(Post.user), selectinload(Post.category))
            .order_by(Post.sort_order)
            .all()
        )

        # カテゴリ別にタスクを分類（TODOのみ、カテゴリー切り替え用）
        category_posts = {}
        for post in all_posts:
            if post.status == "todo":  # TODOのみをカテゴリー別に分類
                category_key = str(post.category_id)
                if category_key not in category_posts:
                    category_posts[category_key] = []
                category_posts[category_key].append(post_to_dict(post))

        # ステータス別にタスクを分類（全ステータスを含む）
        posts_by_status = {
            "todo": [
                post_to_dict(post)
                for post in all_posts
                if post.status == "todo"
            ],
            "progress": [
                post_to_dict(post)
                for post in all_posts
                if post.status == "progress"
            ],
            "archive": [
                post_to_dict(post)
                for post in all_posts
                if post.status == "archive"
            ],
        }

        # デバッグログ
        print(f"Categories: {len(categories)}")
        print(f"TODO tasks: {len(posts_by_status['todo'])}")
        print(f"Progress tasks: {len(posts_by_status['progress'])}")
        print(f"Archive tasks: {len(posts_by_status['archive'])}")

        # 最初のカテゴリーIDを取得（初期選択用）
        first_category_id = list(categories.keys())[0] if categories else None

    return render_template(
        "admin.html",
        categories=categories,
        category_posts=category_posts,  # カテゴリー切り替え用（TODOのみ）
        posts_by_status=posts_by_status,  # ステータス別表示用（全ステータス）
        first_category_id=first_category_id,  # 初期選択カテゴリー
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


@app.route("/admin/delete_category/<category_id>", methods=["POST", "DELETE"])
def delete_category(category_id):
    """カテゴリーとそのタスクを削除"""
    try:
        # UUIDの変換
        try:
            category_uuid = uuid.UUID(category_id)
        except ValueError:
            return jsonify({"error": "無効なカテゴリーID"}), 400

        print(f"Delete category request: {category_uuid}")

        # データベース処理
        with SessionLocal() as session:
            # カテゴリーの存在確認
            category = (
                session.query(Category).filter_by(id=category_uuid).first()
            )
            if not category:
                return jsonify({"error": "カテゴリーが見つかりません"}), 404

            category_name = category.name

            # カテゴリーに属するタスクを全て削除
            posts_to_delete = (
                session.query(Post)
                .filter_by(category_id=str(category_uuid))
                .all()
            )
            deleted_task_count = len(posts_to_delete)

            for post in posts_to_delete:
                session.delete(post)
                print(f"Deleting task: {post.id} - {post.title}")

            # カテゴリーを削除
            session.delete(category)
            session.commit()

            print(
                f"Category deleted: {category_uuid} - {category_name} (with {deleted_task_count} tasks)"
            )

            return jsonify(
                {
                    "success": True,
                    "id": str(category_uuid),
                    "name": category_name,
                    "deleted_tasks": deleted_task_count,
                    "message": f"カテゴリー '{category_name}' と関連タスク {deleted_task_count}件を削除しました",
                }
            )

    except Exception as e:
        print(f"Delete category error: {e}")
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


@app.route("/update_task_order", methods=["POST"])
def update_task_order():
    try:
        data = request.get_json()
        if not data or "tasks" not in data:
            return jsonify({"error": "Invalid data format"}), 400

        tasks = data["tasks"]
        if not isinstance(tasks, list):
            return jsonify({"error": "Tasks must be a list"}), 400

        session = SessionLocal()
        try:
            for task_data in tasks:
                # 必要なフィールドの確認
                if not all(
                    key in task_data
                    for key in ["id", "category_id", "sort_order"]
                ):
                    return (
                        jsonify(
                            {"error": "Missing required fields in task data"}
                        ),
                        400,
                    )

                # タスクの更新
                task = (
                    session.query(Post)
                    .filter(Post.id == task_data["id"])
                    .first()
                )
                if task:
                    task.category_id = task_data["category_id"]
                    task.sort_order = task_data.get("sort_order", 0)

            session.commit()
            return jsonify({"success": True, "updated_count": len(tasks)})

        except Exception as e:
            session.rollback()
            print(f"Database error: {e}")
            return jsonify({"error": "Database update failed"}), 500
        finally:
            session.close()

    except Exception as e:
        print(f"Update task order error: {e}")
        return jsonify({"error": "Internal server error"}), 500


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
        # UUIDの変換
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return jsonify({"error": "無効なタスクID"}), 400

        # リクエストデータの取得
        if request.is_json:
            data = request.get_json()
            title = data.get("title")
            content = data.get("content")
            category_id = data.get("category_id")
        else:
            title = request.form.get("title")
            content = request.form.get("content")
            category_id = request.form.get("category_id")

        print(
            f"Edit task data: title={title}, content={content}, category_id={category_id}"
        )

        # 入力検証
        if not title or not category_id:
            return jsonify({"error": "タイトルとカテゴリーは必須です"}), 400

        # カテゴリーIDの変換
        try:
            category_uuid = uuid.UUID(category_id)
        except ValueError:
            return jsonify({"error": "無効なカテゴリーID"}), 400

        # データベース処理
        with SessionLocal() as session:
            # タスクを取得
            post = session.query(Post).filter_by(id=task_uuid).first()
            if not post:
                return jsonify({"error": "タスクが見つかりません"}), 404

            # カテゴリーの存在確認
            category = (
                session.query(Category).filter_by(id=category_uuid).first()
            )
            if not category:
                return jsonify({"error": "カテゴリーが見つかりません"}), 404

            # タスクを更新
            post.title = title
            post.content = content if content else ""
            post.category_id = str(category_uuid)

            session.commit()

            print(f"Task updated: {post.id} - {post.title} - {post.content}")

            return jsonify(
                {
                    "success": True,
                    "id": str(post.id),
                    "title": post.title,
                    "content": post.content,
                    "category_id": str(post.category_id),
                    "message": "タスクが正常に更新されました",
                }
            )

    except Exception as e:
        print(f"Edit task error: {e}")
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


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


@app.route("/update_task_status/<task_id>", methods=["POST"])
def update_task_status(task_id):
    """タスクのステータスを更新"""
    try:
        # UUIDの変換を試行
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            print(f"Invalid task ID format: {task_id}")
            return jsonify({"error": "無効なタスクID"}), 400

        # リクエストの検証
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({"error": "JSON形式のリクエストが必要です"}), 400

        data = request.get_json()
        print(f"Received data: {data}")

        new_status = data.get("status")
        print(f"New status: {new_status}")

        # ステータスの妥当性チェック
        valid_statuses = ["todo", "progress", "archive"]
        if new_status not in valid_statuses:
            print(f"Invalid status: {new_status}")
            return jsonify({"error": f"無効なステータス: {new_status}"}), 400

        # データベース処理
        session = SessionLocal()
        try:
            post = session.query(Post).filter_by(id=task_uuid).first()
            print(f"Found post: {post}")

            if not post:
                print(f"Post not found for ID: {task_uuid}")
                return jsonify({"error": "タスクが見つかりません"}), 404

            # ステータス更新前の値をログ
            print(f"Current status: {post.status} -> New status: {new_status}")

            post.status = new_status
            session.commit()

            # 更新後の確認
            session.refresh(post)
            print(f"Updated status in DB: {post.status}")

            return jsonify(
                {
                    "success": True,
                    "id": str(post.id),
                    "status": post.status,
                    "title": post.title,
                    "message": f"タスクのステータスを{new_status}に更新しました",
                }
            )

        except Exception as db_error:
            session.rollback()
            print(f"Database error: {db_error}")
            return (
                jsonify({"error": f"データベースエラー: {str(db_error)}"}),
                500,
            )

        finally:
            session.close()

    except Exception as e:
        print(f"General error in update_task_status: {e}")
        return jsonify({"error": f"サーバーエラー: {str(e)}"}), 500


@app.route("/update_task_order_by_status", methods=["POST"])
def update_task_order_by_status():
    """同一ステータス内でのタスク順序を更新"""
    try:
        data = request.get_json()
        if not data or "tasks" not in data:
            return jsonify({"error": "Invalid data format"}), 400

        tasks = data["tasks"]
        if not isinstance(tasks, list):
            return jsonify({"error": "Tasks must be a list"}), 400

        with SessionLocal() as session:
            for task_data in tasks:
                if not all(
                    key in task_data for key in ["id", "status", "sort_order"]
                ):
                    return (
                        jsonify(
                            {"error": "Missing required fields in task data"}
                        ),
                        400,
                    )

                try:
                    task_uuid = uuid.UUID(task_data["id"])
                except ValueError:
                    return (
                        jsonify(
                            {"error": f"Invalid task ID: {task_data['id']}"}
                        ),
                        400,
                    )

                # タスクの更新
                task = session.query(Post).filter(Post.id == task_uuid).first()
                if task:
                    task.sort_order = task_data.get("sort_order", 0)
                    # ステータスも更新（念のため）
                    if task.status == task_data["status"]:
                        task.status = task_data["status"]

            session.commit()
            return jsonify({"success": True, "updated_count": len(tasks)})

    except Exception as e:
        print(f"Update task order by status error: {e}")
        return jsonify({"error": "Internal server error"}), 500


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
