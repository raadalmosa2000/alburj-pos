import Link from "next/link";
import { Shield, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Duty App Preview</h1>
        <p className="text-gray-500 mb-8">
          Welcome to the interactive preview. Choose which part of the application you want to test.
        </p>

        <div className="space-y-4">
          <Link
            href="/preview/mobile"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Smartphone size={24} />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-gray-900">Mobile App Preview</h2>
              <p className="text-sm text-gray-500">View the user-facing mobile interface</p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
          >
            <div className="bg-gray-100 p-3 rounded-lg text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-sm text-gray-500">Manage cities, facilities & schedules</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
