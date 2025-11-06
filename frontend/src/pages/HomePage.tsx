import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/clerk-react";

export default function HomePage() {
  return (
    <div className="bg-gray-100">
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to BinderBase</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your all-in-one solution for managing, trading, and discovering TCG
            cards.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                  Get Started - Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/search"
                className="px-6 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
              >
                Start Searching
              </a>
              <a
                href="/collection"
                className="px-6 py-3 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
              >
                View Your Collection
              </a>
            </SignedIn>
          </div>
        </div>
      </header>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Features at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Powerful Search
              </h3>
              <p className="text-gray-600">
                Instantly find any card from vast TCG databases with our fast and
                intuitive search.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Manage Collection
              </h3>
              <p className="text-gray-600">
                Digitize your physical collection. Track what you own, what you
                need, and its total value.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Sell & Trade
              </h3>
              <p className="text-gray-600">
                List your duplicate or valuable cards for sale on our integrated
                marketplace.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Connect & Chat
              </h3>
              <p className="text-gray-600">
                Connect with other collectors directly. Negotiate trades and
                make new friends.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}