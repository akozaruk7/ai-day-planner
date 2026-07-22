import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabBar from "@/components/TabBar";
import LangToggle from "@/components/LangToggle";
import HelpLink from "@/components/HelpLink";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "AI-планер дня",
  description:
    "Вивали все, що в голові, голосом або текстом — AI перетворить це на структуровані задачі.",
};

// Mobile-first: фіксований масштаб, підтримка вирізів екрана.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <LanguageProvider>
          <div className="app">
            <header className="topbar">
              <HelpLink />
              <LangToggle />
            </header>
            {children}
            <TabBar />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
