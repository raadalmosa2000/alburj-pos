"use client";
import { useState, useEffect } from "react";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    facilityId: "",
  });

  useEffect(() => {
    fetch("/api/schedules").then(res => res.json()).then(data => setSchedules(data.data));
    fetch("/api/facilities").then(res => res.json()).then(data => setFacilities(data.data));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.facilityId) return;

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const schRes = await fetch("/api/schedules");
      const schData = await schRes.json();
      setSchedules(schData.data);

      setFormData({ ...formData, facilityId: "" });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Schedules</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.facilityId} onChange={e => setFormData({...formData, facilityId: e.target.value})}
            className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Facility</option>
            {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.city?.name})</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Assign Duty
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Facility</th>
              <th className="p-4 font-medium text-gray-600">City</th>
              <th className="p-4 font-medium text-gray-600">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-medium">{new Date(s.date).toLocaleDateString()}</td>
                <td className="p-4">{s.facility?.name}</td>
                <td className="p-4">{s.facility?.city?.name}</td>
                <td className="p-4">{s.facility?.category?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
