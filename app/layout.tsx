import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export const metadata: Metadata = {
  title: "SIBAU Summer Course Groups | Sukkur IBA University",
  description: "Find and join WhatsApp groups for SIBAU summer courses. Students repeating a course connect here to meet the 5-student threshold.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#1a1410', color: '#f0e6d3' }}>
        <ToastProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer style={{ backgroundColor: '#231c15', borderTop: '1px solid #3d3020' }} className="py-6 text-center">
            <p style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }} className="text-sm">
              SIBAU Summer Groups &mdash; Summer 2026
            </p>
            <p style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }} className="text-xs mt-1">
              Built for Sukkur IBA University students
            </p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
