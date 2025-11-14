import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useWebSocket } from "../contexts/WebsocketContexts";

export default function NavBar() {
  const { unreadSenders } = useWebSocket();
  const notificationCount = unreadSenders.size;

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-white font-bold text-xl">
              BinderBase
            </a>
            <SignedIn>
              <div className="hidden md:flex md:ml-6 space-x-3">
                <a
                  href="/search"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Search
                </a>
                <a
                  href="/collection"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Collection
                </a>
                <a
                  href="/marketplace"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Marketplace
                </a>

                {/* --- This is the updated link --- */}
                <a
                  href="/chat"
                  // 1. Add 'relative' and 'inline-block' for positioning
                  className="relative inline-block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <span>Chat</span>
                  {notificationCount > 0 && (
                    // 2. Position the badge in the top-right corner
                    <span className="absolute top-0 right-0 block transform -translate-y-1/2 translate-x-1/2">
                      <span className="flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-xs font-bold text-white">
                          {notificationCount}
                        </span>
                      </span>
                    </span>
                  )}
                </a>
              </div>
            </SignedIn>
          </div>
          <div className="flex items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}