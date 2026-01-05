"use client";
import { useState, useEffect } from "react";

const moodEmojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    neutral: "😐",
    excited: "🤩",
    anxious: "😰",
    peaceful: "😌",
    grateful: "🙏",
    tired: "😴",
    confused: "😕",
};

const moodColors = {
    happy: "var(--mood-happy)",
    sad: "var(--mood-sad)",
    angry: "var(--mood-angry)",
    neutral: "var(--mood-neutral)",
    excited: "var(--mood-excited)",
    anxious: "var(--mood-anxious)",
    peaceful: "var(--mood-peaceful)",
    grateful: "var(--mood-grateful)",
    tired: "var(--mood-tired)",
    confused: "var(--mood-confused)",
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        fetchEntries();
    }, [month, year]);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0).toISOString();

            const response = await fetch(
                `http://localhost:8000/api/entries?start_date=${startDate}&end_date=${endDate}&page_size=100`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setEntries(data.items);
            }
        } catch (error) {
            console.error("Error fetching entries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const getEntriesForDay = (day) => {
        if (!day) return [];
        return entries.filter((entry) => {
            const entryDate = new Date(entry.recorded_at);
            return entryDate.getDate() === day &&
                entryDate.getMonth() === month &&
                entryDate.getFullYear() === year;
        });
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem"
            }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                    Takvim
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button onClick={prevMonth} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>
                        ←
                    </button>
                    <span style={{
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        minWidth: "150px",
                        textAlign: "center"
                    }}>
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>
                        →
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="card">
                {/* Day Headers */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "0.5rem",
                    marginBottom: "0.5rem"
                }}>
                    {dayNames.map((day) => (
                        <div key={day} style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "var(--text-muted)"
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                {isLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "0.5rem"
                    }}>
                        {getDaysInMonth().map((day, index) => {
                            const dayEntries = getEntriesForDay(day);
                            const dominantMood = dayEntries.length > 0 ? dayEntries[0].mood : null;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        aspectRatio: "1",
                                        padding: "0.5rem",
                                        borderRadius: "0.5rem",
                                        backgroundColor: day ? "var(--bg-secondary)" : "transparent",
                                        border: isToday(day) ? "2px solid var(--primary)" : "1px solid transparent",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: day ? "pointer" : "default",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }}
                                >
                                    {day && (
                                        <>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                fontWeight: isToday(day) ? "bold" : "normal",
                                                color: "var(--text-primary)"
                                            }}>
                                                {day}
                                            </span>
                                            {dayEntries.length > 0 && (
                                                <div style={{
                                                    marginTop: "0.25rem",
                                                    display: "flex",
                                                    gap: "2px"
                                                }}>
                                                    {dominantMood && (
                                                        <span style={{ fontSize: "1rem" }}>
                                                            {moodEmojis[dominantMood]}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {dayEntries.length > 1 && (
                                                <span style={{
                                                    position: "absolute",
                                                    top: "4px",
                                                    right: "4px",
                                                    fontSize: "0.625rem",
                                                    backgroundColor: "var(--primary)",
                                                    color: "var(--bg-primary)",
                                                    borderRadius: "50%",
                                                    width: "16px",
                                                    height: "16px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    {dayEntries.length}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="card" style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                    Duygu Göstergeleri
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <div key={mood} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <span>{emoji}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "capitalize" }}>
                                {mood}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
