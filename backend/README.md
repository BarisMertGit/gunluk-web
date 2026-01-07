# Yaşam Günlüğü - Backend

FastAPI backend for the Life Journal Dashboard application.

## Features

- Video journal entry management
- Speech-to-Text transcription with OpenAI Whisper
- AI-powered summarization and auto-tagging
- User authentication with JWT
- PostgreSQL database with SQLAlchemy ORM
- MinIO/S3 compatible storage for videos

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gunluk
SECRET_KEY=your-secret-key
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=gunluk-videos
```
