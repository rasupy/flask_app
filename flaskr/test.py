from flaskr.db import SessionLocal
from flaskr.models import User
import uuid

with SessionLocal() as session:
    dummy_user = User(
        id=uuid.uuid4(),
        name="テストユーザー",
        email="test@example.com",
        password="dummy_password",  # 本来はハッシュ化したパスワードにする
    )
    session.add(dummy_user)
    session.commit()
    print("ダミーユーザーを追加しました:", dummy_user)
