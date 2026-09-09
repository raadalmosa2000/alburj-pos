"use client";
import { useState, useEffect } from "react";

export default function CitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data.data));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const res = await fetch("/api/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setCities([...cities, data]);
      setName("");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Cities</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="City Name (e.g. Aleppo)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Add City
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">ID</th>
              <th className="p-4 font-medium text-gray-600">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cities.map((city) => (
              <tr key={city.id}>
                <td className="p-4 text-gray-500 text-sm">{city.id}</td>
                <td className="p-4 font-medium">{city.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
