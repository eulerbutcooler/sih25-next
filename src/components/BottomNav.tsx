import Link from "next/link";

interface BottomNavProps {
  currentPage: "home" | "map" | "messages" | "profile";
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black border-t border-[#27272a] flex justify-around p-2 z-[100]">
      <Link
        href="/home"
        className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${
          isActive("home") ? "text-amber-300" : "text-gray-400"
        }`}
      >
        <i className="fas py-2 fa-home text-xl"></i>
        
      </Link>
      <Link
        href="/map"
        className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${
          isActive("map") ? "text-amber-300" : "text-gray-400"
        }`}
      >
        <i className="fas py-2 fa-map-marked-alt text-xl"></i>
        
      </Link>
      <Link
        href="/messages"
        className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${
          isActive("messages") ? "text-amber-300" : "text-gray-400"
        }`}
      >
        <i className="fas py-2 fa-comments text-xl"></i>
        
      </Link>
      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center w-full text-center p-2 rounded-lg ${
          isActive("profile") ? "text-amber-300" : "text-gray-400"
        }`}
      >
        <i className="fas py-2 fa-user-circle text-xl"></i>
        
      </Link>
    </nav>
  );
}
