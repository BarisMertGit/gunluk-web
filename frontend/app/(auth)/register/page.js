"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-full gradient-button flex items-center justify-center">
                        <span className="text-2xl">📔</span>
                    </div>
                    <span className="text-2xl font-bold text-white">Yaşam Günlüğü</span>
                </Link>

                {/* Register Card */}
                <div className="glass-card p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Hesap Oluşturun
                    </h1>
                    <p className="text-[var(--text-secondary)] text-center mb-8">
                        Hikayenizi kaydetmeye başlayın
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] transition-colors"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] transition-colors"
                                placeholder="kullanici_adi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                E-posta Adresi
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] transition-colors"
                                placeholder="ornek@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Şifre
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] transition-colors"
                                placeholder="En az 8 karakter"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Şifre Tekrar
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] transition-colors"
                                placeholder="Şifrenizi tekrar girin"
                            />
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 rounded border-[var(--glass-border)] bg-[var(--bg-dark)] checked:bg-[var(--primary-purple)]"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">
                                <Link href="/terms" className="text-[var(--primary-purple)] hover:underline">
                                    Kullanım koşullarını
                                </Link>{" "}
                                ve{" "}
                                <Link href="/privacy" className="text-[var(--primary-purple)] hover:underline">
                                    gizlilik politikasını
                                </Link>{" "}
                                kabul ediyorum.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full gradient-button py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Kayıt yapılıyor...
                                </span>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-[var(--text-secondary)]">Zaten hesabınız var mı? </span>
                        <Link
                            href="/login"
                            className="text-[var(--primary-purple)] hover:underline font-medium"
                        >
                            Giriş yapın
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
