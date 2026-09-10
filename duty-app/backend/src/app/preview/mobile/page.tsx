"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, Building, ChevronDown, CheckCircle2 } from "lucide-react";

export default function MobilePreview() {
  const [duty, setDuty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      loadDuty(selectedCityId);
    }
  }, [selectedCityId]);

  const loadCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      setCities(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedCityId(data.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadDuty = async (cityId: string) => {
    setLoading(true);
    try {
      // Using 'pharmacy' as default category slug for now
      const res = await fetch(`/api/today?cityId=${cityId}&categorySlug=pharmacy`);
      const data = await res.json();
      setDuty(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans dir-rtl">
      {/* Mobile Device Mockup */}
      <div className="w-[375px] h-[812px] bg-[#F5F7FA] rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-gray-900 flex flex-col">

        {/* Status Bar Mockup */}
        <div className="h-7 w-full flex justify-between items-center px-6 pt-2 bg-[#F5F7FA]">
          <span className="text-xs font-medium">9:41</span>
          <div className="flex gap-1">
             <div className="w-4 h-3 bg-black rounded-sm opacity-20"></div>
          </div>
        </div>

        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">المناوب اليوم</h1>
          <div className="relative">
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-10 rounded-full outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              style={{ direction: 'rtl' }}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : duty.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <CheckCircle2 size={48} className="mb-4 text-gray-300" />
              <p className="text-lg">لا توجد صيدليات مناوبة اليوم في هذه المدينة</p>
            </div>
          ) : (
            duty.map((schedule) => {
              const f = schedule.facility;
              return (
                <div key={schedule.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4" dir="rtl">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <Building size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{f.name}</h2>
                  </div>

                  <div className="space-y-3 mb-6" dir="rtl">
                    {f.address && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="text-sm">{f.address}</span>
                      </div>
                    )}
                    {f.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={18} className="text-gray-400" />
                        <span className="text-sm" dir="ltr">{f.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3" dir="rtl">
                    {f.phone && (
                      <a
                        href={`tel:${f.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors"
                      >
                        <Phone size={18} />
                        اتصال
                      </a>
                    )}
                    <button
                      onClick={() => {
                        alert("في التطبيق الحقيقي سيتم فتح خرائط جوجل أو أبل:\n" + f.address);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                      <MapPin size={18} />
                      الموقع
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Home Indicator Mockup */}
        <div className="w-full flex justify-center pb-2 bg-[#F5F7FA]">
          <div className="w-32 h-1 bg-black rounded-full opacity-20"></div>
        </div>

      </div>
    </div>
  );
}
