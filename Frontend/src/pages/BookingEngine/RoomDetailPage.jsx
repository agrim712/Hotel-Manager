import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FiStar, FiUser, FiCalendar, FiCheck, FiWifi, FiCoffee, FiAirplay, FiMinusSquare, FiLock, FiMapPin, FiHome, FiEye } from 'react-icons/fi';
import { FaSwimmingPool, FaParking, FaUtensils, FaSpa } from 'react-icons/fa';

const RoomDetailPage = ({ roomId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  // In a real app, this would come from an API call
  const room = {
    id: roomId,
    name: 'Deluxe Room',
    images: [
      'https://images.unsplash.com/photo-1566669437685-bc1c3cac4223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1592229505726-ca121043b6ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1582719471386-3b8f5648a481?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    description: 'Our Deluxe Room offers a perfect blend of comfort and luxury with a stunning city view. Spacious and elegantly designed, this room features a king-size bed, modern furnishings, and floor-to-ceiling windows offering panoramic views of the city skyline.',
    price: 200,
    capacity: 2,
    size: '35 m²',
    bedType: '1 King Bed',
    view: 'City View',
    amenities: ['Free WiFi', 'Breakfast included', 'Air conditioning', 'Flat-screen TV', 'Minibar', 'Safe', 'Swimming Pool Access', 'Parking'],
    rating: 4.5,
    policies: [
      'Check-in: 3:00 PM',
      'Check-out: 11:00 AM',
      'Cancellation policy: Free cancellation up to 48 hours before arrival',
      'No smoking',
      'No pets allowed'
    ],
    reviews: [
      {
        author: 'John D.',
        rating: 5,
        comment: 'Amazing room with a great view! The bed was incredibly comfortable and the service was impeccable. Will definitely stay here again on my next visit.',
        date: '2023-05-15'
      },
      {
        author: 'Sarah M.',
        rating: 4,
        comment: 'Very comfortable bed and clean room. The only minor issue was the slow WiFi in the evenings, but everything else was perfect.',
        date: '2023-04-22'
      }
    ]
  };

  const amenityIcons = {
    'Free WiFi': <FiWifi className="inline mr-2" />,
    'Breakfast included': <FiCoffee className="inline mr-2" />,
    'Air conditioning': <FiAirplay className="inline mr-2" />,
    'Flat-screen TV': <FiAirplay className="inline mr-2" />,
    'Minibar': <FiMinusSquare className="inline mr-2" />,
    'Safe': <FiLock className="inline mr-2" />,
    'Swimming Pool Access': <FaSwimmingPool className="inline mr-2" />,
    'Parking': <FaParking className="inline mr-2" />
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Handle booking logic
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Room Gallery */}
      <div className="relative">
        <Carousel 
          showArrows={true} 
          infiniteLoop={true} 
          showThumbs={false}
          showStatus={false}
          className="w-full h-96 md:h-[500px]"
        >
          {room.images.map((image, index) => (
            <div key={index} className="w-full h-96 md:h-[500px]">
              <img 
                src={image} 
                alt={`${room.name} view ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Room Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`${i < Math.floor(room.rating) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700">{room.rating}/5</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">${room.price}</div>
                <div className="text-gray-600">per night</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList className="flex border-b border-gray-200">
                  <Tab className="px-6 py-3 font-medium text-sm focus:outline-none" selectedClassName="text-indigo-600 border-b-2 border-indigo-600">
                    Overview
                  </Tab>
                  <Tab className="px-6 py-3 font-medium text-sm focus:outline-none" selectedClassName="text-indigo-600 border-b-2 border-indigo-600">
                    Amenities
                  </Tab>
                  <Tab className="px-6 py-3 font-medium text-sm focus:outline-none" selectedClassName="text-indigo-600 border-b-2 border-indigo-600">
                    Reviews
                  </Tab>
                  <Tab className="px-6 py-3 font-medium text-sm focus:outline-none" selectedClassName="text-indigo-600 border-b-2 border-indigo-600">
                    Policies
                  </Tab>
                </TabList>

                <div className="p-6">
                  <TabPanel>
                    <h3 className="text-xl font-semibold mb-4">Room Description</h3>
                    <p className="text-gray-700 mb-6">{room.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <FiHome className="text-indigo-600 text-2xl mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Size</div>
                          <div className="font-medium">{room.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <FiCheck className="text-indigo-600 text-2xl mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Bed Type</div>
                          <div className="font-medium">{room.bedType}</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <FiEye className="text-indigo-600 text-2xl mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">View</div>
                          <div className="font-medium">{room.view}</div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel>
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            {amenityIcons[amenity]}
                          </div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </TabPanel>

                  <TabPanel>
                    <h3 className="text-xl font-semibold mb-4">Guest Reviews</h3>
                    <div className="space-y-6">
                      {room.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{review.author}</h4>
                              <div className="text-sm text-gray-500">{review.date}</div>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FiStar 
                                  key={i} 
                                  className={`${i < review.rating ? 'fill-current' : ''}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </TabPanel>

                  <TabPanel>
                    <h3 className="text-xl font-semibold mb-4">Policies</h3>
                    <ul className="space-y-3">
                      {room.policies.map((policy, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Booking Box */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm sticky top-4 p-6">
              <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300"
                >
                  Book Now
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-2">Price Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>${room.price} x 3 nights</span>
                    <span>$600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>$72</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-2">
                    <span>Total</span>
                    <span>$672</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Book Now Button for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xl font-bold text-indigo-600">${room.price}</div>
            <div className="text-sm text-gray-600">per night</div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition duration-300">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;