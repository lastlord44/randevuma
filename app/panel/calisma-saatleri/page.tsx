import { DAYS_OF_WEEK_TR } from "@/lib/constants";

export default function CalismaSaatleriPage() {
  // Demo çalışma saatleri verisi
  const workingHours = [
    { day: 1, dayName: DAYS_OF_WEEK_TR[1], isOpen: true, startTime: "09:00", endTime: "18:00" },
    { day: 2, dayName: DAYS_OF_WEEK_TR[2], isOpen: true, startTime: "09:00", endTime: "18:00" },
    { day: 3, dayName: DAYS_OF_WEEK_TR[3], isOpen: true, startTime: "09:00", endTime: "18:00" },
    { day: 4, dayName: DAYS_OF_WEEK_TR[4], isOpen: true, startTime: "09:00", endTime: "18:00" },
    { day: 5, dayName: DAYS_OF_WEEK_TR[5], isOpen: true, startTime: "09:00", endTime: "18:00" },
    { day: 6, dayName: DAYS_OF_WEEK_TR[6], isOpen: true, startTime: "10:00", endTime: "16:00" },
    { day: 0, dayName: DAYS_OF_WEEK_TR[0], isOpen: false, startTime: "", endTime: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Çalışma Saatleri</h1>
        <p className="text-gray-600 mt-1">İşletmenizin çalışma saatlerini yönetin</p>
      </div>

      {/* Bilgi Kartı */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Çalışma Saatleri Hakkında</h3>
            <p className="text-sm text-blue-800">
              Müşterileriniz sadece belirlediğiniz çalışma saatleri içinde randevu alabilir. 
              Tatil günleri ve özel durumlar için ayrıca yapılandırma yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Hızlı Ayarlar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Ayarlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium">
            Tüm Günleri Aç (09:00-18:00)
          </button>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Hafta İçi Mesai (09:00-18:00)
          </button>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Hafta Sonu Kapat
          </button>
        </div>
      </div>

      {/* Çalışma Saatleri Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Haftalık Çalışma Programı</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {workingHours.map((schedule) => (
              <div
                key={schedule.day}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-32">
                    <h3 className="font-semibold text-gray-900">{schedule.dayName}</h3>
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked={schedule.isOpen}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Açık</span>
                  </label>

                  {schedule.isOpen ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Başlangıç:</label>
                        <input
                          type="time"
                          defaultValue={schedule.startTime}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Bitiş:</label>
                        <input
                          type="time"
                          defaultValue={schedule.endTime}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Kapalı</span>
                  )}
                </div>
                
                <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium">
                  Kaydet
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tatil Günleri */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Tatil Günleri ve Özel Kapalı Günler</h2>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              + Tatil Ekle
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📅</p>
            <p>Henüz tatil günü eklenmemiş</p>
            <p className="text-sm mt-1">Resmi tatiller ve özel kapalı günlerinizi buradan yönetebilirsiniz</p>
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
          💾 Tüm Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
