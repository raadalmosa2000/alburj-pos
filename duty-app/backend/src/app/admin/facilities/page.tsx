"use client";
import { useState, useEffect } from "react";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    categoryId: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/facilities").then(res => res.json()).then(data => setFacilities(data.data));
    fetch("/api/cities").then(res => res.json()).then(data => setCities(data.data));
    fetch("/api/categories").then(res => res.json()).then(data => setCategories(data.data));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cityId || !formData.categoryId) return;

    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      // Reload facilities
      const facRes = await fetch("/api/facilities");
      const facData = await facRes.json();
      setFacilities(facData.data);

      setFormData({ name: "", cityId: "", categoryId: "", phone: "", address: "" });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Facilities</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text" placeholder="Name"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.cityId} onChange={e => setFormData({...formData, cityId: e.target.value})}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select City</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="text" placeholder="Phone"
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" placeholder="Address"
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
          />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
              Add Facility
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">City</th>
              <th className="p-4 font-medium text-gray-600">Category</th>
              <th className="p-4 font-medium text-gray-600">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {facilities.map((f) => (
              <tr key={f.id}>
                <td className="p-4 font-medium">{f.name}</td>
                <td className="p-4">{f.city?.name}</td>
                <td className="p-4">{f.category?.name}</td>
                <td className="p-4 text-gray-500">{f.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
