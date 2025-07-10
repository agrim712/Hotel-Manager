import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const HomePage = () => {
  const { hotel, isLoggedIn } = useAuth();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const hotelName = hotel?.name || "Hotel Luxe";

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-700">{hotelName}</div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Home</a>
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Rooms</a>
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Amenities</a>
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Gallery</a>
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Offers</a>
            <a href="#" className="text-gray-800 hover:text-indigo-600 font-medium">Contact</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <select className="border rounded px-2 py-1 text-sm">
                <option>English</option>
                <option>Español</option>
              </select>
              <select className="border rounded px-2 py-1 text-sm">
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300">
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/50">
        <div className="container mx-auto px-6 z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Experience Luxury Redefined</h1>
            
            <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Check-in"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Check-out"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <div>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="mt-4 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition duration-300"
              >
                Search Availability
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Property Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Our Hotel</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Located in the heart of the city, Hotel Luxe offers unparalleled luxury and comfort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: 'wifi', title: 'Free WiFi', desc: 'High-speed internet access' },
              { icon: 'pool', title: 'Infinity Pool', desc: 'Stunning panoramic views' },
              { icon: 'restaurant', title: 'Fine Dining', desc: 'Gourmet cuisine' },
              { icon: 'spa', title: 'Spa Services', desc: 'Relaxing treatments' }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 text-2xl">🏨</span> {/* Replace with actual icon */}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Preview Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Rooms & Suites</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Experience comfort and luxury in our beautifully appointed accommodations
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Carousel showArrows={true} infiniteLoop={true} showThumbs={false} showStatus={false}>
              {[
                { img: '/room1.jpg', title: 'Deluxe Room' },
                { img: '/room2.jpg', title: 'Executive Suite' },
                { img: '/room3.jpg', title: 'Presidential Suite' }
              ].map((room, index) => (
                <div key={index} className="relative">
                  <img 
                    src={room.img} 
                    alt={room.title} 
                    className="rounded-xl h-96 w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                    <p className="text-white text-xl font-semibold">{room.title}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Special Offers</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Exclusive deals to make your stay even more memorable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-white/5 rounded-full"></div>
              <h3 className="text-2xl font-bold mb-2 relative z-10">Weekend Getaway</h3>
              <p className="mb-6 relative z-10">20% off on weekend stays</p>
              <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition duration-300 relative z-10">
                Book Now
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-amber-600 to-yellow-500 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/5 rounded-full"></div>
              <h3 className="text-2xl font-bold mb-2 relative z-10">Honeymoon Package</h3>
              <p className="mb-6 relative z-10">Romantic amenities included</p>
              <button className="bg-white text-amber-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition duration-300 relative z-10">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Hear from our satisfied guests about their experiences
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 text-lg italic mb-6">
                "The best hotel experience I've ever had! The service was impeccable and the rooms were stunning."
              </p>
              <p className="font-semibold text-gray-800">- John D.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-8 opacity-90">
              Subscribe to our newsletter for exclusive offers and updates
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800"
                required
              />
              <button 
                type="submit" 
                className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <address className="not-italic">
                <p className="mb-2">123 Luxury Avenue, City</p>
                <p className="mb-2">Phone: +1 234 567 890</p>
                <p className="mb-2">Email: info@hotelluxe.com</p>
              </address>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition duration-300">Home</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition duration-300">Rooms</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition duration-300">Gallery</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition duration-300">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition duration-300">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition duration-300">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition duration-300">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 Hotel Luxe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-indigo-400 transition duration-300">Terms & Conditions</a>
              <a href="#" className="hover:text-indigo-400 transition duration-300">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;