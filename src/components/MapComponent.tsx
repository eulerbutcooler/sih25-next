"use client";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icon not showing in Next.js
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Interface for API response posts
interface ApiPost {
  id: number;
  uuid: string;
  title: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  description: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  status: string;
  timeAgo: string;
}

// Hotspot interface matching the existing structure
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
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  distance?: number;
  description?: string;
}

interface MapComponentProps {
  initialUserLocation?: { lat: number; lng: number };
  radius?: number;
}

// Create user location icon
const userDivIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Function to get image based on hazard type
const getImageForType = (type: string) => {
  switch (type.toLowerCase()) {
    case "cyclone":
    case "hurricane":
      return "/api/placeholder/40/40?text=🌀";
    case "flood":
    case "tidal-flooding":
      return "/api/placeholder/40/40?text=🌊";
    case "red-tide":
      return "/api/placeholder/40/40?text=🟥";
    case "jellyfish":
      return "/api/placeholder/40/40?text=🪼";
    case "high-waves":
      return "/api/placeholder/40/40?text=🌊";
    case "oil-spill":
      return "/api/placeholder/40/40?text=🛢️";
    case "debris":
      return "/api/placeholder/40/40?text=🗑️";
    case "pollution":
      return "/api/placeholder/40/40?text=☠️";
    case "erosion":
      return "/api/placeholder/40/40?text=🏔️";
    case "other":
    default:
      return "/api/placeholder/40/40?text=⚠️";
  }
};

