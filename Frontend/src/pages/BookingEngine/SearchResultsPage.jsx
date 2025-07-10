import React, { useState } from 'react';
import { FiStar, FiUser, FiFilter, FiX } from 'react-icons/fi';
import { FaWifi, FaSwimmingPool, FaParking, FaUtensils, FaDumbbell, FaSpa } from 'react-icons/fa';

const SearchResultsPage = () => {
  const [priceRange, setPriceRange] = useState([100, 500]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const amenities = [
    { name: 'WiFi', icon: <FaWifi className="mr-2" /> },
    { name: 'Pool', icon: <FaSwimmingPool className="mr-2" /> },
    { name: 'Breakfast', icon: <FaUtensils className="mr-2" /> },
    { name: 'Parking', icon: <FaParking className="mr-2" /> },
    { name: 'Gym', icon: <FaDumbbell className="mr-2" /> },
    { name: 'Spa', icon: <FaSpa className="mr-2" /> }
  ];

  const rooms = [
    {
      id: 1,
      name: 'Deluxe Room',
      image: 'https://images.unsplash.com/photo-1566669437685-bc1c3cac4223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      price: 200,
      capacity: 2,
      amenities: ['WiFi', 'Breakfast'],
      rating: 4.5
    },
    {
      id: 2,
      name: 'Executive Suite',
      image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 350,
      capacity: 2,
      amenities: ['WiFi', 'Breakfast', 'Parking'],
      rating: 4.8
    }
  ];

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.rating - a.rating; // Default popularity
  });

  const amenityIcons = {
    'WiFi': <FaWifi className="inline mr-1" />,
    'Pool': <FaSwimmingPool className="inline mr-1" />,
    'Breakfast': <FaUtensils className="inline mr-1" />,
    'Parking': <FaParking className="inline mr-1" />,
    'Gym': <FaDumbbell className="inline mr-1" />,
    'Spa': <FaSpa className="inline mr-1" />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile filter dialog */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)}></div>
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Filters */}
            <div className="mt-4 border-t border-gray-200 px-4 py-6">
              <h3 className="font-medium text-gray-900">Price Range</h3>
              <div className="mt-4">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6">
              <h3 className="font-medium text-gray-900">Amenities</h3>
              <div className="mt-4 space-y-4">
                {amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-center">
                    <input
                      id={`mobile-filter-${amenity.name}`}
                      name={amenity.name}
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.name)}
                      onChange={() => handleAmenityToggle(amenity.name)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`mobile-filter-${amenity.name}`} className="ml-3 text-sm text-gray-600 flex items-center">
                      {amenity.icon} {amenity.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6">
              <h3 className="font-medium text-gray-900">Guest Rating</h3>
              <div className="mt-4 space-y-4">
                {[4, 3, 2].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      id={`mobile-rating-${rating}`}
                      name="rating"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`mobile-rating-${rating}`} className="ml-3 text-sm text-gray-600">
                      {rating}+ Stars
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              
              {/* Amenities */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="space-y-3">
                  {amenities.map((amenity) => (
                    <div key={amenity.name} className="flex items-center">
                      <input
                        id={`filter-${amenity.name}`}
                        name={amenity.name}
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.name)}
                        onChange={() => handleAmenityToggle(amenity.name)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`filter-${amenity.name}`} className="ml-3 text-sm text-gray-600 flex items-center">
                        {amenity.icon} {amenity.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Guest Rating */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Guest Rating</h4>
                <div className="space-y-3">
                  {[4, 3, 2].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <input
                        id={`rating-${rating}`}
                        name="rating"
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`rating-${rating}`} className="ml-3 text-sm text-gray-600">
                        {rating}+ Stars
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter bar */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
              <button
                type="button"
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
            </div>

            {/* Sort options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{sortedRooms.length}</span> rooms
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Rating: High to Low</option>
                </select>
              </div>
            </div>

            {/* Room results */}
            <div className="space-y-6">
              {sortedRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 md:w-64">
                      <img
                        className="h-48 w-full object-cover md:h-full"
                        src={room.image}
                        alt={room.name}
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                        <div className="flex items-center text-yellow-500">
                          <FiStar className="fill-current" />
                          <span className="ml-1 text-gray-700">{room.rating}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <span key={amenity} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {amenityIcons[amenity]} {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <FiUser className="mr-1" />
                        <span>{room.capacity} Guests</span>
                      </div>
                    </div>
                    <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col items-center justify-center w-full md:w-48">
                      <div className="text-2xl font-bold text-indigo-600">${room.price}</div>
                      <div className="text-sm text-gray-500 mb-4">per night</div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Booking Summary (mobile) */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-gray-200 py-3 px-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Deluxe Room</h4>
            <p className="text-indigo-600 font-semibold">$200/night</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition duration-300">
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;