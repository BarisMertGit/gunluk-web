from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class MoodType(str, Enum):
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


class EntryBase(BaseModel):
    """Base entry schema."""
    title: Optional[str] = None
    note: Optional[str] = None
    mood: Optional[MoodType] = None
    mood_intensity: Optional[int] = Field(None, ge=1, le=10)
    manual_tags: Optional[List[str]] = []
    is_private: bool = True
    location: Optional[str] = None
    weather: Optional[str] = None


class EntryCreate(EntryBase):
    """Schema for creating an entry."""
    recorded_at: Optional[datetime] = None


class EntryUpdate(BaseModel):
    """Schema for updating an entry."""
    title: Optional[str] = None
    note: Optional[str] = None
    mood: Optional[MoodType] = None
    mood_intensity: Optional[int] = Field(None, ge=1, le=10)
    manual_tags: Optional[List[str]] = None
    is_private: Optional[bool] = None
    is_favorite: Optional[bool] = None
    location: Optional[str] = None
    weather: Optional[str] = None


class EntryResponse(EntryBase):
    """Schema for entry response."""
    id: int
    user_id: int
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    auto_tags: List[str] = []
    sentiment_score: Optional[float] = None
    is_favorite: bool = False
    is_processed: bool = False
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EntryList(BaseModel):
    """Schema for paginated entry list."""
    items: List[EntryResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class EntryStats(BaseModel):
    """Schema for entry statistics."""
    total_entries: int
    total_duration_minutes: float
    mood_distribution: dict
    entries_this_week: int
    entries_this_month: int
    streak_days: int
