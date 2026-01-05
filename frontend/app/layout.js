import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yaşam Günlüğü - Hayatınızın Hikayesini Kaydedin",
  description: "Video günlüklerinizi kaydedin, analiz edin ve geçmişinizi keşfedin. AI destekli özetleme, duygu analizi ve anı hatırlatıcıları.",
  keywords: ["günlük", "video günlük", "yaşam günlüğü", "anılar", "AI", "duygu analizi"],
  authors: [{ name: "Yaşam Günlüğü" }],
  openGraph: {
    title: "Yaşam Günlüğü",
    description: "Hayatınızın hikayesini kaydedin, analiz edin ve keşfedin.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
