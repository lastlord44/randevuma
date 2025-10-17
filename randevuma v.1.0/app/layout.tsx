import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Randevuma - Online Randevu Sistemi',
  description: 'İşletmeniz için çevrimiçi randevu sistemi. Hızlı, güvenilir ve kurumsal çözüm.',
  keywords: ['randevu', 'online randevu', 'işletme', 'kuaför', 'berber', 'sağlık'],
  authors: [{ name: 'Randevuma Team' }],
  openGraph: {
    title: 'Randevuma - Online Randevu Sistemi',
    description: 'İşletmeniz için çevrimiçi randevu sistemi. Hızlı, güvenilir ve kurumsal çözüm.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Randevuma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Randevuma - Online Randevu Sistemi',
    description: 'İşletmeniz için çevrimiçi randevu sistemi. Hızlı, güvenilir ve kurumsal çözüm.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}