// Create custom marker icon with severity-based styling
const getDivIcon = (
  severity: string,
  imgUrl: string,
  pulse: boolean = false
) => {
  let borderColorClass = "";
  let animationClass = "";
  let style = "";

  switch (severity) {
    case "critical":
      borderColorClass = "border-red-500";
      animationClass = pulse ? "animate-pulse" : "";
      style = "box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);";
      break;
    case "high":
      borderColorClass = "border-orange-500";
      animationClass = pulse ? "animate-pulse" : "";
      style = "box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);";
      break;
    case "medium":
      borderColorClass = "border-yellow-500";
      style = "box-shadow: 0 0 10px rgba(250, 204, 21, 0.4);";
      break;
    case "low":
      borderColorClass = "border-blue-500";
      style = "box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);";
      break;
    default:
      borderColorClass = "border-gray-500";
      break;
  }

  const getRippleConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { scale: 3, color: "rgba(220, 38, 38, 0.3)", duration: "2s" };
      case "high":
        return {
          scale: 2.2,
          color: "rgba(249, 115, 22, 0.3)",
          duration: "2.5s",
        };
      case "medium":
        return { scale: 1.8, color: "rgba(250, 204, 21, 0.3)", duration: "3s" };
      default:
        return null;
    }
  };

  const rippleConfig = getRippleConfig(severity);
  const shouldShowRipple =
    pulse || severity === "critical" || severity === "high";

  return new L.DivIcon({
    html: `
      <div class="w-10 h-10 rounded-full bg-white border-2 ${borderColorClass} flex items-center justify-center overflow-hidden ${animationClass}" style="${style}; position: relative; z-index: 10;">
        <img src="${imgUrl}" class="w-full h-full object-cover rounded-full" onerror="this.src='/api/placeholder/40/40?text=⚠️'" />
      </div>
      ${
        shouldShowRipple && rippleConfig
          ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${rippleConfig.color};
          animation: rippleOut${severity} ${
              rippleConfig.duration
            } ease-out infinite;
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
          animation: rippleOut${severity} ${
              rippleConfig.duration
            } ease-out infinite 0.5s;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        "></div>
        ${
          severity === "critical"
            ? `
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
        "></div>`
            : ""
        }
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
      `
          : ""
      }
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Custom zoom controls component
const CustomZoomControls = ({
  userLocation,
  onLocateUser,
}: {
  userLocation: { lat: number; lng: number } | null;
  onLocateUser: () => void;
}) => {
  const map = useMap();

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <button
        onClick={() => map.zoomIn()}
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #27272a",
          color: "white",
          cursor: "pointer",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "36px",
        }}
      >
        <i className="fas fa-plus"></i>
      </button>
      <button
        onClick={() => map.zoomOut()}
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #27272a",
          color: "white",
          cursor: "pointer",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "36px",
        }}
      >
        <i className="fas fa-minus"></i>
      </button>
      <button
        onClick={() => {
          if (userLocation) {
            map.setView(
              [userLocation.lat, userLocation.lng],
              Math.max(map.getZoom(), 12)
            );
          } else {
            onLocateUser();
          }
        }}
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #27272a",
          color: userLocation ? "#fcd34d" : "#9ca3af",
          cursor: "pointer",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
        }}
      >
        <i className="fas fa-crosshairs" style={{ fontSize: "16px" }}></i>
      </button>
      <button
        onClick={onLocateUser}
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #27272a",
          color: "#10b981",
          cursor: "pointer",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
        }}
        title="Refresh nearby hazards"
      >
        <i className="fas fa-sync-alt" style={{ fontSize: "14px" }}></i>
      </button>
    </div>
  );
};

export default function MapComponent({
  initialUserLocation,
  radius = 10000,
}: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialUserLocation || null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get user location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          fetchNearbyPosts(newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(
            "Could not get your location. Please enable location services."
          );
          // Fallback to default location (Delhi)
          const defaultLocation = { lat: 28.6139, lng: 77.209 };
          setUserLocation(defaultLocation);
          fetchNearbyPosts(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      // Fallback to default location
      const defaultLocation = { lat: 28.6139, lng: 77.209 };
      setUserLocation(defaultLocation);
      fetchNearbyPosts(defaultLocation.lat, defaultLocation.lng);
    }
  };

  // Function to fetch nearby posts
  const fetchNearbyPosts = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/posts/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=50`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby posts");
        }

        const data = await response.json();

        // Transform API posts to hotspot format
        const transformedHotspots: Hotspot[] = data.posts.map(
          (post: ApiPost) => ({
            id: post.id,
            name: post.title,
            location: post.location,
            severity: post.severity,
            type: post.type,
            reports: 1, // Each post represents one report
            lastUpdated: post.timeAgo,
            imageUrl: post.imageUrl || getImageForType(post.type),
            coordinates: post.coordinates,
            author: post.author,
            distance: post.distance,
            description: post.description,
          })
        );

        setHotspots(transformedHotspots);
      } catch (error) {
        console.error("Error fetching nearby posts:", error);
        setError("Failed to load nearby hazards");
      } finally {
        setLoading(false);
      }
    },
    [radius]
  );

  // Get location on component mount
  useEffect(() => {
    if (userLocation) {
      fetchNearbyPosts(userLocation.lat, userLocation.lng);
    } else {
      getUserLocation();
    }
  }, [userLocation, getUserLocation, fetchNearbyPosts]);

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600/90 text-red-100";
      case "high":
        return "bg-orange-600/90 text-orange-100";
      case "medium":
        return "bg-yellow-600/90 text-yellow-100";
      case "low":
        return "bg-blue-600/90 text-blue-100";
      default:
        return "bg-gray-600/90 text-gray-100";
    }
  };

  // If no user location yet, show loading
  if (!userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Getting your location...</p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
          box-shadow: none !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: #fff !important;
          background: rgba(0, 0, 0, 0.7) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          right: 8px !important;
          top: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: bold !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          background: rgba(245, 158, 11, 0.8) !important;
          color: #000 !important;
        }
      `}</style>

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.carto.com/">CARTO</a>'
        />

        {/* User location marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userDivIcon}
        >
          <Popup className="custom-popup">
            <div className="bg-black/90 backdrop-blur-md border border-amber-500/30 rounded-lg p-3 text-white shadow-xl">
              <div className="flex items-center gap-2">
                <i className="fas fa-location-arrow text-amber-400"></i>
                <strong className="text-white font-medium">
                  Your Location
                </strong>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Hazard markers */}
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            position={[hotspot.coordinates.lat, hotspot.coordinates.lng]}
            icon={getDivIcon(
              hotspot.severity,
              hotspot.imageUrl,
              hotspot.severity === "critical"
            )}
          >
            <Popup className="custom-popup">
              <div className="bg-black/90 backdrop-blur-md border border-amber-500/30 rounded-lg p-4 max-w-sm text-white shadow-xl">
                <div className="flex items-start gap-3 mb-3">
                  {hotspot.author && (
                    <Image
                      src={hotspot.author.avatar}
                      alt={hotspot.author.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/api/placeholder/40/40?text=👤";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight mb-1 truncate">
                      {hotspot.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getSeverityBadgeColor(
                          hotspot.severity
                        )}`}
                      >
                        {hotspot.severity.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {hotspot.type.replace("-", " ")}
                      </span>
                    </div>
                    {hotspot.author && (
                      <p className="text-amber-300 text-xs font-medium">
                        by {hotspot.author.name}
                        {hotspot.author.role && (
                          <span className="text-gray-400 ml-1">
                            ({hotspot.author.role})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <i className="fas fa-map-marker-alt text-amber-400"></i>
                    <span>{hotspot.location}</span>
                  </div>

                  {hotspot.distance !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <i className="fas fa-ruler text-amber-400"></i>
                      <span>
                        {hotspot.distance < 1000
                          ? `${hotspot.distance}m away`
                          : `${(hotspot.distance / 1000).toFixed(1)}km away`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <i className="fas fa-clock text-amber-400"></i>
                    <span>{hotspot.lastUpdated}</span>
                  </div>
                </div>

                {hotspot.description && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                      {hotspot.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700">
                  <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-black text-xs font-medium py-1.5 px-3 rounded-md transition-colors">
                    <i className="fas fa-eye mr-1"></i>View Details
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium py-1.5 px-3 rounded-md transition-colors">
                    <i className="fas fa-share-alt"></i>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <CustomZoomControls
          userLocation={userLocation}
          onLocateUser={() => {
            getUserLocation();
          }}
        />
      </MapContainer>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-50 backdrop-blur">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Loading nearby hazards...
        </div>
      )}

      {/* Results counter */}
      {!loading && hotspots.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-50 backdrop-blur">
          Found {hotspots.length} hazards within{" "}
          {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-2 rounded-lg text-sm z-50 backdrop-blur">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}
    </div>
  );
}
