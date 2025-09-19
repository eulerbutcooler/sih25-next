"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createPost } from "./actions";

export default function CreatePostPage() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Click to detect location...");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hazardType, setHazardType] = useState("");
  const [severity, setSeverity] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();

  // Reverse geocoding using Nominatim (free service)
  const reverseGeocodeWithNominatim = useCallback(
    async (lat: number, lon: number) => {
      try {
        setLocation("Getting address...");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
          {
            headers: {
              "User-Agent": "Apat-Sahay Ocean Hazard App",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
          }
        } else {
          setLocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        }
      } catch (error) {
        console.error("Nominatim geocoding error:", error);
        setLocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      }
    },
    []
  );

  const detectLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLocation("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setLatitude(lat);
          setLongitude(lon);

          // Reverse geocode using Nominatim
          await reverseGeocodeWithNominatim(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation("Location access denied");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, [reverseGeocodeWithNominatim]);

  // Check for errors in URL params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      let errorMessage = "An error occurred";
      switch (error) {
        case "missing-fields":
          errorMessage = "Please fill in all required fields";
          break;
        case "location-required":
          errorMessage = "Location is required";
          break;
        case "upload-failed":
          errorMessage = "Failed to upload media file";
          break;
        case "post-creation-failed":
          errorMessage = "Failed to create post";
          break;
        case "not-authenticated":
          errorMessage = "Please log in first";
          break;
        case "server-error":
          errorMessage = "Server error occurred";
          break;
        case "database-error":
          errorMessage = "Database error occurred";
          break;
      }
      alert(errorMessage);
    }
  }, [searchParams]);

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !description ||
      !location ||
      !hazardType ||
      !severity ||
      !selectedFile
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!latitude || !longitude) {
      alert("Please enable location access or enter location manually");
      return;
    }

    setIsSubmitting(true);

    // Create FormData and call server action
    // Don't wrap in try-catch - let server action handle errors and redirects
    const formData = new FormData();
    formData.append("description", description);
    formData.append("location", location);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
    formData.append("hazardType", hazardType);
    formData.append("severity", severity);
    formData.append("mediaFile", selectedFile);

    // Server action will handle success/error redirects
    await createPost(formData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-black">
      <header className="sticky top-0 bg-black/70 backdrop-blur-lg z-10 p-4 flex justify-between items-center border-b border-gray-800">
        <Link href="/home">
          <button className="text-gray-400 icon-btn">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight">Report Hazard</h1>
        <button
          type="submit"
          form="post-form"
          disabled={isSubmitting}
          className={`font-bold px-5 py-2 rounded-full text-sm transition-transform hover:scale-105 ${
            isSubmitting
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-amber-300 text-black hover:bg-amber-400"
          }`}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </header>

      <form id="post-form" onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Hazard Type Selection */}
        <div>
          <label className="text-sm font-medium text-gray-400">
            Hazard Type
          </label>
          <select
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            className="form-input mt-1 w-full p-3 rounded-xl"
          >
            <option value="">Select hazard type</option>
            <option value="cyclone">Cyclone</option>
            <option value="hurricane">Hurricane</option>
            <option value="flood">Flood</option>
            <option value="tidal-flooding">Tidal Flooding</option>
            <option value="red-tide">Red Tide</option>
            <option value="jellyfish">Jellyfish Bloom</option>
            <option value="high-waves">High Waves</option>
            <option value="oil-spill">Oil Spill</option>
            <option value="debris">Marine Debris</option>
            <option value="pollution">Water Pollution</option>
            <option value="erosion">Coastal Erosion</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Severity Level */}
        <div>
          <label className="text-sm font-medium text-gray-400">
            Severity Level
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["Low", "Medium", "High", "Critical"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level.toLowerCase())}
                className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  severity === level.toLowerCase()
                    ? "bg-amber-300 text-black border-amber-300"
                    : "bg-gray-900 text-gray-300 border-gray-700 hover:border-amber-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Photo/Video */}
        <div>
          <label className="text-sm font-medium text-gray-400">
            Upload Photo/Video
          </label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="flex justify-center items-center w-full h-48 border-2 border-dashed border-gray-800 rounded-xl bg-[#111] hover:border-amber-300 cursor-pointer transition"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-600"></i>
                  <p className="mt-2 text-sm text-gray-500">
                    Tap to upload photo or video
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-400"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="Describe the ocean hazard in detail. Include what you observed, when it started, and any immediate dangers..."
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="text-sm font-medium text-gray-400"
          >
            Location
          </label>
          <div className="form-input mt-1 flex items-center space-x-2 p-3 rounded-xl">
            <i className="fas fa-map-marker-alt text-red-500"></i>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent w-full focus:outline-none"
              placeholder="Enter location manually..."
            />
            <button onClick={detectLocation}>
              <i className="fas fa-crosshairs text-gray-500 cursor-pointer icon-btn"></i>
            </button>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h3 className="text-sm font-semibold text-amber-300 mb-2">
            <i className="fas fa-info-circle mr-2"></i>
            Safety Reminder
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Do not put yourself in danger to capture media</li>
            <li>• Evacuate the area if conditions worsen</li>
            <li>• Contact emergency services for immediate threats</li>
            <li>• Provide accurate and factual information only</li>
          </ul>
        </div>

        {/* Emergency Contact */}
        <button
          type="button"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2"
        >
          <i className="fas fa-phone"></i>
          <span>Emergency Helpline: 112</span>
        </button>
      </form>
    </div>
  );
}
