import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevuma - Hızlı Randevu Sistemi",
  description: "İşletmeler için hızlı ve kolay randevu yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

