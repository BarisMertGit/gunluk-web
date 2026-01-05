"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    const navItems = [
        { href: "/feed", icon: "🏠", label: "Ana Sayfa" },
        { href: "/new", icon: "🎥", label: "Yeni Kayıt" },
        { href: "/calendar", icon: "📅", label: "Takvim" },
        { href: "/statistics", icon: "📊", label: "İstatistikler" },
        { href: "/settings", icon: "⚙️", label: "Ayarlar" },
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[var(--primary-purple)] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--glass-border)]">
                <div className="flex items-center justify-between h-16 px-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
                    >
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-button flex items-center justify-center">
                            <span className="text-sm">📔</span>
                        </div>
                        <span className="font-bold text-white">Yaşam Günlüğü</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-purple)] flex items-center justify-center text-white font-medium">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--glass-border)] z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-[var(--glass-border)]">
                        <Link href="/feed" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-button flex items-center justify-center">
                                <span className="text-xl">📔</span>
                            </div>
                            <span className="text-xl font-bold text-white">Yaşam Günlüğü</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? "gradient-button text-white"
                                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-white"
                                                }`}
                                        >
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* New Entry Button */}
                    <div className="p-4 border-t border-[var(--glass-border)]">
                        <Link
                            href="/new"
                            className="flex items-center justify-center gap-2 w-full gradient-button py-3 rounded-xl text-white font-semibold"
                        >
                            <span className="text-xl">+</span>
                            <span>Yeni Kayıt</span>
                        </Link>
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-t border-[var(--glass-border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-purple)] flex items-center justify-center text-white font-medium">
                                {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                    {user.full_name || user.username}
                                </p>
                                <p className="text-[var(--text-muted)] text-sm truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-white hover:bg-red-500/20 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
