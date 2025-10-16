import { Outlet, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";

function App() {
  const { location } = useRouterState();
  const isIndexRoute = location.pathname === "/";

  return (
    <>
      {!isIndexRoute && (
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      )}
      <Outlet />
    </>
  );
}

export default App;
