FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Pythonの依存関係をコピーしてインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# 環境変数を設定
ENV FLASK_APP=flaskr/main.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# ポートを公開
EXPOSE 5000

# アプリケーションを起動
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]