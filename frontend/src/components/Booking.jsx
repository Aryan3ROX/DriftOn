import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

function Booking() {
  const { vehicleID } = useParams();
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [driverRequired, setDriverRequired] = useState(false);
  const [driverCost, setDriverCost] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState({});
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [days, setDays] = useState(1);
  const [driverDays, setDriverDays] = useState(1);
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState({});
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [driverFilters, setDriverFilters] = useState({
    rating: 0,
    price_per_day: 10000,
    preference: "None",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/booking", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vehicleID }),
        });

        const data = await res.json();
        if (res.ok) {
          setVehicle(data.vehicle[0]);
          if (data.availableDrivers) {
            setAvailableDrivers(data.availableDrivers);
          }
        } else {
          toast.error(data.error);
          setTimeout(() => nav("/login"));
        }
      } catch (err) {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleID, nav]);

  useEffect(() => {
    setDriverDays(Math.min(days, driverDays));
  }, [days]);

  useEffect(() => {
    setDriverCost(selectedDriver.price_per_day * driverDays);
  }, [driverDays, selectedDriver]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch("http://localhost:8000/get-drivers", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(driverFilters),
        });
        const data = await res.json();
        if (res.ok) {
          setAvailableDrivers(data.drivers);
        }
      } catch (err) {
        toast.error("Error fetching drivers:", err);
      }
    };

    if (driverRequired) {
      fetchDrivers();
    }
  }, [driverRequired, driverFilters]);

  useEffect(() => {
    const fetchPromos = async () => {
      const res = await fetch("http://localhost:8000/get-promos");

      const data = await res.json();

      if (res.ok) {
        setPromos(data.promos);
      } else {
        toast.error(data.error || "Failed to fetch promos");
      }
    };
    fetchPromos();
  }, [vehicle]);

  const promoHandler = () => {
    if (promoApplied) {
      setPromoApplied(false);
      setDiscount(0);
      setSelectedPromo({});
    } else {
      setPromoApplied(true);
      setDiscount(calculatedDiscount);
    }
  };

  const basePrice = vehicle.price_per_day * days;
  const driverPrice = driverRequired && selectedDriver ? driverCost : 0;
  const correctPreference = selectedDriver.preference === vehicle.type;
  const driverDiscount =
    driverRequired && correctPreference ? (basePrice + driverPrice) * 0.1 : 0;
  const totalPrice = basePrice + driverPrice - driverDiscount - discount;

  useEffect(() => {
    let discountAmount = 0;
    if (selectedPromo) {
      if (
        selectedPromo.active &&
        selectedPromo.requirement === "Price" &&
        basePrice + driverPrice >= selectedPromo.min_value
      ) {
        if (selectedPromo.type === "Flat") discountAmount = selectedPromo.value;
        else
          discountAmount =
            (basePrice + driverPrice) * (selectedPromo.value / 100);
      } else if (
        selectedPromo.active &&
        selectedPromo.requirement === "Days" &&
        days >= selectedPromo.min_value
      ) {
        if (selectedPromo.type === "Flat") discountAmount = selectedPromo.value;
        else
          discountAmount =
            (basePrice + driverPrice) * (selectedPromo.value / 100);
      } else if (
        selectedPromo.active &&
        selectedPromo.requirement === "Vehicle"
      ) {
        if (vehicle.type === selectedPromo.vehicle_req) {
          if (selectedPromo.type === "Flat")
            discountAmount = selectedPromo.value;
          else
            discountAmount =
              (basePrice + driverPrice) * (selectedPromo.value / 100);
        }
      } else if (selectedPromo.active && selectedPromo.requirement === null) {
        if (selectedPromo.type === "Flat") discountAmount = selectedPromo.value;
        else
          discountAmount =
            (basePrice + driverPrice) * (selectedPromo.value / 100);
      }
    }
    setCalculatedDiscount(discountAmount);
    if (promoApplied) setDiscount(discountAmount);
  }, [driverRequired, selectedPromo, basePrice, driverPrice]);

  const handleBooking = async () => {
    try {
      const res = await fetch("http://localhost:8000/book-ride", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleID,
          distance: Math.ceil(days * 100 * Math.random()),
          days,
          price: totalPrice,
          driverID: selectedDriver.driverID,
        }),
      });
      const data = await res.json();

      if (res.status === 201) {
        toast.success("Booking successful! Preparing your experience...");
        sessionStorage.setItem("feedbackAuth", "true" );
        setIsBookingComplete(true);
        setTimeout(() => {
          nav(`/feedback/${data.rideID}`);
        }, 7500);
      }
    } catch (error) {
      toast.error("Error booking ride:", error);
    }
  };

  if (isBookingComplete) {
    return (
      <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-20 h-20 mx-auto text-white animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Your luxury experience awaits...
          </p>
          <div className="flex justify-center items-center space-x-2 mb-8">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-150"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-300"></div>
          </div>

          <p className="text-blue-100">Redirecting to feedback...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-screen">
      <Toaster />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        {vehicle.name}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg overflow-hidden shadow-md bg-gray-100">
            <div className="h-[350px]">
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-1">Fuel Type</p>
                <p className="font-semibold">{vehicle.fuel_type}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-1">Transmission</p>
                <p className="font-semibold">{vehicle.transmission}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-1">Vehicle Type</p>
                <p className="font-semibold">{vehicle.type}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-1">Seats</p>
                <p className="font-semibold">{vehicle.seats}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-1">Mileage</p>
                <p className="font-semibold">{vehicle.mileage} {vehicle.fuel_type === 'Electric' ? "km/kWh" : "km/l"}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Booking Options</h2>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Number of Days
              </label>
              <div className="flex items-center max-w-xs">
                <button
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 text-md font-medium rounded-l-md transition"
                  disabled={days <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center py-2 border-t border-b border-gray-300 bg-white"
                />
                <button
                  onClick={() => setDays(days + 1)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 text-md font-medium rounded-r-md transition"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={driverRequired}
                  onChange={() => {
                    setDriverRequired(!driverRequired);
                    if (!driverRequired) {
                      setSelectedDriver("");
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="font-medium">Include Driver</span>
              </label>
              {driverRequired && (
                <div className="mt-4 ml-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Available Drivers</h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        ></path>
                      </svg>
                      {showFilters ? "Hide Filters" : "Filter Drivers"}
                    </button>
                  </div>

                  {/* Filters Section - Only show when filters are toggled on */}
                  {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Rating Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Rating: {driverFilters.rating}+
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={driverFilters.rating}
                            onChange={(e) =>
                              setDriverFilters({
                                ...driverFilters,
                                rating: parseFloat(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Any</span>
                            <span>5★</span>
                          </div>
                        </div>

                        {/* Price Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Price: ₹{driverFilters.price_per_day}
                          </label>
                          <input
                            type="range"
                            min="1500"
                            max="9000"
                            step="100"
                            value={driverFilters.price_per_day}
                            onChange={(e) =>
                              setDriverFilters({
                                ...driverFilters,
                                price_per_day: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>₹1500</span>
                            <span>₹9000</span>
                          </div>
                        </div>

                        {/* Preference Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preference
                          </label>
                          <select
                            value={driverFilters.preference}
                            onChange={(e) =>
                              setDriverFilters({
                                ...driverFilters,
                                preference: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="None">All Preferences</option>
                            <option value="2-Wheeler">2-Wheeler</option>
                            <option value="4-Wheeler">4-Wheeler</option>
                            <option value="Multi-Wheeler">Multi-Wheeler</option>
                          </select>
                        </div>
                      </div>

                      {/* Reset Filters button */}
                      <button
                        onClick={() =>
                          setDriverFilters({
                            rating: 0,
                            price_per_day: 9000,
                            preference: "None",
                          })
                        }
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                  <div className="mb-6">
                    {(() => {
                      if (availableDrivers.length === 0) {
                        return (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">
                              No drivers match your filters
                            </p>
                            {showFilters && (
                              <button
                                onClick={() =>
                                  setDriverFilters({
                                    rating: 0,
                                    price_per_day: 5000,
                                    preference: "all",
                                  })
                                }
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-1">
                            {availableDrivers.map((driver) => (
                              <div
                                key={driver.driverID}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                  selectedDriver === driver
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                                onClick={(e) => {
                                  setSelectedDriver(driver);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-bold text-lg">
                                    {driver.name}
                                  </h4>
                                  <span className="text-blue-600 font-semibold">
                                    ₹{driver.price_per_day}/day
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-yellow-400 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <span>{driver.rating} Rating</span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-500 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path>
                                    </svg>
                                    <span>
                                      {driver.years_of_experience} years of
                                      experience
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-500 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                      ></path>
                                    </svg>
                                    <span>
                                      {driver.preference === "None"
                                        ? "No Preference"
                                        : "Prefers " + driver.preference + "s"}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-500 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                      ></path>
                                    </svg>
                                    <span>{driver.total_trips} trips</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`text-sm ${
                                      selectedDriver === driver
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {selectedDriver === driver
                                      ? "Selected"
                                      : "Click to select"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {selectedDriver && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-gray-700 mb-2 font-medium">
                        Number of Days with Driver
                      </label>
                      <div className="flex items-center max-w-xs">
                        <button
                          onClick={() =>
                            setDriverDays(Math.max(1, driverDays - 1))
                          }
                          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-l-md transition"
                          disabled={driverDays <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={days}
                          value={driverDays}
                          onChange={(e) =>
                            setDriverDays(
                              Math.max(
                                1,
                                Math.min(days, parseInt(e.target.value) || 1)
                              )
                            )
                          }
                          className="w-16 text-center py-2 border-t border-b border-gray-300 bg-white"
                        />
                        <button
                          onClick={() =>
                            setDriverDays(Math.min(days, driverDays + 1))
                          }
                          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-md transition"
                          disabled={driverDays >= days}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Driver days cannot exceed your booking duration of{" "}
                        {days} days.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-8">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="mb-6 pb-4 border-b border-gray-200">
              <label className="block text-gray-700 mb-2 font-medium">
                Add a Promo Code for more Discounts!
              </label>
              <div className="flex mb-3">
                <input
                  type="text"
                  value={selectedPromo.promo_code || ""}
                  placeholder="Enter or select promo code"
                  className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
                <button
                  onClick={() => {
                    promoHandler();
                  }}
                  className={`px-3 py-2 rounded-r-md ${
                    promoApplied
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition`}
                  disabled={!promoApplied && !Object.keys(selectedPromo).length}
                >
                  {promoApplied ? "Remove" : "Apply"}
                </button>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Promo Codes
                </h3>
                <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded-md bg-gray-50">
                  {promos && promos.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {promos.map((promo) => (
                        <div
                          key={promo.promoID}
                          onClick={() => setSelectedPromo(promo)}
                          className={`p-3 cursor-pointer transition ${
                            selectedPromo.promoID === promo.promoID
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">
                              {promo.promo_code}
                            </span>
                            <span className="text-green-600 font-medium">
                              {Number(promo.value)}
                              {promo.type === "Percentage" ? "%" : "₹"} OFF
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {promo.description.replace("$", "₹")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No promo codes available
                    </div>
                  )}
                </div>
              </div>
              {promoApplied && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Discount applied!
                </p>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare ({days} days)</span>
                <span>₹{Number(basePrice).toFixed(2)}</span>
              </div>
              {driverRequired && selectedDriver && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Driver Fee ({driverDays} {driverDays === 1 ? "day" : "days"}
                    )
                  </span>
                  <span>₹{Number(driverPrice).toFixed(2)}</span>
                </div>
              )}
              {driverRequired && selectedDriver && correctPreference && (
                <div className="flex justify-between text-green-600">
                  <span>Driver Discount</span>
                  <span>-₹{Number(driverDiscount).toFixed(2)}</span>
                </div>
              )}
              {promoApplied && discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{Number(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleBooking}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 flex items-center justify-center"
            >
              Confirm Booking
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-1">
                By booking, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Cancellation Policy
                </a>
                .
              </p>
              <p>Free cancellation up to 24 hours before pickup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
