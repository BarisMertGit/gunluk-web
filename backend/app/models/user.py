from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """User model for authentication and profile."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(String(500))
    bio = Column(Text)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Preferences
    language = Column(String(10), default="tr")
    timezone = Column(String(50), default="Europe/Istanbul")
    theme = Column(String(20), default="dark")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime)
    
    # Relationships
    entries = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"
