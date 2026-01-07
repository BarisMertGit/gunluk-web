from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List
import uuid

from app.database import get_db
from app.models.entry import Entry, MoodType
from app.models.user import User
from app.schemas.entry import EntryCreate, EntryUpdate, EntryResponse, EntryList
from app.utils.security import get_current_active_user
from app.services.storage import StorageService
from app.services.video import VideoProcessor
from app.services.stt import SpeechToText
from app.services.ai import AIService

router = APIRouter(prefix="/entries", tags=["Günlük Kayıtları"])


@router.post("/", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    entry_data: EntryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Yeni günlük kaydı oluştur (video olmadan).
    Video yüklemek için /entries/upload endpoint'ini kullanın.
    """
    entry = Entry(
        user_id=current_user.id,
        title=entry_data.title,
        note=entry_data.note,
        mood=entry_data.mood,
        mood_intensity=entry_data.mood_intensity,
        manual_tags=entry_data.manual_tags,
        is_private=entry_data.is_private,
        location=entry_data.location,
        weather=entry_data.weather,
        recorded_at=entry_data.recorded_at or datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    return entry


@router.post("/upload", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
async def upload_video_entry(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    title: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    mood: Optional[str] = Form(None),
    mood_intensity: Optional[int] = Form(5),
    manual_tags: Optional[str] = Form("[]"),  # JSON string
    is_private: bool = Form(True),
    location: Optional[str] = Form(None),
    weather: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Video ile birlikte yeni günlük kaydı oluştur.
    
    Video yüklendikten sonra arka planda:
    - Video sıkıştırılır
    - Thumbnail oluşturulur
    - Sesten metne çevrilir (STT)
    - AI ile özet ve etiketler oluşturulur
    """
    if not video.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz dosya türü. Sadece video dosyaları kabul edilir."
        )
    
    # Generate unique key for storage
    file_ext = video.filename.split(".")[-1] if "." in video.filename else "webm"
    video_key = f"entries/{current_user.id}/{uuid.uuid4()}.{file_ext}"
    
    # Upload video to storage
    storage = StorageService()
    video_content = await video.read()
    video_url = await storage.upload_file(video_key, video_content, video.content_type)
    
    # Parse mood
    mood_enum = None
    if mood:
        try:
            mood_enum = MoodType(mood)
        except ValueError:
            pass
    
    # Parse tags
    import json
    try:
        tags = json.loads(manual_tags) if manual_tags else []
    except json.JSONDecodeError:
        tags = []
    
    # Create entry
    entry = Entry(
        user_id=current_user.id,
        video_url=video_url,
        video_key=video_key,
        file_size_bytes=len(video_content),
        mime_type=video.content_type,
        title=title,
        note=note,
        mood=mood_enum,
        mood_intensity=mood_intensity,
        manual_tags=tags,
        is_private=is_private,
        location=location,
        weather=weather,
        recorded_at=datetime.utcnow(),
        is_processed=False
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    # Process video in background
    background_tasks.add_task(process_video_entry, entry.id, video_key, db)
    
    return entry


async def process_video_entry(entry_id: int, video_key: str, db: Session):
    """Background task to process video entry."""
    try:
        entry = db.query(Entry).filter(Entry.id == entry_id).first()
        if not entry:
            return
        
        storage = StorageService()
        video_processor = VideoProcessor()
        stt = SpeechToText()
        ai_service = AIService()
        
        # Download video for processing
        video_path = await storage.download_to_temp(video_key)
        
        # Generate thumbnail
        thumbnail_path = await video_processor.generate_thumbnail(video_path)
        thumbnail_key = f"thumbnails/{entry.user_id}/{uuid.uuid4()}.jpg"
        with open(thumbnail_path, "rb") as f:
            entry.thumbnail_url = await storage.upload_file(thumbnail_key, f.read(), "image/jpeg")
        
        # Get video duration
        entry.duration_seconds = await video_processor.get_duration(video_path)
        
        # Extract audio and transcribe
        audio_path = await video_processor.extract_audio(video_path)
        transcript_result = await stt.transcribe(audio_path)
        entry.transcript = transcript_result.get("text", "")
        
        # AI processing (if transcript exists)
        if entry.transcript:
            entry.summary = await ai_service.summarize(entry.transcript)
            entry.auto_tags = await ai_service.auto_tag(entry.transcript)
            entry.sentiment_score = await ai_service.analyze_sentiment(entry.transcript)
        
        entry.is_processed = True
        entry.updated_at = datetime.utcnow()
        db.commit()
        
        # Cleanup temp files
        import os
        for path in [video_path, thumbnail_path, audio_path]:
            if path and os.path.exists(path):
                os.remove(path)
                
    except Exception as e:
        print(f"Error processing entry {entry_id}: {e}")
        # Mark as processed even on error to avoid retry loops
        entry = db.query(Entry).filter(Entry.id == entry_id).first()
        if entry:
            entry.is_processed = True
            db.commit()


@router.get("/", response_model=EntryList)
async def list_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    mood: Optional[str] = None,
    tag: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    favorites_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcının günlük kayıtlarını listele.
    
    - Sayfalama desteklenir
    - Ruh haline, etiketlere ve tarihe göre filtreleme yapılabilir
    """
    query = db.query(Entry).filter(Entry.user_id == current_user.id)
    
    # Apply filters
    if mood:
        try:
            query = query.filter(Entry.mood == MoodType(mood))
        except ValueError:
            pass
    
    if tag:
        query = query.filter(
            Entry.manual_tags.contains([tag]) | Entry.auto_tags.contains([tag])
        )
    
    if start_date:
        query = query.filter(Entry.recorded_at >= start_date)
    
    if end_date:
        query = query.filter(Entry.recorded_at <= end_date)
    
    if favorites_only:
        query = query.filter(Entry.is_favorite == True)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    entries = query.order_by(desc(Entry.recorded_at)).offset((page - 1) * page_size).limit(page_size).all()
    
    return EntryList(
        items=entries,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total
    )


@router.get("/{entry_id}", response_model=EntryResponse)
async def get_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Belirli bir günlük kaydını getir."""
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kayıt bulunamadı"
        )
    
    return entry


@router.put("/{entry_id}", response_model=EntryResponse)
async def update_entry(
    entry_id: int,
    entry_data: EntryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Günlük kaydını güncelle."""
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kayıt bulunamadı"
        )
    
    update_data = entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Günlük kaydını sil."""
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kayıt bulunamadı"
        )
    
    # Delete video from storage
    if entry.video_key:
        storage = StorageService()
        await storage.delete_file(entry.video_key)
    
    db.delete(entry)
    db.commit()
    
    return None


@router.post("/{entry_id}/favorite", response_model=EntryResponse)
async def toggle_favorite(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Kaydı favorilere ekle/çıkar."""
    entry = db.query(Entry).filter(
        Entry.id == entry_id,
        Entry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kayıt bulunamadı"
        )
    
    entry.is_favorite = not entry.is_favorite
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    
    return entry
