import Link from "next/link";
import { Users, Calendar, MapPin, Grid, Building, Smartphone } from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 font-bold text-xl border-b border-gray-800">
        Duty Admin
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Grid size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/cities" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <MapPin size={20} />
          <span>Cities</span>
        </Link>
        <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Grid size={20} />
          <span>Categories</span>
        </Link>
        <Link href="/admin/facilities" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Building size={20} />
          <span>Facilities</span>
        </Link>
        <Link href="/admin/schedules" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Calendar size={20} />
          <span>Schedules</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/preview/mobile" target="_blank" className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm">
          <Smartphone size={18} />
          Mobile App Preview
        </Link>
      </div>
    </aside>
  );
}
