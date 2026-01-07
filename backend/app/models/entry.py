from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class MoodType(str, enum.Enum):
    """Mood types for journal entries."""
    HAPPY = "happy"
    SAD = "sad"
    NEUTRAL = "neutral"
    ANGRY = "angry"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    PEACEFUL = "peaceful"
    GRATEFUL = "grateful"
    TIRED = "tired"
    CONFUSED = "confused"


class Entry(Base):
    """Journal entry model with video and AI-generated content."""
    
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Video & Media
    video_url = Column(String(500))           # S3/MinIO link
    video_key = Column(String(255))           # S3/MinIO object key
    thumbnail_url = Column(String(500))       # Auto-generated thumbnail
    duration_seconds = Column(Float)          # Video duration
    file_size_bytes = Column(Integer)         # Video file size
    mime_type = Column(String(50), default="video/webm")
    
    # AI Generated Content
    transcript = Column(Text)                  # Whisper STT output
    summary = Column(Text)                     # AI generated summary (2-3 sentences)
    auto_tags = Column(JSON, default=list)     # ["work", "stress", "meeting"]
    sentiment_score = Column(Float)            # -1 to 1, overall sentiment
    
    # User Input
    title = Column(String(255))
    note = Column(Text)                        # Additional written notes
    mood = Column(SQLEnum(MoodType))
    mood_intensity = Column(Integer, default=5)  # 1-10 scale
    manual_tags = Column(JSON, default=list)   # User added tags
    
    # Metadata
    is_private = Column(Boolean, default=True)
    is_favorite = Column(Boolean, default=False)
    is_processed = Column(Boolean, default=False)  # AI processing complete
    location = Column(String(255))             # Optional location
    weather = Column(String(50))               # Optional weather
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow)  # When the video was recorded
    created_at = Column(DateTime, default=datetime.utcnow)   # When entry was created
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="entries")
    
    def __repr__(self):
        return f"<Entry {self.id} by User {self.user_id}>"
    
    @property
    def all_tags(self) -> list:
        """Combine auto and manual tags."""
        return list(set((self.auto_tags or []) + (self.manual_tags or [])))
