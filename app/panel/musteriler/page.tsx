export default function MusterilerPage() {
  // Demo müşteri verisi
  const customers = [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      phone: "0532 123 4567",
      totalAppointments: 12,
      lastVisit: "15 Ekim 2025",
      notes: "Sadakat programında",
    },
    {
      id: "2",
      name: "Ayşe Demir",
      email: "ayse@example.com",
      phone: "0542 987 6543",
      totalAppointments: 8,
      lastVisit: "12 Ekim 2025",
      notes: "",
    },
    {
      id: "3",
      name: "Mehmet Kaya",
      email: "mehmet@example.com",
      phone: "0555 111 2233",
      totalAppointments: 15,
      lastVisit: "10 Ekim 2025",
      notes: "VIP müşteri",
    },
    {
      id: "4",
      name: "Fatma Öz",
      email: "fatma@example.com",
      phone: "0533 444 5566",
      totalAppointments: 5,
      lastVisit: "8 Ekim 2025",
      notes: "",
    },
    {
      id: "5",
      name: "Ali Çelik",
      email: "ali@example.com",
      phone: "0544 777 8899",
      totalAppointments: 20,
      lastVisit: "14 Ekim 2025",
      notes: "Aylık aboneliği var",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık ve Eylemler */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600 mt-1">Müşteri bilgilerini görüntüleyin ve yönetin</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
          + Yeni Müşteri
        </button>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Müşteri ara (isim, telefon, email)..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1 min-w-[300px]"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option>Tüm Müşteriler</option>
            <option>VIP Müşteriler</option>
            <option>Yeni Müşteriler</option>
            <option>Aktif Müşteriler</option>
          </select>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Ara
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Toplam Müşteri</p>
          <p className="text-2xl font-bold text-gray-900">248</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Aktif Müşteri</p>
          <p className="text-2xl font-bold text-green-600">182</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Yeni Müşteri (Bu Ay)</p>
          <p className="text-2xl font-bold text-blue-600">23</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">VIP Müşteri</p>
          <p className="text-2xl font-bold text-purple-600">45</p>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Randevu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Ziyaret
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">{customer.totalAppointments}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.lastVisit}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{customer.notes || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">Görüntüle</button>
                    <button className="text-gray-600 hover:text-gray-900 mr-3">Düzenle</button>
                    <button className="text-red-600 hover:text-red-900">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      <div className="flex justify-center items-center space-x-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Önceki
        </button>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">1</button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Sonraki
        </button>
      </div>
    </div>
  );
}
