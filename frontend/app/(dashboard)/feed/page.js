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

    // Infinite scroll observer
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
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Günlüklerim</h1>
                    <p className="text-[var(--text-secondary)]">
                        Tüm anılarınız tek bir yerde
                    </p>
                </div>
                <Link
                    href="/new"
                    className="gradient-button px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center justify-center gap-2"
                >
                    <span>🎥</span> Yeni Kayıt
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={filter.mood}
                    onChange={(e) => setFilter({ ...filter, mood: e.target.value })}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-white focus:outline-none focus:border-[var(--primary-purple)]"
                >
                    <option value="">Tüm Duygular</option>
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <option key={mood} value={mood}>
                            {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() =>
                        setFilter({ ...filter, favoritesOnly: !filter.favoritesOnly })
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors inline-flex items-center gap-2 ${filter.favoritesOnly
                            ? "bg-[var(--primary-purple)] border-[var(--primary-purple)] text-white"
                            : "bg-[var(--bg-card)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white"
                        }`}
                >
                    <span>⭐</span> Favoriler
                </button>
            </div>

            {/* Entries List */}
            {isLoading && entries.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-[var(--primary-purple)] border-t-transparent rounded-full"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-6xl mb-4">📔</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Henüz günlük kaydınız yok
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Hayatınızın hikayesini kaydetmeye başlayın
                    </p>
                    <Link
                        href="/new"
                        className="gradient-button px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
                    >
                        <span>🎥</span> İlk Kaydınızı Oluşturun
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            ref={index === entries.length - 1 ? lastEntryRef : null}
                            className="glass-card overflow-hidden hover:border-[var(--primary-purple)] transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row">
                                {/* Thumbnail */}
                                <div className="relative sm:w-48 aspect-video sm:aspect-square bg-[var(--bg-dark)] flex-shrink-0">
                                    {entry.thumbnail_url ? (
                                        <img
                                            src={entry.thumbnail_url}
                                            alt={entry.title || "Video thumbnail"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            🎥
                                        </div>
                                    )}
                                    {entry.duration_seconds && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                                            {formatDuration(entry.duration_seconds)}
                                        </div>
                                    )}
                                    {/* Hover play overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-white ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            {entry.mood && (
                                                <span
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                                                    style={{ backgroundColor: moodColors[entry.mood] }}
                                                >
                                                    {moodEmojis[entry.mood]}
                                                </span>
                                            )}
                                            <div>
                                                <h3 className="text-white font-semibold">
                                                    {entry.title || formatDate(entry.recorded_at)}
                                                </h3>
                                                <p className="text-[var(--text-muted)] text-sm">
                                                    {formatDate(entry.recorded_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleFavorite(entry.id)}
                                            className={`p-2 rounded-lg transition-colors ${entry.is_favorite
                                                    ? "text-yellow-400"
                                                    : "text-[var(--text-muted)] hover:text-yellow-400"
                                                }`}
                                        >
                                            {entry.is_favorite ? "⭐" : "☆"}
                                        </button>
                                    </div>

                                    {/* Summary or Note */}
                                    {(entry.summary || entry.note) && (
                                        <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
                                            {entry.summary || entry.note}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {(entry.auto_tags?.length > 0 || entry.manual_tags?.length > 0) && (
                                        <div className="flex flex-wrap gap-2">
                                            {[...(entry.auto_tags || []), ...(entry.manual_tags || [])]
                                                .slice(0, 4)
                                                .map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 rounded-full bg-[var(--bg-dark)] text-xs text-[var(--text-secondary)]"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                        </div>
                                    )}

                                    {/* Processing status */}
                                    {!entry.is_processed && (
                                        <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                                            <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                                            AI ile işleniyor...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading more */}
                    {isLoading && entries.length > 0 && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-4 border-[var(--primary-purple)] border-t-transparent rounded-full"></div>
                        </div>
                    )}

                    {/* End of list */}
                    {!hasMore && entries.length > 0 && (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            Tüm günlükleriniz bu kadar 📔
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
