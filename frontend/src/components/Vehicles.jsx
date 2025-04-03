import { useCallback, useEffect, useState } from "react";
import logo from "../../src/assets/logo.avif";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PriceRangeFilter = ({ value, onChange, min = 0, max = 10000 }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-3">
        <h2 className="text-gray-800 font-medium">Price Per Day</h2>
        <span className="text-blue-600 font-medium">
          {value ? `₹${value}` : "Any"}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={100}
        value={value || max}
        onChange={(e) =>
          onChange(e.target.value === `${max}` ? "" : e.target.value)
        }
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>₹{min}</span>
        <span>₹{max}</span>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, options, selectedValue, onChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-gray-800 font-medium mb-3">{title}</h2>
      <ul className="space-y-2">
        {options.map((option, idx) => (
          <li key={idx} className="flex items-center gap-x-2.5">
            <input
              type="radio"
              name={title.toLowerCase().replace(/\s+/g, "-")}
              id={`${title}-${idx}`}
              value={option}
              checked={selectedValue === option}
              onChange={() => onChange(option)}
              className="form-radio border-gray-400 text-blue-600 focus:ring-blue-600 duration-150"
            />
            <label
              htmlFor={`${title}-${idx}`}
              className="text-sm text-gray-700 font-medium"
            >
              {option}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SearchBox = ({ value, onChange, ...props }) => (
  <div className="relative w-full">
    <input
      {...props}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-3 pr-3 py-2 bg-white text-sm text-gray-500 outline-none border ring-blue-600 focus:ring-2 shadow-sm rounded-lg duration-200"
    />
  </div>
);

const Vehicles = () => {
  const nav = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);

  const [vehicles, setVehicles] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    fuel_type: "",
    transmission: "",
    type: "",
    seats: "",
    price_per_day: "",
  });

  const filterOptions = {
    fuel_type: ["Petrol", "Diesel", "Electric", "Hybrid"],
    transmission: ["Manual", "Automatic"],
    type: ["2-Wheeler", "4-Wheeler", "Multi-Wheeler"],
    seats: ["2", "4", "5", "7+"],
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      fuel_type: "",
      transmission: "",
      type: "",
      seats: "",
      price_per_day: "",
    });
  };

  const fetchVehicles = useCallback(async () => {
    try {
      const results = await fetch("http://localhost:8000/get-vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      const data = await results.json();
      setVehicles(data.vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      <aside className="w-full sm:w-80 bg-white border-r sm:sticky sm:top-0 sm:h-screen overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-gray-800 font-medium mb-2">Search Vehicles</h2>
            <SearchBox
              placeholder="Search by name..."
              value={filters.name}
              onChange={(value) => handleFilterChange("name", value)}
            />
          </div>
          <PriceRangeFilter
            value={filters.price_per_day}
            onChange={(value) => handleFilterChange("price_per_day", value)}
            min={500}
            max={10000}
          />
          <FilterGroup
            title="Fuel Type"
            options={filterOptions.fuel_type}
            selectedValue={filters.fuel_type}
            onChange={(value) => handleFilterChange("fuel_type", value)}
          />

          <FilterGroup
            title="Transmission"
            options={filterOptions.transmission}
            selectedValue={filters.transmission}
            onChange={(value) => handleFilterChange("transmission", value)}
          />

          <FilterGroup
            title="Vehicle Type"
            options={filterOptions.type}
            selectedValue={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
          />

          <FilterGroup
            title="Seats"
            options={filterOptions.seats}
            selectedValue={filters.seats}
            onChange={(value) => handleFilterChange("seats", value)}
          />
          <div className="pt-4 pb-6">
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Available Vehicles</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.length === 0 && (
              <h2>No Vehicles matching those Filters!</h2>
            )}
            {vehicles.length > 0 &&
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative h-48 bg-gray-200">
                    {vehicle.image_url ? (
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                        <span>No image available</span>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm font-bold">
                      ₹{vehicle.price_per_day}/day
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {vehicle.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {vehicle.fuel_type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {vehicle.transmission}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {vehicle.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {vehicle.seats} Seats
                      </div>
                    </div>
                    <button
                      className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 flex items-center justify-center"
                      onClick={() => {
                        nav(`/booking/${vehicle.vehicleID}`);
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="h-16"></div>
      </main>
    </div>
  );
};

export default Vehicles;
