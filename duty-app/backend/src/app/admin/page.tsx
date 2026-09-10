import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const citiesCount = await prisma.city.count();
  const categoriesCount = await prisma.category.count();
  const facilitiesCount = await prisma.facility.count();
  const schedulesCount = await prisma.dutySchedule.count();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Cities</h2>
          <p className="text-3xl font-bold mt-2">{citiesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Categories</h2>
          <p className="text-3xl font-bold mt-2">{categoriesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Facilities</h2>
          <p className="text-3xl font-bold mt-2">{facilitiesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Schedules</h2>
          <p className="text-3xl font-bold mt-2">{schedulesCount}</p>
        </div>
      </div>
    </div>
  );
}
