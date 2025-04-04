import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Home() {
  const nav = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);

  return (
    <div className="min-h-screen overflow-x-hidden w-screen">
      <div className="relative h-[65vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-700/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6 w-full max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              DriftOn
            </h1>
            <p className="text-xl md:text-2xl mx-auto mb-8 drop-shadow-md">
              Premium vehicles for every journey
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => nav(authStatus ? "/vehicles" : "/login")}
                className="px-8 py-3 text-lg bg-black duration-200 text-white hover:bg-white hover:text-black rounded-md"
              >
                {authStatus ? "Book Now" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">
                Super Smooth Booking Experience
              </h3>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Top-Tier Luxurious Vehicles</h3>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Save More with Promotions</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="Luxury car fleet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">Premium Vehicles</h3>
                <p className="text-gray-600 mb-4">
                  Choose from our extensive fleet of meticulously maintained
                  luxury vehicles. From sporty convertibles to spacious SUVs, we
                  have the perfect car for every occasion.
                </p>
                <button
                  onClick={() => nav("/vehicles")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Explore Vehicles
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="Professional driver"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">
                  Professional Drivers
                </h3>
                <p className="text-gray-600 mb-4">
                  Our experienced drivers are knowledgeable, courteous, and
                  committed to your safety. Let us handle the driving while you
                  enjoy the journey in comfort and style.
                </p>
                <button
                  onClick={() => nav("/leaderboard")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Meet Our Drivers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to experience premium mobility?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Start your journey with DriftOn today and discover why we're the
            preferred choice for discerning travelers.
          </p>
          <button
            onClick={() => nav(authStatus ? "/vehicles" : "/login")}
            className="px-8 py-3 bg-white text-blue-600 text-lg font-bold rounded-md hover:bg-blue-50 transition shadow-lg"
          >
            {authStatus ? "Book Your Ride Now" : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
