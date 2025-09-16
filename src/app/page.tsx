import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="text-center pt-16 pb-8 px-6">
          <div className="mb-6">
            <i className="fas fa-shield-halved text-6xl text-amber-300 mb-4"></i>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Apat-Sahay
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Crowdsourced Ocean Hazard Detection
          </p>
          <p className="text-sm text-gray-500">
            Help protect our oceans by reporting hazards in real-time
          </p>
        </div>

        {/* Features Grid */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <i className="fas fa-exclamation-triangle text-2xl text-amber-300 mb-2"></i>
              <h3 className="text-sm font-semibold mb-1">Report Hazards</h3>
              <p className="text-xs text-gray-400">
                Instantly report ocean hazards with photos and location
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <i className="fas fa-map-marked-alt text-2xl text-blue-400 mb-2"></i>
              <h3 className="text-sm font-semibold mb-1">Real-time Maps</h3>
              <p className="text-xs text-gray-400">
                View live hazard locations on interactive maps
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <i className="fas fa-users text-2xl text-green-400 mb-2"></i>
              <h3 className="text-sm font-semibold mb-1">Community Driven</h3>
              <p className="text-xs text-gray-400">
                Join thousands of ocean protectors worldwide
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <i className="fas fa-phone-alt text-2xl text-red-400 mb-2"></i>
              <h3 className="text-sm font-semibold mb-1">Emergency Alert</h3>
              <p className="text-xs text-gray-400">
                Connect directly with emergency services
              </p>
            </div>
          </div>
        </div>

        {/* Hazard Types */}
        <div className="px-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">
            What You Can Report
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <i className="fas fa-water text-blue-400"></i>
              <div>
                <span className="text-sm font-medium">Tidal Flooding</span>
                <p className="text-xs text-gray-400">Coastal flooding events</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <i className="fas fa-biohazard text-red-400"></i>
              <div>
                <span className="text-sm font-medium">Red Tide & Algae</span>
                <p className="text-xs text-gray-400">Harmful algal blooms</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <i className="fas fa-oil-can text-yellow-400"></i>
              <div>
                <span className="text-sm font-medium">Oil Spills</span>
                <p className="text-xs text-gray-400">
                  Marine pollution incidents
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <i className="fas fa-trash text-gray-400"></i>
              <div>
                <span className="text-sm font-medium">Marine Debris</span>
                <p className="text-xs text-gray-400">
                  Ocean waste and pollution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 pb-8">
          <div className="space-y-4">
            <Link href="/register" className="block">
              <button className="w-full bg-amber-300 text-black font-bold py-4 px-6 rounded-xl text-lg hover:bg-amber-400 transition-colors">
                Get Started - Report a Hazard
              </button>
            </Link>

            <Link href="/signin" className="block">
              <button className="w-full bg-gray-800 text-white font-medium py-3 px-6 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors">
                Already have an account? Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 pb-8">
          <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 p-6 rounded-xl border border-amber-700/30">
            <h3 className="text-amber-300 font-bold text-center mb-4">
              Making a Difference
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-300">5K+</div>
                <div className="text-xs text-gray-400">Reports Filed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-300">150+</div>
                <div className="text-xs text-gray-400">Lives Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-300">24/7</div>
                <div className="text-xs text-gray-400">Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8 px-6">
          <div className="flex justify-center space-x-6 mb-4 text-xs">
            <Link href="#" className="text-gray-500 hover:text-amber-300">
              Privacy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-amber-300">
              Terms
            </Link>
            <Link href="#" className="text-gray-500 hover:text-amber-300">
              Help
            </Link>
            <Link href="#" className="text-gray-500 hover:text-amber-300">
              Contact
            </Link>
          </div>
          <p className="text-xs text-gray-600">
            © 2025 Apat-Sahay. Protecting our oceans together.
          </p>
        </div>
      <div className="text-center mt-6">
        <a href="#" className="text-sm text-amber-300 hover:underline">Forgot Password?</a>
        <p className="text-gray-500 mt-2">
          Don&apos;t have an account? 
          <a href="/register" className="text-amber-300 font-semibold hover:underline ml-1">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
