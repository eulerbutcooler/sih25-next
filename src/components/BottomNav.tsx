import Link from 'next/link';

interface BottomNavProps {
  currentPage: 'home' | 'map' | 'messages' | 'profile';
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black  border-t border-gray-800 flex justify-around p-2">
      <Link href="/home" className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${isActive('home') ? 'text-amber-300' : 'text-gray-400'}`}>
        <i className="fas fa-home text-xl"></i>
        <span className="text-xs mt-1 font-semibold">Home</span>
      </Link>
      <Link href="/map" className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${isActive('map') ? 'text-amber-300' : 'text-gray-400'}`}>
        <i className="fas fa-map-marked-alt text-xl"></i>
        <span className="text-xs mt-1 font-semibold">Map</span>
      </Link>
      <Link href="/messages" className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${isActive('messages') ? 'text-amber-300' : 'text-gray-400'}`}>
        <i className="fas fa-comments text-xl"></i>
        <span className="text-xs mt-1 font-semibold">Messages</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${isActive('profile') ? 'text-amber-300' : 'text-gray-400'}`}>
        <i className="fas fa-user-circle text-xl"></i>
        <span className="text-xs mt-1 font-semibold">Profile</span>
      </Link>
    </nav>
  );
}
