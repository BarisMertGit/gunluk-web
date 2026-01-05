"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full gradient-button flex items-center justify-center">
                <span className="text-xl">📔</span>
              </div>
              <span className="text-xl font-bold text-white">Yaşam Günlüğü</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-[var(--text-secondary)] hover:text-white transition-colors px-4 py-2"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="gradient-button px-6 py-2 rounded-full text-white font-medium"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Hayatınızın</span>
              <br />
              <span className="gradient-text">Hikayesini Kaydedin</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Video günlüklerinizi oluşturun, AI ile analiz edin ve geçmişinizi keşfedin.
              Tek tıkla kayıt, otomatik transkript ve duygu analizi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="gradient-button px-8 py-4 rounded-full text-white font-semibold text-lg inline-flex items-center justify-center gap-2"
              >
                <span>🚀</span> Ücretsiz Deneyin
              </Link>
              <Link
                href="#features"
                className="glass-card px-8 py-4 rounded-full text-white font-medium text-lg hover:bg-[var(--bg-card-hover)] transition-all inline-flex items-center justify-center gap-2"
              >
                <span>▶️</span> Nasıl Çalışır?
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div
            className={`mt-16 relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="glass-card p-4 inline-block animate-float">
              <div className="bg-[var(--bg-dark)] rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-video w-full max-w-4xl bg-gradient-to-br from-[var(--primary-purple)] to-[var(--primary-pink)] flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10"
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
                    <p className="text-lg font-medium">Günlüğünüzü Kaydedin</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--mood-happy)] flex items-center justify-center text-xl">
                    😊
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Bugünkü Anınız</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      AI ile analiz edildi • 2:34 dakika
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--bg-card)] text-xs text-[var(--text-secondary)]">
                      #mutlu
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[var(--bg-card)] text-xs text-[var(--text-secondary)]">
                      #aile
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Hayatınızı kaydetmek ve analiz etmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 hover:border-[var(--primary-purple)] transition-all group"
              >
                <div className="w-14 h-14 rounded-xl gradient-button flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-8">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heatmap Preview */}
      <section className="py-20 px-4 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Duygu Isı Haritası
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-6">
                365 günlük duygu takibi ile hayatınızdaki kalıpları keşfedin.
                Hangi günlerde daha mutlu olduğunuzu analiz edin.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--mood-happy)]"></span>
                  Mutlu günler yeşil
                </li>
                <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--mood-peaceful)]"></span>
                  Huzurlu günler mavi
                </li>
                <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--mood-sad)]"></span>
                  Üzgün günler mor
                </li>
              </ul>
            </div>
            <div className="glass-card p-6">
              <div className="grid grid-cols-[repeat(52,1fr)] gap-1">
                {Array.from({ length: 364 }, (_, i) => {
                  const colors = [
                    "bg-[var(--mood-happy)]",
                    "bg-[var(--mood-peaceful)]",
                    "bg-[var(--mood-neutral)]",
                    "bg-[var(--mood-excited)]",
                    "bg-[var(--bg-card-hover)]",
                  ];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${randomColor} opacity-80 hover:opacity-100 transition-opacity`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-purple)]/20 to-[var(--primary-pink)]/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Bugün Başlayın
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-8">
                Hayatınızın hikayesini kaydetmeye hemen başlayın. Ücretsiz hesap oluşturun.
              </p>
              <Link
                href="/register"
                className="gradient-button px-8 py-4 rounded-full text-white font-semibold text-lg inline-flex items-center justify-center gap-2"
              >
                <span>✨</span> Ücretsiz Hesap Oluştur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-button flex items-center justify-center">
                <span className="text-sm">📔</span>
              </div>
              <span className="text-lg font-bold text-white">Yaşam Günlüğü</span>
            </div>
            <div className="text-[var(--text-secondary)] text-sm">
              © 2026 Yaşam Günlüğü. Tüm hakları saklıdır.
            </div>
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
