import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import App from "./App";
import SearchCardsPage from "./pages/SearchCardsPage";
import CollectionsPage from "./pages/CollectionsPage";
import MarketplacePage from "./pages/MarketplacePage"; 
// Create a root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <App />
      <TanStackRouterDevtools />
    </>
  ),
});

// Create an index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">BinderBase</h1>
        <p className="text-gray-600">Your TCG card collection manager</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/search"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
              >
                Search Cards
              </a>
              <a
                href="/collection"
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              >
                View Collection
              </a>
              <a
                href="/marketplace"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                Marketplace
              </a>
              <SignOutButton>
                <button className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  ),
});

// Create a search cards route
const searchCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchCardsPage,
});

// Create a collections route
const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collection",
  component: CollectionsPage,
});

// Create the new marketplace route
const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/marketplace",
  component: MarketplacePage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchCardsRoute,
  collectionsRoute,
  marketplaceRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
