from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_premium: bool
    is_verified: bool
    language: str
    timezone: str
    theme: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[int] = None
    email: Optional[str] = None
