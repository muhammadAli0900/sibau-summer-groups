import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";

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
      <body className="min-h-full flex flex-col bg-[#0f172a] text-slate-100">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
            <p>SIBAU Summer Course Groups &mdash; Sukkur IBA University</p>
            <p className="mt-1 text-xs">Find your course. Join the group. Hit the 5-student threshold. Register together.</p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
