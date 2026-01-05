"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    username: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Giriş başarısız");
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
            padding: "1rem"
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

                {/* Login Card */}
                <div className="card">
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--text-primary)",
                        textAlign: "center",
                        marginBottom: "0.5rem"
                    }}>
                        Tekrar Hoş Geldiniz
                    </h1>
                    <p style={{
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        marginBottom: "2rem"
                    }}>
                        Hesabınıza giriş yapın
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
                        <div style={{ marginBottom: "1.25rem" }}>
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

                        <div style={{ marginBottom: "1.25rem" }}>
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
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "1.5rem"
                        }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem"
                            }}>
                                <input type="checkbox" />
                                Beni hatırla
                            </label>
                            <Link href="/forgot-password" style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem",
                                textDecoration: "none"
                            }}>
                                Şifremi unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ width: "100%", opacity: isLoading ? 0.5 : 1 }}
                        >
                            {isLoading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "20px", height: "20px" }}></div>
                                    Giriş yapılıyor...
                                </span>
                            ) : (
                                "Giriş Yap"
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Hesabınız yok mu? </span>
                        <Link href="/register" style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                            Kayıt olun
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
