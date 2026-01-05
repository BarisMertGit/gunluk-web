"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

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

export default function FeedPage() {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState({ mood: "", favoritesOnly: false });
    const observerRef = useRef();

    const fetchEntries = useCallback(async (pageNum = 1, reset = false) => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: pageNum.toString(),
                page_size: "10",
            });

            if (filter.mood) params.append("mood", filter.mood);
            if (filter.favoritesOnly) params.append("favorites_only", "true");

            const response = await fetch(
                `http://localhost:8000/api/entries?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch entries");

            const data = await response.json();

            setEntries((prev) => (reset ? data.items : [...prev, ...data.items]));
            setHasMore(data.has_more);
            setPage(pageNum);
        } catch (error) {
            console.error("Error fetching entries:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        setIsLoading(true);
        fetchEntries(1, true);
    }, [filter, fetchEntries]);

    const lastEntryRef = useCallback(
        (node) => {
            if (isLoading) return;
            if (observerRef.current) observerRef.current.disconnect();
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchEntries(page + 1);
                }
            });
            if (node) observerRef.current.observe(node);
        },
        [isLoading, hasMore, page, fetchEntries]
    );

    const toggleFavorite = async (entryId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8000/api/entries/${entryId}/favorite`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const updatedEntry = await response.json();
                setEntries((prev) =>
                    prev.map((e) => (e.id === entryId ? updatedEntry : e))
                );
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "2rem"
            }}>
                <div>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                        Günlüklerim
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Tüm anılarınız tek bir yerde
                    </p>
                </div>
                <Link href="/new" className="btn-primary">
                    <span>🎥</span> Yeni Kayıt
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <select
                    value={filter.mood}
                    onChange={(e) => setFilter({ ...filter, mood: e.target.value })}
                    className="input"
                    style={{ width: "auto", minWidth: "150px" }}
                >
                    <option value="">Tüm Duygular</option>
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <option key={mood} value={mood}>
                            {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setFilter({ ...filter, favoritesOnly: !filter.favoritesOnly })}
                    className={filter.favoritesOnly ? "btn-primary" : "btn-secondary"}
                >
                    <span>⭐</span> Favoriler
                </button>
            </div>

            {/* Entries List */}
            {isLoading && entries.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
                    <div className="spinner"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📔</div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                        Henüz günlük kaydınız yok
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        Hayatınızın hikayesini kaydetmeye başlayın
                    </p>
                    <Link href="/new" className="btn-primary">
                        <span>🎥</span> İlk Kaydınızı Oluşturun
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            ref={index === entries.length - 1 ? lastEntryRef : null}
                            className="entry-card"
                        >
                            {/* Thumbnail */}
                            <div className="entry-thumbnail">
                                {entry.thumbnail_url ? (
                                    <img
                                        src={entry.thumbnail_url}
                                        alt={entry.title || "Video thumbnail"}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "2.5rem"
                                    }}>
                                        🎥
                                    </div>
                                )}
                                {entry.duration_seconds && (
                                    <div style={{
                                        position: "absolute",
                                        bottom: "0.5rem",
                                        right: "0.5rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        color: "#fff",
                                        fontSize: "0.75rem"
                                    }}>
                                        {formatDuration(entry.duration_seconds)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        {entry.mood && (
                                            <span
                                                className="mood-badge"
                                                style={{ backgroundColor: moodColors[entry.mood] }}
                                            >
                                                {moodEmojis[entry.mood]}
                                            </span>
                                        )}
                                        <div>
                                            <h3 style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.125rem" }}>
                                                {entry.title || formatDate(entry.recorded_at)}
                                            </h3>
                                            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                                {formatDate(entry.recorded_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(entry.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "1.25rem",
                                            padding: "0.25rem"
                                        }}
                                    >
                                        {entry.is_favorite ? "⭐" : "☆"}
                                    </button>
                                </div>

                                {/* Summary or Note */}
                                {(entry.summary || entry.note) && (
                                    <p style={{
                                        color: "var(--text-secondary)",
                                        fontSize: "0.875rem",
                                        marginBottom: "0.75rem",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {entry.summary || entry.note}
                                    </p>
                                )}

                                {/* Tags */}
                                {(entry.auto_tags?.length > 0 || entry.manual_tags?.length > 0) && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                        {[...(entry.auto_tags || []), ...(entry.manual_tags || [])]
                                            .slice(0, 4)
                                            .map((tag, i) => (
                                                <span key={i} className="tag">#{tag}</span>
                                            ))}
                                    </div>
                                )}

                                {/* Processing status */}
                                {!entry.is_processed && (
                                    <div style={{
                                        marginTop: "0.75rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        color: "#EAB308",
                                        fontSize: "0.875rem"
                                    }}>
                                        <div className="spinner" style={{ width: "16px", height: "16px", borderColor: "#EAB308", borderTopColor: "transparent" }}></div>
                                        AI ile işleniyor...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading more */}
                    {isLoading && entries.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0" }}>
                            <div className="spinner"></div>
                        </div>
                    )}

                    {/* End of list */}
                    {!hasMore && entries.length > 0 && (
                        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
                            Tüm günlükleriniz bu kadar 📔
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
