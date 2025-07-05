import React from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaHotel, FaQuestionCircle, FaMoneyCheckAlt, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "../Components/Navbar";

const features = [
  {
    title: "Create Hotel Admin",
    description: "Add a new hotel admin to onboard a property.",
    link: "/create-hotel-admin",
    color: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    icon: <FaUserPlus className="text-fuchsia-100" size={24} />,
    pattern: "pattern-circuit-board-fuchsia-500/20",
    hover: "hover:shadow-[0_20px_50px_rgba(217,70,239,0.3)]"
  },
  {
    title: "Onboarded Hotels",
    description: "View all onboarded hotels and their statuses.",
    link: "/onboarded-hotels",
    color: "bg-gradient-to-br from-cyan-400 to-blue-600",
    icon: <FaHotel className="text-cyan-100" size={24} />,
    pattern: "pattern-float-cyan-500/20",
    hover: "hover:shadow-[0_20px_50px_rgba(34,211,238,0.3)]"
  },
  {
    title: "User Queries",
    description: "Manage and respond to support or inquiry tickets.",
    link: "/queries",
    color: "bg-gradient-to-br from-emerald-400 to-green-600",
    icon: <FaQuestionCircle className="text-emerald-100" size={24} />,
    pattern: "pattern-wiggle-emerald-500/20",
    hover: "hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
  },
  {
    title: "Payments",
    description: "Track and manage hotel subscription payments.",
    link: "/payments",
    color: "bg-gradient-to-br from-amber-400 to-yellow-600",
    icon: <FaMoneyCheckAlt className="text-amber-100" size={24} />,
    pattern: "pattern-diagonal-stripes-amber-500/20",
    hover: "hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
  },
  {
    title: "Revenue Report",
    description: "View total earnings and revenue breakdowns.",
    link: "/revenue-report",
    color: "bg-gradient-to-br from-violet-500 to-purple-800",
    icon: <FaChartLine className="text-violet-100" size={24} />,
    pattern: "pattern-bricks-violet-600/20",
    hover: "hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
  },
];

const SuperadminDashboard = () => {
  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      

      <div className="p-6 font-sans overflow-hidden">
        {/* Background elements */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          </div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-overlay opacity-10 filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600 rounded-full mix-blend-overlay opacity-10 filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-12 tracking-tight"
          >
            Command Center
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, link, color, icon, pattern, hover, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
  >
    <Link
      to={link}
      className={`relative overflow-hidden rounded-2xl p-6 h-full flex flex-col ${color} ${hover} transition-all duration-300 shadow-lg group`}
    >
      <div className={`absolute inset-0 ${pattern} opacity-30`}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mb-4">{description}</p>
        <div className="mt-auto pt-4 border-t border-white/10">
          <span className="text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">
            Explore →
          </span>
        </div>
      </div>
      
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/30 to-white/0 group-hover:from-white/50 group-hover:to-white/10 transition-all duration-300">
        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white/5 to-white/0"></div>
      </div>
    </Link>
  </motion.div>
);

export default SuperadminDashboard;