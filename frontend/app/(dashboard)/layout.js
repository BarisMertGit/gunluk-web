"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

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
            <div style={{
                minHeight: "100vh",
                backgroundColor: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
            {/* Mobile Header */}
            <header style={{
                display: "block",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: "var(--bg-card)",
                borderBottom: "1px solid var(--border-color)",
                height: "64px"
            }} className="lg-hide">
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "100%",
                    padding: "0 1rem"
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            padding: "0.5rem",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-primary)"
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.875rem"
                        }}>
                            📔
                        </div>
                        <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>Yaşam Günlüğü</span>
                    </Link>

                    <ThemeToggle />
                </div>
            </header>

            {/* Sidebar */}
            <aside style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: "256px",
                backgroundColor: "var(--bg-card)",
                borderRight: "1px solid var(--border-color)",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease"
            }} className="sidebar-lg-visible">
                {/* Logo */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
                    <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.25rem"
                        }}>
                            📔
                        </div>
                        <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                            Yaşam Günlüğü
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "1rem" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                            padding: "0.75rem 1rem",
                                            borderRadius: "0.75rem",
                                            textDecoration: "none",
                                            backgroundColor: isActive ? "var(--primary)" : "transparent",
                                            color: isActive ? "var(--bg-primary)" : "var(--text-secondary)",
                                            fontWeight: "500",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* New Entry Button */}
                <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)" }}>
                    <Link
                        href="/new"
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center" }}
                    >
                        <span style={{ fontSize: "1.25rem" }}>+</span>
                        <span>Yeni Kayıt</span>
                    </Link>
                </div>

                {/* User Profile & Theme */}
                <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--bg-primary)",
                                fontWeight: "500"
                            }}>
                                {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{
                                    fontWeight: "500",
                                    color: "var(--text-primary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    margin: 0
                                }}>
                                    {user.full_name || user.username}
                                </p>
                                <p style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-muted)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    margin: 0
                                }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            backgroundColor: "var(--bg-secondary)",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 30
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="main-content">
                <div style={{ padding: "1.5rem" }}>{children}</div>
            </main>

            <style jsx>{`
        @media (min-width: 1024px) {
          .lg-hide {
            display: none !important;
          }
          .sidebar-lg-visible {
            transform: translateX(0) !important;
          }
        }
      `}</style>
        </div>
    );
}
