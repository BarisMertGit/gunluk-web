"use client";
import { useState, useEffect } from "react";

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
    empty: "var(--bg-secondary)",
};

const moodLabels = {
    happy: "Mutlu",
    sad: "Üzgün",
    angry: "Kızgın",
    neutral: "Normal",
    excited: "Heyecanlı",
    anxious: "Endişeli",
    peaceful: "Huzurlu",
    grateful: "Minnettar",
    tired: "Yorgun",
    confused: "Kararsız",
};

export default function StatisticsPage() {
    const [stats, setStats] = useState(null);
    const [heatmapData, setHeatmapData] = useState({});
    const [dayOfWeekData, setDayOfWeekData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, heatmapRes, dowRes] = await Promise.all([
                fetch("http://localhost:8000/api/analytics/stats", { headers }),
                fetch(`http://localhost:8000/api/analytics/mood-heatmap?year=${selectedYear}`, { headers }),
                fetch("http://localhost:8000/api/analytics/day-of-week", { headers }),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (heatmapRes.ok) setHeatmapData(await heatmapRes.json());
            if (dowRes.ok) setDayOfWeekData(await dowRes.json());
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateHeatmapDays = () => {
        const days = [];
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            days.push({
                date: dateStr,
                mood: heatmapData[dateStr]?.mood || "empty",
                weekday: d.getDay(),
            });
        }

        return days;
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "2rem" }}>
                İstatistikler
            </h1>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem"
                }}>
                    <div className="card" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                            {stats.total_entries}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Toplam Kayıt</div>
                    </div>
                    <div className="card" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                            {Math.round(stats.total_duration_minutes)}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Dakika Video</div>
                    </div>
                    <div className="card" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                            {stats.entries_this_week}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Bu Hafta</div>
                    </div>
                    <div className="card" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                            {stats.streak_days}🔥
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Gün Serisi</div>
                    </div>
                </div>
            )}

            {/* Mood Distribution */}
            {stats?.mood_distribution && Object.keys(stats.mood_distribution).length > 0 && (
                <div className="card" style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>
                        Duygu Dağılımı
                    </h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        {Object.entries(stats.mood_distribution).map(([mood, count]) => {
                            const total = Object.values(stats.mood_distribution).reduce((a, b) => a + b, 0);
                            const percentage = Math.round((count / total) * 100);
                            return (
                                <div key={mood} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        backgroundColor: moodColors[mood]
                                    }} />
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                                        {moodLabels[mood] || mood}: {percentage}% ({count})
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Heatmap */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        Duygu Isı Haritası
                    </h2>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="input"
                        style={{ width: "auto" }}
                    >
                        {[2024, 2025, 2026].map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(53, 1fr)",
                        gap: "3px",
                        minWidth: "700px"
                    }}>
                        {generateHeatmapDays().map((day, i) => (
                            <div
                                key={i}
                                className="heatmap-cell"
                                style={{ backgroundColor: moodColors[day.mood] }}
                                title={`${day.date}: ${moodLabels[day.mood] || "Kayıt yok"}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                    {Object.entries(moodColors).filter(([k]) => k !== "empty").map(([mood, color]) => (
                        <div key={mood} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <div style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "2px",
                                backgroundColor: color
                            }} />
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                {moodLabels[mood]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day of Week Analysis */}
            {Object.keys(dayOfWeekData).length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>
                        Haftalık Dağılım
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
                        {Object.entries(dayOfWeekData).map(([day, moods]) => {
                            const totalCount = Object.values(moods).reduce((sum, m) => sum + m.count, 0);
                            return (
                                <div key={day} style={{ textAlign: "center" }}>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "0.5rem"
                                    }}>
                                        {day.slice(0, 3)}
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        height: "60px",
                                        backgroundColor: "var(--bg-secondary)",
                                        borderRadius: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "600",
                                        color: "var(--text-primary)"
                                    }}>
                                        {totalCount}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
