"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

interface Hotspot {
  id: number;
  name: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  reports: number;
  lastUpdated: string;
}

interface MapComponentProps {
  userLocation: { lat: number; lng: number };
  hotspots: Hotspot[];
}

// Dynamically import the MapComponent to avoid SSR issues
const DynamicMap = dynamic(
  () => import("../../components/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-900 flex items-center justify-center border-b border-gray-800">
        <div className="text-center">
          <i className="fas fa-map text-4xl text-gray-600 mb-2"></i>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    ),
  }
) as React.ComponentType<MapComponentProps>;

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hotspots] = useState<Hotspot[]>([
    {
      id: 1,
      name: "Marine Drive Flooding",
      location: "Mumbai, MH",
      severity: "high",
      type: "Tidal Flooding",
      reports: 15,
      lastUpdated: "15m ago",
    },
    {
      id: 2,
      name: "Red Tide Alert",
      location: "Calangute Beach, GA",
      severity: "critical",
      type: "Harmful Algae",
      reports: 23,
      lastUpdated: "1h ago",
    },
    {
      id: 3,
      name: "Jellyfish Bloom",
      location: "Kochi Harbor, KL",
      severity: "medium",
      type: "Marine Life",
      reports: 8,
      lastUpdated: "2h ago",
    },
    {
      id: 4,
      name: "High Wave Activity",
      location: "Puri Beach, OR",
      severity: "low",
      type: "Wave Conditions",
      reports: 4,
      lastUpdated: "3h ago",
    },
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, ()=>{setUserLocation({ lat: 28.6172, lng: 77.2082 });}, {enableHighAccuracy:true});
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-300";
      case "high":
        return "text-orange-300";
      case "medium":
        return "text-yellow-300";
      case "low":
        return "text-blue-300";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black overflow-y-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-black/70 backdrop-blur-lg z-10 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-extrabold tracking-tight">Hazard Map</h1>
        <div className="flex items-center space-x-5">
          <i className="fas fa-filter text-gray-400 cursor-pointer icon-btn"></i>
          <i className="fas fa-sync-alt text-gray-400 cursor-pointer icon-btn"></i>
        </div>
      </header>

      {/* Map Area */}
      <div className="relative">
        <div className="h-[600px] bg-gray-900 flex items-center justify-center border-b border-gray-800">
          {userLocation ? (
            <DynamicMap userLocation={userLocation} hotspots={hotspots} />
          ) : (
            <div className="text-center">
              <i className="fas fa-map text-4xl text-gray-600 mb-2"></i>
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-lg p-3 z-20 rounded-lg border border-gray-700">
          <h3 className="text-xs font-semibold text-gray-300 mb-2">
            Severity Levels
          </h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-xs text-gray-400">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-gray-400">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-400">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-400">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots List */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Active Hotspots</h2>
        <div className="space-y-3">
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="post-card bg-black rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={`w-4 h-4 ${getSeverityColor(
                        hotspot.severity
                      )} rounded-full`}
                    ></div>
                    <h3 className="font-semibold">{hotspot.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {hotspot.location}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">{hotspot.type}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${getSeverityTextColor(
                        hotspot.severity
                      )}`}
                    >
                      {hotspot.severity.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        {hotspot.reports} reports
                      </span>
                      <span>{hotspot.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="p-4 pt-0">
        <h2 className="text-lg font-bold mb-4">Emergency Contacts</h2>
        <div className="space-y-2">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
            <i className="fas fa-phone"></i>
            <span>Emergency Helpline</span>
          </button>
          <button className="w-full secondary-btn text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center space-x-2">
            <i className="fas fa-life-ring"></i>
            <span>Coast Guard</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/70 backdrop-blur-lg border-t border-gray-800 flex justify-around p-2">
        <Link
          href="/home"
          className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Home</span>
        </Link>
        <Link
          href="/map"
          className="text-amber-300 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
        >
          <i className="fas fa-map-marked-alt text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Map</span>
        </Link>
        <Link
          href="/messages"
          className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
        >
          <i className="fas fa-comments text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Messages</span>
        </Link>
        <Link
          href="/profile"
          className="text-gray-400 flex flex-col items-center justify-center w-full text-center p-2 rounded-lg"
        >
          <i className="fas fa-user-circle text-xl"></i>
          <span className="text-xs mt-1 font-semibold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
