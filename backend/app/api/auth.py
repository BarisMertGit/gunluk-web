from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, UserUpdate
from app.utils.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_active_user
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Kimlik Doğrulama"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı kaydı oluştur.
    
    - **email**: Geçerli bir e-posta adresi
    - **username**: 3-100 karakter arası kullanıcı adı
    - **password**: En az 8 karakter şifre
    """
    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten kullanımda"
        )
    
    # Check if username exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı adı zaten kullanımda"
        )
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return Token(access_token=access_token, user=UserResponse.from_orm(user))


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Kullanıcı girişi yap ve JWT token al.
    
    OAuth2 uyumlu form verisi kullanır.
    """
    # Find user by email or username
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz e-posta veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesap devre dışı bırakılmış"
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return Token(access_token=access_token, user=UserResponse.from_orm(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Mevcut kullanıcı bilgilerini getir."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı profilini güncelle."""
    update_data = user_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı şifresini değiştir."""
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifre yanlış"
        )
    
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yeni şifre en az 8 karakter olmalı"
        )
    
    current_user.hashed_password = get_password_hash(new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Şifre başarıyla değiştirildi"}
