import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabBar from "@/components/TabBar";

export const metadata: Metadata = {
  title: "AI Day Planner",
  description:
    "Dump everything on your mind by voice or text — AI turns it into structured tasks.",
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
    <html lang="en">
      <body>
        <div className="app">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}
