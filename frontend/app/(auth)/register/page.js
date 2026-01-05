"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullName: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError("Şifre en az 8 karakter olmalı");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    full_name: formData.fullName,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Kayıt başarısız");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/feed");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem"
        }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
                {/* Theme Toggle */}
                <div style={{ position: "fixed", top: "1rem", right: "1rem" }}>
                    <ThemeToggle />
                </div>

                {/* Logo */}
                <Link href="/" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginBottom: "2rem",
                    textDecoration: "none"
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                    }}>
                        📔
                    </div>
                    <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                        Yaşam Günlüğü
                    </span>
                </Link>

                {/* Register Card */}
                <div className="card">
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--text-primary)",
                        textAlign: "center",
                        marginBottom: "0.5rem"
                    }}>
                        Hesap Oluşturun
                    </h1>
                    <p style={{
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        marginBottom: "2rem"
                    }}>
                        Hikayenizi kaydetmeye başlayın
                    </p>

                    {error && (
                        <div style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            color: "#EF4444",
                            fontSize: "0.875rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "var(--text-secondary)",
                                marginBottom: "0.5rem"
                            }}>
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="input"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "var(--text-secondary)",
                                marginBottom: "0.5rem"
                            }}>
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="input"
                                placeholder="kullanici_adi"
                            />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "var(--text-secondary)",
                                marginBottom: "0.5rem"
                            }}>
                                E-posta Adresi
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                placeholder="ornek@email.com"
                            />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "var(--text-secondary)",
                                marginBottom: "0.5rem"
                            }}>
                                Şifre
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                placeholder="En az 8 karakter"
                            />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "var(--text-secondary)",
                                marginBottom: "0.5rem"
                            }}>
                                Şifre Tekrar
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="input"
                                placeholder="Şifrenizi tekrar girin"
                            />
                        </div>

                        <label style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            cursor: "pointer",
                            marginBottom: "1.5rem",
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)"
                        }}>
                            <input type="checkbox" required style={{ marginTop: "0.25rem" }} />
                            <span>
                                <Link href="/terms" style={{ color: "var(--text-primary)" }}>Kullanım koşullarını</Link>
                                {" "}ve{" "}
                                <Link href="/privacy" style={{ color: "var(--text-primary)" }}>gizlilik politikasını</Link>
                                {" "}kabul ediyorum.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ width: "100%", opacity: isLoading ? 0.5 : 1 }}
                        >
                            {isLoading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "20px", height: "20px" }}></div>
                                    Kayıt yapılıyor...
                                </span>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Zaten hesabınız var mı? </span>
                        <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                            Giriş yapın
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
