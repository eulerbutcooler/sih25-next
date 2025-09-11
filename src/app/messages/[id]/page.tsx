'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: { lat: number; lng: number; name: string };
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params?.id as string;
  
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I received your ocean hazard report about Marine Drive flooding.',
      timestamp: '10:30 AM',
      isOwn: false,
      type: 'text'
    },
    {
      id: 2,
      text: 'Thank you for the quick response! The situation is quite serious here.',
      timestamp: '10:32 AM',
      isOwn: true,
      type: 'text'
    },
    {
      id: 3,
      text: 'Can you share the exact location coordinates?',
      timestamp: '10:33 AM',
      isOwn: false,
      type: 'text'
    },
    {
      id: 4,
      text: '',
      timestamp: '10:34 AM',
      isOwn: true,
      type: 'location',
      location: { lat: 18.9220, lng: 72.8347, name: 'Marine Drive, Mumbai' }
    },
    {
      id: 5,
      text: 'Perfect! Our rescue team is being dispatched to the location. ETA 15 minutes.',
      timestamp: '10:35 AM',
      isOwn: false,
      type: 'text'
    },
    {
      id: 6,
      text: '',
      timestamp: '10:36 AM',
      isOwn: true,
      type: 'image',
      imageUrl: 'https://placehold.co/300x200/000000/FFFFFF?text=Flooding+Evidence'
    },
    {
      id: 7,
      text: 'Here\'s a photo of the current situation',
      timestamp: '10:36 AM',
      isOwn: true,
      type: 'text'
    }
  ]);

  // Mock contact info based on chatId
  const getContactInfo = () => {
    switch (chatId) {
      case '1':
        return {
          name: 'Coast Guard Mumbai',
          avatar: 'https://placehold.co/48x48/1e40af/ffffff?text=CG',
          role: 'Official',
          online: true
        };
      case '2':
        return {
          name: 'Dr. Priya Nair',
          avatar: 'https://placehold.co/48x48/059669/ffffff?text=PN',
          role: 'Marine Biologist',
          online: true
        };
      default:
        return {
          name: 'Emergency Response Team',
          avatar: 'https://placehold.co/48x48/dc2626/ffffff?text=ER',
          role: 'Emergency Services',
          online: false
        };
    }
  };

  const contact = getContactInfo();

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const sendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const message: Message = {
          id: messages.length + 1,
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          type: 'location',
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          }
        };
        setMessages([...messages, message]);
      });
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-black/70 backdrop-blur-lg p-4 border-b border-gray-800 flex items-center space-x-3">
        <Link href="/messages">
          <button className="text-gray-400 icon-btn">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
        </Link>
        
        <img src={contact.avatar} className="w-10 h-10 rounded-full" alt={contact.name} />
        
        <div className="flex-1">
          <h2 className="font-semibold text-white">{contact.name}</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-gray-400">
              {contact.online ? 'Online' : 'Offline'}
            </span>
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
              {contact.role}
            </span>
          </div>
        </div>
        
        <button className="text-gray-400 icon-btn">
          <i className="fas fa-phone text-xl"></i>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-1' : 'order-2'}`}>
              {message.type === 'text' && (
                <div className={`p-3 rounded-lg ${
                  message.isOwn 
                    ? 'bg-amber-300 text-black' 
                    : 'bg-gray-800 text-white'
                }`}>
                  <p>{message.text}</p>
                </div>
              )}
              
              {message.type === 'image' && (
                <div className="bg-gray-800 p-2 rounded-lg">
                  <img src={message.imageUrl} className="rounded-lg w-full" alt="Shared image" />
                </div>
              )}
              
              {message.type === 'location' && message.location && (
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-map-marker-alt text-red-500"></i>
                    <span className="text-white font-semibold">Location Shared</span>
                  </div>
                  <p className="text-gray-300 text-sm">{message.location.name}</p>
                  <p className="text-gray-400 text-xs">
                    {message.location.lat.toFixed(4)}, {message.location.lng.toFixed(4)}
                  </p>
                </div>
              )}
              
              <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={sendLocation}
            className="p-2 text-gray-400 hover:text-amber-300 transition-colors"
          >
            <i className="fas fa-map-marker-alt"></i>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-amber-300 transition-colors">
            <i className="fas fa-camera"></i>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="form-input w-full pr-10 py-3 rounded-full"
            />
            <button 
              onClick={sendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-300 hover:text-amber-400"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            Emergency
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full">
            <i className="fas fa-info-circle mr-1"></i>
            Update Status
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full">
            <i className="fas fa-check mr-1"></i>
            Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
