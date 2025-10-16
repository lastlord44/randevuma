import { formatDate, formatTime } from "@/lib/utils";
import { APPOINTMENT_STATUS_TR, APPOINTMENT_STATUS_COLORS } from "@/lib/constants";

export default function RandevularPage() {
  const today = new Date();
  
  // Demo randevu verisi
  const appointments = [
    {
      id: "1",
      customerName: "Ahmet Yılmaz",
      customerPhone: "0532 123 4567",
      service: "Saç Kesimi",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      duration: 30,
      price: 150,
      status: "confirmed" as const,
      notes: "Kısa kesim tercih ediyor",
    },
    {
      id: "2",
      customerName: "Ayşe Demir",
      customerPhone: "0542 987 6543",
      service: "Manikür",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      duration: 45,
      price: 200,
      status: "pending" as const,
      notes: "",
    },
    {
      id: "3",
      customerName: "Mehmet Kaya",
      customerPhone: "0555 111 2233",
      service: "Sakal Düzeltme",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      duration: 20,
      price: 100,
      status: "confirmed" as const,
      notes: "",
    },
    {
      id: "4",
      customerName: "Fatma Öz",
      customerPhone: "0533 444 5566",
      service: "Saç Boyama",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      duration: 90,
      price: 500,
      status: "pending" as const,
      notes: "Koyu kahverengi renk isteniyor",
    },
    {
      id: "5",
      customerName: "Ali Çelik",
      customerPhone: "0544 777 8899",
      service: "Saç Kesimi + Sakal",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
      duration: 45,
      price: 200,
      status: "confirmed" as const,
      notes: "",
    },
  ];

  // Randevuları tarihe göre grupla
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const dateKey = formatDate(appointment.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(appointment);
    return groups;
  }, {} as Record<string, typeof appointments>);

  return (
    <div className="space-y-6">
      {/* Başlık ve Eylemler */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Randevular</h1>
          <p className="text-gray-600 mt-1">Tüm randevularınızı görüntüleyin ve yönetin</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
          + Yeni Randevu
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option>Tüm Durumlar</option>
            <option>Beklemede</option>
            <option>Onaylandı</option>
            <option>İptal Edildi</option>
            <option>Tamamlandı</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            defaultValue={today.toISOString().split('T')[0]}
          />
          <input
            type="text"
            placeholder="Müşteri ara..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1 min-w-[200px]"
          />
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Filtrele
          </button>
        </div>
      </div>

      {/* Randevu Listesi */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
          <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-primary-100 text-primary-700 w-20 h-20 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">{formatTime(appointment.date)}</span>
                        <span className="text-xs">{appointment.duration} dk</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{appointment.customerName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}>
                            {APPOINTMENT_STATUS_TR[appointment.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                        <p className="text-xs text-gray-500 mt-1">📞 {appointment.customerPhone}</p>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">💬 {appointment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₺{appointment.price}</p>
                        <p className="text-xs text-gray-500">Ücret</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                        Onayla
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                        İptal
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Düzenle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
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
