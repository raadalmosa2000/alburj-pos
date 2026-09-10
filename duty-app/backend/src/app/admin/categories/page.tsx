"use client";
import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setCategories([...categories, data]);
      setName("");
      setSlug("");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Slug (e.g. pharmacy)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">ID</th>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Slug</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="p-4 text-gray-500 text-sm">{c.id}</td>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-gray-500">{c.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
