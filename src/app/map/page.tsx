"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BottomNav from "../../components/BottomNav";

// Dynamically import the MapComponent to avoid SSR issues
const DynamicMap = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900 flex items-center justify-center border-b border-[#27272a]">
      <div className="text-center">
        <i className="fas fa-map text-4xl text-gray-600 mb-2"></i>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header - More compact for mobile */}
      <header className="border-b border-[#27272a] bg-black/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left text-lg"></i>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Hazard Map</h1>
              <p className="text-xs text-gray-500">Real-time alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg border border-[#27272a] hover:bg-gray-800 transition-colors">
              <i className="fas fa-filter text-gray-400 text-sm"></i>
            </button>
            <button className="p-2 rounded-lg border border-[#27272a] hover:bg-gray-800 transition-colors">
              <i className="fas fa-layer-group text-gray-400 text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Map Container - Adjusted for mobile with bottom nav space */}
      <div className="h-[calc(100vh-140px)]">
        <DynamicMap />
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="map" />
    </div>
  );
}
