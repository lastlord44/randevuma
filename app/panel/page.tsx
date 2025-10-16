import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { APPOINTMENT_STATUS_TR, APPOINTMENT_STATUS_COLORS } from "@/lib/constants";

export default function PanelDashboard() {
  // Demo veriler
  const stats = [
    { label: "Bugünkü Randevular", value: "12", icon: "📅", color: "bg-blue-500" },
    { label: "Bekleyen Randevular", value: "5", icon: "⏳", color: "bg-yellow-500" },
    { label: "Toplam Müşteri", value: "248", icon: "👥", color: "bg-green-500" },
    { label: "Aylık Gelir", value: formatPrice(45000), icon: "💰", color: "bg-purple-500" },
  ];

  const todayDate = new Date();
  
  const upcomingAppointments = [
    {
      id: "1",
      customerName: "Ahmet Yılmaz",
      service: "Saç Kesimi",
      time: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 10, 0),
      status: "confirmed" as const,
      duration: 30,
    },
    {
      id: "2",
      customerName: "Ayşe Demir",
      service: "Manikür",
      time: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 11, 30),
      status: "pending" as const,
      duration: 45,
    },
    {
      id: "3",
      customerName: "Mehmet Kaya",
      service: "Sakal Düzeltme",
      time: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 14, 0),
      status: "confirmed" as const,
      duration: 20,
    },
    {
      id: "4",
      customerName: "Fatma Öz",
      service: "Saç Boyama",
      time: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 15, 30),
      status: "pending" as const,
      duration: 90,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {formatDate(todayDate)} - Hoş geldiniz!
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bugünkü Randevular */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bugünkü Randevular</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 text-primary-700 w-16 h-16 rounded-lg flex items-center justify-center font-semibold">
                    {formatTime(appointment.time)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.customerName}</h3>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                    <p className="text-xs text-gray-500">{appointment.duration} dakika</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}>
                    {APPOINTMENT_STATUS_TR[appointment.status]}
                  </span>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Detay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 transition-colors text-left">
          <div className="text-3xl mb-2">➕</div>
          <h3 className="font-semibold text-lg mb-1">Yeni Randevu</h3>
          <p className="text-sm text-primary-100">Hızlıca randevu oluştur</p>
        </button>
        <button className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors text-left">
          <div className="text-3xl mb-2">👤</div>
          <h3 className="font-semibold text-lg mb-1">Yeni Müşteri</h3>
          <p className="text-sm text-green-100">Müşteri kaydet</p>
        </button>
        <button className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-700 transition-colors text-left">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg mb-1">Raporlar</h3>
          <p className="text-sm text-purple-100">Detaylı raporları görüntüle</p>
        </button>
      </div>
    </div>
  );
}
