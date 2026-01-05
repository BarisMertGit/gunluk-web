"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        language: "tr",
        timezone: "Europe/Istanbul",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setFormData({
                fullName: parsed.full_name || "",
                bio: parsed.bio || "",
                language: parsed.language || "tr",
                timezone: parsed.timezone || "Europe/Istanbul",
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    bio: formData.bio,
                    language: formData.language,
                    timezone: formData.timezone,
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setMessage("Ayarlar başarıyla kaydedildi");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            setMessage("Bir hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    if (!user) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "2rem" }}>
                Ayarlar
            </h1>

            {message && (
                <div style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1.5rem",
                    backgroundColor: message.includes("başarı") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: message.includes("başarı") ? "#22C55E" : "#EF4444",
                    border: `1px solid ${message.includes("başarı") ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
                }}>
                    {message}
                </div>
            )}

            {/* Profile Section */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
                    Profil
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                            E-posta
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="input"
                            style={{ opacity: 0.6, cursor: "not-allowed" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            className="input"
                            style={{ opacity: 0.6, cursor: "not-allowed" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                            Ad Soyad
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="input"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                            Hakkımda
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                            className="input"
                            style={{ resize: "none" }}
                            placeholder="Kendiniz hakkında birkaç cümle..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary"
                        style={{ opacity: isSaving ? 0.5 : 1 }}
                    >
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </form>
            </div>

            {/* Appearance Section */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
                    Görünüm
                </h2>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <p style={{ fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                            Tema
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {theme === "light" ? "Açık tema" : "Koyu tema"} kullanılıyor
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Preferences Section */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
                    Tercihler
                </h2>

                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        Dil
                    </label>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="input"
                    >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        Saat Dilimi
                    </label>
                    <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="input"
                    >
                        <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                        <option value="Europe/London">Londra (UTC+0)</option>
                        <option value="America/New_York">New York (UTC-5)</option>
                    </select>
                </div>
            </div>

            {/* Account Section */}
            <div className="card">
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
                    Hesap
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem",
                        backgroundColor: "var(--bg-secondary)",
                        borderRadius: "0.5rem"
                    }}>
                        <div>
                            <p style={{ fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                                Hesap Türü
                            </p>
                            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                {user.is_premium ? "Premium 👑" : "Ücretsiz"}
                            </p>
                        </div>
                        {!user.is_premium && (
                            <button className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                                Premium'a Geç
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#EF4444",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
}
