import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FaWifi, FaSwimmingPool, FaUtensils, FaSpa, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaBed, FaUser, FaRulerCombined } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { hotel, isLoggedIn, loading } = useAuth();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [propertyImages, setPropertyImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const navigate = useNavigate();
  
  // Set default values for hotel details
  const hotelName = hotel?.name || "Hotel Luxe";
  const hotelDescription = hotel?.description || "Located in the heart of the city, our hotel offers unparalleled luxury and comfort.";
  const hotelAddress = hotel?.operationalAddress || hotel?.registeredAddress || "123 Luxury Avenue, City";
  const checkInTime = hotel?.checkInTime || "14:00";
  const checkOutTime = hotel?.checkOutTime || "12:00";

  const defaultImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];

  // Amenity icons mapping
  const amenityIcons = {
    'wifi': <FaWifi className="text-2xl" />,
    'pool': <FaSwimmingPool className="text-2xl" />,
    'restaurant': <FaUtensils className="text-2xl" />,
    'spa': <FaSpa className="text-2xl" />,
    'bed': <FaBed className="text-2xl" />,
    // Add more mappings as needed
  };

  useEffect(() => {
    if (hotel?.propertyImages) {
      try {
        // Parse propertyImages if it's a JSON string
        const images = typeof hotel.propertyImages === 'string' 
          ? JSON.parse(hotel.propertyImages) 
          : hotel.propertyImages;
        
        // Extract URLs from the images array
        const imageUrls = images.map(img => img.url || img.path);
        setPropertyImages(imageUrls.length ? imageUrls : defaultImages);
      } catch (error) {
        console.error('Error parsing property images:', error);
        setPropertyImages(defaultImages);
      }
    } else {
      setPropertyImages(defaultImages);
    }

    // Fetch rooms if available in hotel data
    if (hotel?.rooms) {
      try {
        const parsedRooms = typeof hotel.rooms === 'string' 
          ? JSON.parse(hotel.rooms) 
          : hotel.rooms;
        setRooms(parsedRooms);
      } catch (error) {
        console.error('Error parsing rooms:', error);
      }
    }

    // Check if URL hash is #rooms to show all rooms
    if (window.location.hash === '#rooms') {
      setShowAllRooms(true);
    }
  }, [hotel]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic
    console.log({ destination, checkIn, checkOut, guests });
  };

  const getAmenityIcon = (amenityLabel) => {
    const lowerLabel = amenityLabel.toLowerCase();
    for (const key in amenityIcons) {
      if (lowerLabel.includes(key)) {
        return amenityIcons[key];
      }
    }
    return <span className="text-2xl">🏨</span>; // Default icon
  };

  const scrollToRooms = () => {
    setShowAllRooms(true);
    const element = document.getElementById('rooms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToRoomsPage = () => {
    navigate(`/booking-engine/${hotel.id}/room`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-700">{hotelName}</div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-800 hover:text-indigo-600 font-medium">Home</a>
            <a href="#rooms" className="text-gray-800 hover:text-indigo-600 font-medium">Rooms</a>
            <a href="#amenities" className="text-gray-800 hover:text-indigo-600 font-medium">Amenities</a>
            <a href="#gallery" className="text-gray-800 hover:text-indigo-600 font-medium">Gallery</a>
            <a href="#contact" className="text-gray-800 hover:text-indigo-600 font-medium">Contact</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <select className="border rounded px-2 py-1 text-sm">
                <option>English</option>
                <option>Español</option>
              </select>
              <select className="border rounded px-2 py-1 text-sm">
                <option>{hotel?.currency?.label || 'USD'}</option>
                <option>EUR</option>
              </select>
            </div>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
              onClick={navigateToRoomsPage}
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home"
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 flex items-center justify-center bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/50"
        style={{ backgroundImage: `url(${propertyImages[0]})` }}
      >
        <div className="container mx-auto px-6 z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {hotel?.welcomeMessage || "Experience Luxury Redefined"}
            </h1>
            
            <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={hotelName}
                    readOnly
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Check-in"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Check-out"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
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
      <section id="amenities" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Amenities</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              {hotelDescription}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {hotel?.amenities ? (
              JSON.parse(hotel.amenities).slice(0, 8).map((amenity, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getAmenityIcon(amenity.label)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{amenity.label}</h3>
                  <p className="text-gray-600">{amenity.description || 'Premium service'}</p>
                </div>
              ))
            ) : (
              [
                { icon: 'wifi', title: 'Free WiFi', desc: 'High-speed internet access' },
                { icon: 'pool', title: 'Infinity Pool', desc: 'Stunning panoramic views' },
                { icon: 'restaurant', title: 'Fine Dining', desc: 'Gourmet cuisine' },
                { icon: 'spa', title: 'Spa Services', desc: 'Relaxing treatments' }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getAmenityIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Room Preview Section */}
      <section id="rooms" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Rooms & Suites</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Experience comfort and luxury in our beautifully appointed accommodations
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Carousel showArrows={true} infiniteLoop={true} showThumbs={false} showStatus={false}>
              {rooms.length > 0 ? (
                rooms.slice(0, 3).map((room, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={room.roomImages?.[0]?.url || propertyImages[index % propertyImages.length]} 
                      alt={room.name} 
                      className="rounded-xl h-96 w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                      <p className="text-white text-xl font-semibold">{room.name}</p>
                      <p className="text-white">
                        {room.maxGuests} Guests | {room.rateType} | ${room.rate}/night
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                propertyImages.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Hotel view ${index + 1}`} 
                      className="rounded-xl h-96 w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                      <p className="text-white text-xl font-semibold">{hotelName} - View {index + 1}</p>
                    </div>
                  </div>
                ))
              )}
            </Carousel>
            <div className="text-center mt-8">
              <button 
                onClick={navigateToRoomsPage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
              >
                View All Rooms
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Gallery</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Take a visual journey through our exquisite property and facilities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {propertyImages.slice(0, 6).map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition duration-300">
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-medium">
                    View Full Image
                  </button>
                </div>
              </div>
            ))}
          </div>

          {propertyImages.length > 6 && (
            <div className="text-center mt-8">
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                onClick={() => {
                  // You can implement a lightbox or modal for full gallery view
                  alert('Full gallery view would be implemented here');
                }}
              >
                View Full Gallery
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              We'd love to hear from you. Reach out for inquiries or reservations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-indigo-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-gray-800">Address</h4>
                    <p className="text-gray-600">{hotelAddress}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaPhone className="text-indigo-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-gray-800">Phone</h4>
                    <p className="text-gray-600">{hotel?.phoneNumber || '+1 234 567 890'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaEnvelope className="text-indigo-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-gray-800">Email</h4>
                    <p className="text-gray-600">{hotel?.email || 'info@hotelluxe.com'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaClock className="text-indigo-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-gray-800">Check-in/Check-out</h4>
                    <p className="text-gray-600">{checkInTime} / {checkOutTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Send Us a Message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Subject" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Your Message" 
                    rows="4" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">{hotelName}</h3>
              <p className="mb-4">{hotelDescription}</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-indigo-400 transition duration-300">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="hover:text-indigo-400 transition duration-300">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="hover:text-indigo-400 transition duration-300">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-indigo-400 transition duration-300">Home</a></li>
                <li><a href="#rooms" className="hover:text-indigo-400 transition duration-300">Rooms</a></li>
                <li><a href="#amenities" className="hover:text-indigo-400 transition duration-300">Amenities</a></li>
                <li><a href="#gallery" className="hover:text-indigo-400 transition duration-300">Gallery</a></li>
                <li><a href="#contact" className="hover:text-indigo-400 transition duration-300">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
              <address className="not-italic">
                <p className="mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2" /> {hotelAddress}
                </p>
                <p className="mb-2 flex items-center">
                  <FaPhone className="mr-2" /> {hotel?.phoneNumber || '+1 234 567 890'}
                </p>
                <p className="mb-2 flex items-center">
                  <FaEnvelope className="mr-2" /> {hotel?.email || 'info@hotelluxe.com'}
                </p>
              </address>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
              <p className="mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-800 w-full"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r-lg"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} {hotelName}. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-indigo-400 transition duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;