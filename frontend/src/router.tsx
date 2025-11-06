import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import App from "./App";
import SearchCardsPage from "./pages/SearchCardsPage";
import CollectionsPage from "./pages/CollectionsPage";
import MarketplacePage from "./pages/MarketplacePage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";

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
  component: HomePage,
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

// Create the new chat route
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchCardsRoute,
  collectionsRoute,
  marketplaceRoute,
  chatRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
