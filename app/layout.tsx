import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Randevuma - İşletme Paneli",
  description: "Türkiye'nin en iyi randevu yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
