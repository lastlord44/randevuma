import { formatPrice } from "@/lib/utils";

export default function HizmetlerPage() {
  // Demo hizmet verisi
  const services = [
    {
      id: "1",
      name: "Saç Kesimi",
      description: "Profesyonel saç kesimi hizmeti",
      duration: 30,
      price: 150,
      isActive: true,
      category: "Saç",
    },
    {
      id: "2",
      name: "Sakal Düzeltme",
      description: "Sakal şekillendirme ve düzeltme",
      duration: 20,
      price: 100,
      isActive: true,
      category: "Sakal",
    },
    {
      id: "3",
      name: "Saç Boyama",
      description: "Tüm saç boyama işlemleri",
      duration: 90,
      price: 500,
      isActive: true,
      category: "Saç",
    },
    {
      id: "4",
      name: "Manikür",
      description: "El bakımı ve manikür",
      duration: 45,
      price: 200,
      isActive: true,
      category: "Bakım",
    },
    {
      id: "5",
      name: "Pedikür",
      description: "Ayak bakımı ve pedikür",
      duration: 60,
      price: 250,
      isActive: true,
      category: "Bakım",
    },
    {
      id: "6",
      name: "Cilt Bakımı",
      description: "Profesyonel cilt bakımı",
      duration: 75,
      price: 400,
      isActive: false,
      category: "Bakım",
    },
  ];

  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="space-y-6">
      {/* Başlık ve Eylemler */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hizmetler</h1>
          <p className="text-gray-600 mt-1">Sunduğunuz hizmetleri yönetin</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
          + Yeni Hizmet
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Toplam Hizmet</p>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Aktif Hizmet</p>
          <p className="text-2xl font-bold text-green-600">
            {services.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Ortalama Süre</p>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)} dk
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option>Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option>Tüm Durumlar</option>
            <option>Aktif</option>
            <option>Pasif</option>
          </select>
          <input
            type="text"
            placeholder="Hizmet ara..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Hizmet Listesi - Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {service.category}
                  </span>
                </div>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {service.isActive ? "Aktif" : "Pasif"}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Süre</p>
                  <p className="text-sm font-semibold text-gray-900">⏱️ {service.duration} dakika</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Ücret</p>
                  <p className="text-lg font-bold text-primary-600">{formatPrice(service.price)}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium">
                  Düzenle
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  {service.isActive ? "Devre Dışı" : "Aktifleştir"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
