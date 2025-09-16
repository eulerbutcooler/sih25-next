"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icon not showing in Next.js
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}
delete ((L.Icon.Default.prototype as IconDefault)._getIconUrl);
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// User location marker
const userDivIcon = new L.DivIcon({
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border: 3px solid white;
      background: black;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    "></div>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Function to map location to image
const getImageForType = (type: string): string => {
  switch (type) {
    case "Mumbai, MH":
      return "/icons/h1.jpg";
    case "Calangute Beach, GA":
      return "/icons/h2.jpg";
    case "Kochi Harbor, KL":
      return "/icons/h3.jpg";
    case "Puri Beach, OR":
      return "/icons/h3.jpg";
    default:
      return "/icons/h1.jpg";
  }
};

// Function to create a marker icon based on severity
const getDivIcon = (severity: string, imgUrl: string, pulse = false) => {
  const borderColorClass = (() => {
    switch (severity) {
      case "critical":
        return "border-critical";
      case "high":
        return "border-orange-500";
      case "medium":
        return "border-yellow-400";
      case "low":
        return "border-blue-500";
      default:
        return "border-gray-400";
    }
  })();

  const getShadowColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#F97316";
      case "medium":
        return "#FACC15";
      case "low":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const animationClass = pulse ? "animate-critical-pulse" : "";

  const style = pulse 
    ? "--critical-color: #DC2626; border-color: #DC2626; position: relative;" 
    : severity === "high"
      ? `box-shadow: 0 0 18px rgba(${getShadowColor(severity).slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.4); border-color: ${getShadowColor(severity)}; position: relative;`
      : severity === "medium"
      ? `box-shadow: 0 0 8px rgba(${getShadowColor(severity).slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.4); border-color: ${getShadowColor(severity)}; position: relative;`
      : severity === "low"
        ? `box-shadow: 0 0 18px rgba(${getShadowColor(severity).slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3); border-color: ${getShadowColor(severity)};`
        : `box-shadow: 0 0 8px rgba(${getShadowColor(severity).slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.4); border-color: ${getShadowColor(severity)};`;

  const getRippleConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { scale: 3, color: "rgba(220, 38, 38, 0.3)", duration: "2s" };
      case "high":
        return { scale: 2.2, color: "rgba(249, 115, 22, 0.3)", duration: "2.5s" };
      case "medium":
        return { scale: 1.8, color: "rgba(250, 204, 21, 0.3)", duration: "3s" };
      default:
        return null;
    }
  };

  const rippleConfig = getRippleConfig(severity);
  const shouldShowRipple = pulse || severity === "high" || severity === "medium";

  return new L.DivIcon({
    html: `
      <div class="w-10 h-10 rounded-full bg-white border-2 ${borderColorClass} flex items-center justify-center overflow-hidden ${animationClass}" style="${style}; position: relative; z-index: 10;">
        <img src="${imgUrl}" class="w-full h-full object-cover rounded-full" />
      </div>
      ${shouldShowRipple && rippleConfig ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${rippleConfig.color};
          animation: rippleOut${severity} ${rippleConfig.duration} ease-out infinite;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${rippleConfig.color};
          animation: rippleOut${severity} ${rippleConfig.duration} ease-out infinite 0.5s;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        "></div>
        ${severity === "critical" ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${rippleConfig.color};
          animation: rippleOut${severity} ${rippleConfig.duration} ease-out infinite 1s;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        "></div>` : ""}
        <style>
          @keyframes rippleOut${severity} {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
            100% {
              transform: translate(-50%, -50%) scale(${rippleConfig.scale});
              opacity: 0;
            }
          }
        </style>
      ` : ""}
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface Hotspot {
  id: number;
  name: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  reports: number;
  lastUpdated: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
}

interface MapComponentProps {
  userLocation: { lat: number; lng: number };
  hotspots: Hotspot[];
}

// Custom zoom controls component
const CustomZoomControls = ({ userLocation }: { userLocation: { lat: number; lng: number } }) => {
  const map = useMap();
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <button 
        onClick={() => map.zoomIn()}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #27272a',
          color: 'white',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '36px'
        }}
      >
        <i className="fas fa-plus"></i>
      </button>
      <button 
        onClick={() => map.zoomOut()}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #27272a',
          color: 'white',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '36px'
        }}
      >
        <i className="fas fa-minus"></i>
      </button>
      <button 
        onClick={() => map.setView([userLocation.lat, userLocation.lng], map.getZoom())}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #27272a',
          color: '#fcd34d',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px'
        }}
      >
        <i className="fas fa-crosshairs" style={{ fontSize: '16px' }}></i>
      </button>
    </div>
  );
};

export default function MapComponent({ userLocation, hotspots }: MapComponentProps) {
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

  const getLatLngFromLocation = (location: string): [number, number] => {
    switch (location) {
      case "Mumbai, MH":
        return [19.076, 72.877];
      case "Calangute Beach, GA":
        return [15.550, 73.756];
      case "Kochi Harbor, KL":
        return [9.931, 76.267];
      case "Puri Beach, OR":
        return [19.813, 85.831];
      default:
        return [20.5937, 78.9629];
    }
  };

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={8}
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
      className="z-10"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        
      />
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userDivIcon}>
        <Popup>Your location</Popup>
      </Marker>
      {hotspots.map((hotspot) => (
        <Marker
          key={hotspot.id}
          position={getLatLngFromLocation(hotspot.location)}
          icon={getDivIcon(hotspot.severity, getImageForType(hotspot.location), hotspot.severity === "critical")}
        >
          <Popup>
            <div className="text-sm">
              <strong>{hotspot.name}</strong>
              <br />
              {hotspot.location}
              <br />
              <span className={`font-semibold ${getSeverityTextColor(hotspot.severity)}`}>
                {hotspot.severity.toUpperCase()}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
      <CustomZoomControls userLocation={userLocation} />
    </MapContainer>
  );
}
