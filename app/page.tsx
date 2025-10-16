import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Randevuma
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Multi-Tenant Randevu Yönetim Sistemi
          </p>
          <p className="text-lg text-gray-500">
            Next.js 14 + Tailwind CSS ile geliştirilmiştir
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              🏢 İşletme Paneli
            </h3>
            <p className="text-gray-600 mb-4">
              Randevularınızı kolayca yönetin, müşterilerinizi takip edin
            </p>
            <Link 
              href="/panel"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Panele Git
            </Link>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              📅 Randevu Al
            </h3>
            <p className="text-gray-600 mb-4">
              Kolayca randevu oluşturun ve müşterilerinizle buluşun
            </p>
            <Link 
              href="/randevu"
              className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Randevu Oluştur
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ✨ Özellikler
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Multi-tenant mimari - Her işletme kendi alanında çalışır</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Türkçe arayüz ve Türkiye saat dilimi desteği</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Randevu yönetimi ve takvim görünümü</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Müşteri ve işletme profil yönetimi</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Responsive tasarım - Mobil ve masaüstü uyumlu</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">
          © 2025 Randevuma - Türkiye&apos;nin Randevu Platformu
        </p>
      </div>
    </main>
  );
}
