import React from "react";
import { Link } from "react-router-dom";
import Contact from "./Contact";
import { motion } from "framer-motion";
import { FaHotel, FaChartLine, FaGlobe, FaExchangeAlt, FaRegCheckCircle, FaMoneyBillWave, FaUserTie } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Revolutionize Your Hotel Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Asyncotel is the all-in-one cloud solution that boosts revenue while reducing operational costs.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10"
            >
              <Link to="/onboard">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started - It's Free
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why Choose Asyncotel?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaRegCheckCircle className="text-blue-500 text-4xl" />,
                title: "Intuitive Interface",
                desc: "Designed for efficiency with minimal training required"
              },
              {
                icon: <FaMoneyBillWave className="text-green-500 text-4xl" />,
                title: "Cost Effective",
                desc: "Save 40% compared to traditional systems"
              },
              {
                icon: <FaHotel className="text-purple-500 text-4xl" />,
                title: "All-In-One Solution",
                desc: "Every module you need in a single platform"
              },
              {
                icon: <FaUserTie className="text-amber-500 text-4xl" />,
                title: "By Hoteliers, For Hoteliers",
                desc: "Built with real-world operational insights"
              },
              {
                icon: <FaChartLine className="text-red-500 text-4xl" />,
                title: "Smart Revenue Tools",
                desc: "Dynamic pricing that maximizes your profits"
              },
              {
                icon: <FaGlobe className="text-cyan-500 text-4xl" />,
                title: "Global Reach",
                desc: "Connect to hundreds of distribution channels"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-gray-800 mb-12"
        >
          Our Powerful Modules
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              path: "/pms",
              title: "Property Management System",
              desc: "Complete front desk operations",
              color: "from-blue-500 to-blue-600"
            },
            {
              path: "/channel-manager",
              title: "Channel Manager",
              desc: "Real-time inventory distribution",
              color: "from-green-500 to-green-600"
            },
            {
              path: "/rms",
              title: "Revenue Management System",
              desc: "AI-powered dynamic pricing",
              color: "from-purple-500 to-purple-600"
            },
            {
              path: "/booking-engine",
              title: "Booking Engine",
              desc: "Direct bookings with zero commission",
              color: "from-amber-500 to-amber-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <Link 
                to={feature.path} 
                className={`block bg-gradient-to-br ${feature.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all h-full`}
              >
                <div className="flex items-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    {feature.path === "/pms" && <FaHotel size={24} />}
                    {feature.path === "/channel-manager" && <FaExchangeAlt size={24} />}
                    {feature.path === "/rms" && <FaChartLine size={24} />}
                    {feature.path === "/booking-engine" && <FaGlobe size={24} />}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-white/90">{feature.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Contact />
      </div>
    </div>
  );
};

export default Home;