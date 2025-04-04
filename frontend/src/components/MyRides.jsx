import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

function MyRides() {
  const nav = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRide, setExpandedRide] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/view-history", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok) {
          const ridesData = data.results;
          for (let i = 0; i < ridesData.length; i++) {
            const reviewRes = await fetch(
              "http://localhost:8000/view-detailed-review",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ rideID: ridesData[i].rideID }),
              }
            );

            const reviewData = await reviewRes.json();
            if (
              reviewRes.ok &&
              reviewData.review &&
              reviewData.review.length > 0
            ) {
              ridesData[i] = {
                ...ridesData[i],
                hasReview: true,
                ...reviewData.review[0],
              };
            } else {
              ridesData[i] = {
                ...ridesData[i],
                hasReview: false,
              };
            }
          }
          setRides(ridesData);
        } else {
          toast.error(data.error);
          setTimeout(() => nav("/login"));
        }
      } catch (error) {
        toast.error("Error loading ride history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [nav]);

  const toggleExpandRide = (rideID) => {
    if (expandedRide === rideID) {
      setExpandedRide(null);
    } else {
      setExpandedRide(rideID);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-5xl mx-auto p-4 md:p-6 ">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        My Rides
      </h1>

      {rides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            ></path>
          </svg>
          <h2 className="mt-4 text-xl font-semibold">No ride history found</h2>
          <p className="mt-2 text-gray-500">
            You haven't taken any rides yet. Book a ride to get started!
          </p>
          <button
            onClick={() => nav("/vehicles")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Book a Ride
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {rides.map((ride, index) => (
            <div
              key={ride.rideID}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{`Ride #${
                    index + 1
                  }`}</h2>
                  <div className="flex items-center">
                    <div
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        ride.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ride.status || "Completed"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(ride.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium">{ride.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {ride.days} {ride.days === 1 ? "day" : "days"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-blue-600">₹{ride.price}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => toggleExpandRide(ride.rideID)}
                    className={`flex items-center px-4 py-2 text-sm rounded-md transition ${
                      ride.hasReview
                        ? "text-blue-600 hover:bg-blue-50"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!ride.hasReview}
                  >
                    {ride.hasReview ? (
                      <>
                        {expandedRide === ride.rideID
                          ? "Hide Details"
                          : "Show Review"}
                        <svg
                          className={`w-4 h-4 ml-1 transition-transform ${
                            expandedRide === ride.rideID ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      "No Review Available"
                    )}
                  </button>
                </div>
              </div>
              {expandedRide === ride.rideID && ride.hasReview && (
                <div className="bg-blue-50 p-5 border-t border-blue-100 animate-fadeIn">
                  <h3 className="font-semibold text-lg mb-4">Your Review</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Rating</p>
                      <div className="flex items-center">
                        <span className="text-xl font-bold mr-2">
                          {ride.rating}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= ride.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">
                        Recommendation
                      </p>
                      <div className="flex items-center">
                        <span className="text-xl font-bold mr-2">
                          {ride.recommendation}/10
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${(ride.recommendation / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-3">
                      <p className="text-sm text-gray-500 mb-1">Review</p>
                      <p className="italic">
                        {ride.review || "No written review provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRides;
