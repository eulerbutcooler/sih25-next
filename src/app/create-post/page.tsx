'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePostPage() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Detecting location...');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hazardType, setHazardType] = useState('');
  const [severity, setSeverity] = useState('');
  const router = useRouter();

  const handlePost = () => {
    if (description && location && hazardType && severity) {
      // In a real app, you'd send this data to your backend
      router.push('/home');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setLocation('Marine Drive, Mumbai, MH');
        },
        (error) => {
          setLocation('Location access denied');
        }
      );
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
          onClick={handlePost}
          className="bg-amber-300 text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-transform hover:scale-105"
        >
          Post
        </button>
      </header>

      <div className="p-4 space-y-6">
        {/* Hazard Type Selection */}
        <div>
          <label className="text-sm font-medium text-gray-400">Hazard Type</label>
          <select 
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            className="form-input mt-1 w-full p-3 rounded-xl"
          >
            <option value="">Select hazard type</option>
            <option value="tidal-flooding">Tidal Flooding</option>
            <option value="red-tide">Red Tide/Harmful Algae</option>
            <option value="jellyfish">Jellyfish Bloom</option>
            <option value="high-waves">High Wave Activity</option>
            <option value="oil-spill">Oil Spill</option>
            <option value="debris">Marine Debris</option>
            <option value="pollution">Water Pollution</option>
            <option value="erosion">Coastal Erosion</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Severity Level */}
        <div>
          <label className="text-sm font-medium text-gray-400">Severity Level</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {['Low', 'Medium', 'High', 'Critical'].map((level) => (
              <button
                key={level}
                onClick={() => setSeverity(level.toLowerCase())}
                className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  severity === level.toLowerCase()
                    ? 'bg-amber-300 text-black border-amber-300'
                    : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-amber-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Photo/Video */}
        <div>
          <label className="text-sm font-medium text-gray-400">Upload Photo/Video</label>
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
                <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl" />
              ) : (
                <div className="text-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-600"></i>
                  <p className="mt-2 text-sm text-gray-500">Tap to upload photo or video</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium text-gray-400">Description</label>
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
          <label htmlFor="location" className="text-sm font-medium text-gray-400">Location</label>
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
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
          <i className="fas fa-phone"></i>
          <span>Emergency Helpline: 112</span>
        </button>
      </div>
    </div>
  );
}
