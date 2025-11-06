import { Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";
import NavBar from "./components/NavBar";

function App() {
  const { location } = useRouterState();
  const isIndexRoute = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <main className="flex-grow">
        {!isIndexRoute && (
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
