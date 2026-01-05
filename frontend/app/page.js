"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bg-primary)",
              fontSize: "1.25rem"
            }}>
              📔
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--text-primary)" }}>
              Yaşam Günlüğü
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <ThemeToggle />
            <Link href="/login" className="btn-secondary">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-primary">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: "8rem", paddingBottom: "5rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <div className={isVisible ? "animate-fade-in" : ""} style={{ opacity: isVisible ? 1 : 0 }}>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              <span style={{ color: "var(--text-primary)" }}>Hayatınızın</span>
              <br />
              <span style={{ color: "var(--text-secondary)" }}>Hikayesini Kaydedin</span>
            </h1>

            <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "640px", margin: "0 auto 2rem" }}>
              Video günlüklerinizi oluşturun, AI ile analiz edin ve geçmişinizi keşfedin.
              Tek tıkla kayıt, otomatik transkript ve duygu analizi.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              <Link href="/register" className="btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}>
                🚀 Ücretsiz Deneyin
              </Link>
              <Link href="#features" className="btn-secondary" style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}>
                ▶️ Nasıl Çalışır?
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{ marginTop: "4rem" }} className={isVisible ? "animate-fade-in" : ""}>
            <div className="card" style={{ display: "inline-block", padding: "1rem" }}>
              <div style={{
                aspectRatio: "16/9",
                width: "100%",
                maxWidth: "800px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem"
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--bg-primary)">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>Günlüğünüzü Kaydedin</p>
                </div>
              </div>

              <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="mood-badge mood-happy">😊</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.25rem" }}>Bugünkü Anınız</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>AI ile analiz edildi • 2:34 dakika</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span className="tag">#mutlu</span>
                  <span className="tag">#aile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "5rem 1rem", backgroundColor: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Güçlü Özellikler
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "640px", margin: "0 auto" }}>
              Hayatınızı kaydetmek ve analiz etmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem"
          }}>
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: "left" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "0.75rem",
                  backgroundColor: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: "1rem"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            textAlign: "center"
          }}>
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {stat.value}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heatmap Preview */}
      <section style={{ padding: "5rem 1rem", backgroundColor: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "1rem" }}>
                Duygu Isı Haritası
              </h2>
              <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                365 günlük duygu takibi ile hayatınızdaki kalıpları keşfedin.
                Hangi günlerde daha mutlu olduğunuzu analiz edin.
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--mood-happy)" }}></span>
                  Mutlu günler yeşil
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--mood-peaceful)" }}></span>
                  Huzurlu günler mavi
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--mood-sad)" }}></span>
                  Üzgün günler mor
                </li>
              </ul>
            </div>

            <div className="card" style={{ padding: "1.5rem", overflow: "auto" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(52, 1fr)",
                gap: "3px",
                minWidth: "500px"
              }}>
                {Array.from({ length: 364 }, (_, i) => {
                  const colors = [
                    "var(--mood-happy)",
                    "var(--mood-peaceful)",
                    "var(--mood-neutral)",
                    "var(--mood-excited)",
                    "var(--bg-card-hover)",
                  ];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <div
                      key={i}
                      className="heatmap-cell"
                      style={{ backgroundColor: randomColor }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div className="card" style={{ padding: "3rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Bugün Başlayın
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Hayatınızın hikayesini kaydetmeye hemen başlayın. Ücretsiz hesap oluşturun.
            </p>
            <Link href="/register" className="btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}>
              ✨ Ücretsiz Hesap Oluştur
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "3rem 1rem", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
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
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            © 2026 Yaşam Günlüğü. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🎥",
    title: "Tek Tıkla Kayıt",
    description: "Tarayıcınızdan doğrudan video kaydedin. Hiçbir uygulama indirmenize gerek yok.",
  },
  {
    icon: "🎤",
    title: "Otomatik Transkript",
    description: "AI ile video içeriğiniz otomatik olarak metne dönüştürülür ve aranabilir hale gelir.",
  },
  {
    icon: "🧠",
    title: "Duygu Analizi",
    description: "Yapay zeka günlüklerinizi analiz eder ve duygu durumunuzu takip eder.",
  },
  {
    icon: "📊",
    title: "Detaylı İstatistikler",
    description: "365 günlük ısı haritası, haftalık trendler ve duygu korelasyonları.",
  },
  {
    icon: "🏷️",
    title: "Akıllı Etiketleme",
    description: "AI otomatik olarak içeriklerinize uygun etiketler önerir.",
  },
  {
    icon: "📅",
    title: "Anı Hatırlatıcıları",
    description: "\"Geçen yıl bugün\" tarzı anılar ile geçmişinizi yeniden keşfedin.",
  },
];

const stats = [
  { value: "10K+", label: "Aktif Kullanıcı" },
  { value: "500K+", label: "Video Günlük" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Kullanıcı Puanı" },
];
