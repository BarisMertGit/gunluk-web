from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.models.entry import Entry, MoodType
from app.models.user import User
from app.schemas.entry import EntryStats
from app.utils.security import get_current_active_user

router = APIRouter(prefix="/analytics", tags=["Analitik"])


@router.get("/stats", response_model=EntryStats)
async def get_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının genel istatistiklerini getir."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total entries
    total_entries = db.query(Entry).filter(Entry.user_id == current_user.id).count()
    
    # Total duration
    total_duration = db.query(func.sum(Entry.duration_seconds)).filter(
        Entry.user_id == current_user.id
    ).scalar() or 0
    
    # Entries this week
    entries_this_week = db.query(Entry).filter(
        Entry.user_id == current_user.id,
        Entry.recorded_at >= week_ago
    ).count()
    
    # Entries this month
    entries_this_month = db.query(Entry).filter(
        Entry.user_id == current_user.id,
        Entry.recorded_at >= month_ago
    ).count()
    
    # Mood distribution
    mood_counts = db.query(
        Entry.mood, func.count(Entry.id)
    ).filter(
        Entry.user_id == current_user.id,
        Entry.mood.isnot(None)
    ).group_by(Entry.mood).all()
    
    mood_distribution = {mood.value: count for mood, count in mood_counts if mood}
    
    # Calculate streak
    streak_days = await calculate_streak(current_user.id, db)
    
    return EntryStats(
        total_entries=total_entries,
        total_duration_minutes=total_duration / 60,
        mood_distribution=mood_distribution,
        entries_this_week=entries_this_week,
        entries_this_month=entries_this_month,
        streak_days=streak_days
    )


async def calculate_streak(user_id: int, db: Session) -> int:
    """Calculate consecutive days with entries."""
    entries = db.query(func.date(Entry.recorded_at)).filter(
        Entry.user_id == user_id
    ).distinct().order_by(func.date(Entry.recorded_at).desc()).all()
    
    if not entries:
        return 0
    
    dates = [e[0] for e in entries]
    today = datetime.utcnow().date()
    
    # Check if there's an entry today or yesterday
    if dates[0] != today and dates[0] != today - timedelta(days=1):
        return 0
    
    streak = 1
    for i in range(1, len(dates)):
        if dates[i-1] - dates[i] == timedelta(days=1):
            streak += 1
        else:
            break
    
    return streak


@router.get("/mood-heatmap")
async def get_mood_heatmap(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    365 günlük duygu ısı haritası verisi.
    
    Her gün için o günün baskın ruh hali döndürülür.
    """
    if not year:
        year = datetime.now().year
    
    entries = db.query(
        func.date(Entry.recorded_at).label("date"),
        Entry.mood,
        Entry.mood_intensity
    ).filter(
        Entry.user_id == current_user.id,
        extract("year", Entry.recorded_at) == year,
        Entry.mood.isnot(None)
    ).all()
    
    # Group by date and get dominant mood
    date_moods = {}
    for date, mood, intensity in entries:
        date_str = date.isoformat()
        if date_str not in date_moods:
            date_moods[date_str] = []
        date_moods[date_str].append((mood.value, intensity or 5))
    
    # Get dominant mood for each day
    result = {}
    for date, moods in date_moods.items():
        # Sort by intensity and take the most intense mood
        dominant = max(moods, key=lambda x: x[1])
        result[date] = {
            "mood": dominant[0],
            "intensity": dominant[1],
            "count": len(moods)
        }
    
    return result


@router.get("/mood-trends")
async def get_mood_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Belirli süre içindeki duygu trendleri.
    
    Haftalık veya günlük bazda duygu dağılımı.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    entries = db.query(
        func.date(Entry.recorded_at).label("date"),
        Entry.mood,
        func.count(Entry.id).label("count")
    ).filter(
        Entry.user_id == current_user.id,
        Entry.recorded_at >= start_date,
        Entry.mood.isnot(None)
    ).group_by(
        func.date(Entry.recorded_at),
        Entry.mood
    ).order_by(func.date(Entry.recorded_at)).all()
    
    # Format for chart
    result = {}
    for date, mood, count in entries:
        date_str = date.isoformat()
        if date_str not in result:
            result[date_str] = {}
        result[date_str][mood.value] = count
    
    return result


@router.get("/day-of-week")
async def get_day_of_week_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Haftanın günlerine göre duygu analizi.
    
    Örn: "Cuma günleri %30 daha mutlu"
    """
    results = db.query(
        extract("dow", Entry.recorded_at).label("day_of_week"),
        Entry.mood,
        func.count(Entry.id).label("count"),
        func.avg(Entry.mood_intensity).label("avg_intensity")
    ).filter(
        Entry.user_id == current_user.id,
        Entry.mood.isnot(None)
    ).group_by(
        "day_of_week",
        Entry.mood
    ).all()
    
    # Format results
    days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]
    day_data = {day: {} for day in days}
    
    for dow, mood, count, avg_intensity in results:
        day_name = days[int(dow)]
        day_data[day_name][mood.value] = {
            "count": count,
            "avg_intensity": float(avg_intensity) if avg_intensity else 0
        }
    
    return day_data


@router.get("/tags")
async def get_tag_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """En çok kullanılan etiketler ve ilişkili duygular."""
    entries = db.query(Entry).filter(
        Entry.user_id == current_user.id
    ).all()
    
    tag_stats = {}
    
    for entry in entries:
        all_tags = (entry.manual_tags or []) + (entry.auto_tags or [])
        for tag in all_tags:
            if tag not in tag_stats:
                tag_stats[tag] = {"count": 0, "moods": {}}
            tag_stats[tag]["count"] += 1
            
            if entry.mood:
                mood_val = entry.mood.value
                tag_stats[tag]["moods"][mood_val] = tag_stats[tag]["moods"].get(mood_val, 0) + 1
    
    # Sort by count
    sorted_tags = sorted(tag_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:20]
    
    return dict(sorted_tags)


@router.get("/on-this-day")
async def get_on_this_day(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    'Geçen yıl bugün' tarzı anılar.
    
    Bugünün tarihine denk gelen eski kayıtlar.
    """
    today = datetime.utcnow()
    
    entries = db.query(Entry).filter(
        Entry.user_id == current_user.id,
        extract("month", Entry.recorded_at) == today.month,
        extract("day", Entry.recorded_at) == today.day,
        extract("year", Entry.recorded_at) < today.year
    ).order_by(Entry.recorded_at.desc()).all()
    
    return [
        {
            "id": e.id,
            "year": e.recorded_at.year,
            "years_ago": today.year - e.recorded_at.year,
            "title": e.title,
            "mood": e.mood.value if e.mood else None,
            "thumbnail_url": e.thumbnail_url,
            "summary": e.summary
        }
        for e in entries
    ]
