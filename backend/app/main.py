from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.api import auth_router, entries_router, analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("🚀 Database tables created")
    yield
    # Shutdown
    print("👋 Application shutting down")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Yaşam Günlüğü API
    
    Video günlüklerinizi kaydedin, analiz edin ve geçmişinizi keşfedin.
    
    ### Özellikler
    
    - 🎥 Video ile günlük kaydı
    - 🎤 Sesten metne çevirme (Whisper STT)
    - 🧠 AI ile özet ve otomatik etiketleme
    - 📊 Duygu analizi ve istatistikler
    - 📅 Takvim görünümü
    - 🔒 Güvenli kimlik doğrulama
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(entries_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }
