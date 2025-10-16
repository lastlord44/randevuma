import Link from "next/link";
import { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/panel" className="text-2xl font-bold text-primary-600">
                Randevuma
              </Link>
              <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                İşletme Paneli
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/panel" 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Çıkış
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Yan Menü ve İçerik */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            <Link
              href="/panel"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">📊</span>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/panel/randevular"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">📅</span>
              <span className="font-medium">Randevular</span>
            </Link>
            <Link
              href="/panel/musteriler"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">👥</span>
              <span className="font-medium">Müşteriler</span>
            </Link>
            <Link
              href="/panel/hizmetler"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">💼</span>
              <span className="font-medium">Hizmetler</span>
            </Link>
            <Link
              href="/panel/calisma-saatleri"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">🕒</span>
              <span className="font-medium">Çalışma Saatleri</span>
            </Link>
            <Link
              href="/panel/ayarlar"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <span className="mr-3">⚙️</span>
              <span className="font-medium">Ayarlar</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
