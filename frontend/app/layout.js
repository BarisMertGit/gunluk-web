import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yaşam Günlüğü - Hayatınızın Hikayesini Kaydedin",
  description: "Video günlüklerinizi kaydedin, analiz edin ve geçmişinizi keşfedin. AI destekli özetleme, duygu analizi ve anı hatırlatıcıları.",
  keywords: ["günlük", "video günlük", "yaşam günlüğü", "anılar", "AI", "duygu analizi"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
