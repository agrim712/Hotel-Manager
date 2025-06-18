import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from 'react';
import Home from "./components/Home";
import Contact from "./components/Contact";
import PMS from "./components/PMS";
import ChannelManager from "./components/ChannelManager";
import RMS from "./Components/RMS";
import BookingEngine from "./components/BookingEngine";
import Onboard from "./components/Onboard";
import Navbar from './Components/Navbar';
import Login from "./Components/Login";
import SuperadminDashboard from './pages/SuperadminDashboard';
import CreateHotelAdmin from './Components/CreateHotelAdmin';
import HoteladminDashboard from './pages/HoteladminDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Payment from './Components/Payment';
import Pmss from './pages/PMS/Pmss';
import Reservation from './pages/PMS/Reservation';
import CreateReservation from './pages/PMS/CreateReservation';
import ComplimentaryReservation from './pages/PMS/Complimentary';
import OutOfOrderRoomForm from './pages/PMS/OutOfOrder';
import GroupReservationForm from "./pages/PMS/GroupReservation";
import GuestListHeader from './pages/PMS/Guests';
import StayViewPage from './pages/PMS/stayview'; // ✅ newly added
import RoomsView from './pages/PMS/RoomsView';

import './index.css';
import { ReservationProvider } from './context/ReservationContext';
import RestaurantManagement from './pages/Resturant/Resturant_dashboard';
import MenuBuilder from './pages/Resturant/MenuBuilder';
import SpaManagement from './pages/SPA/Spa_Dashboard';
import BarManagement from './pages/Bar/Bar_Dashboard';
import SpaMenuManager from './pages/SPA/Spa_menu_builder';
import Reports from './pages/PMS/Reports';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [hotelName, setHotelName] = useState("Grand Plaza");

const handleLogout = () => {
  setIsLoggedIn(false);
  // Add your logout logic here
    localStorage.removeItem('Token');
        localStorage.removeItem('userData');
    setIsLoggedIn(false);
    navigate('/login');
};
  return (
    <ReservationProvider>
      <BrowserRouter>
          <Navbar 
    isLoggedIn={isLoggedIn} 
    hotelName={hotelName} 
    onLogout={handleLogout} 
  />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<h2 className="p-10">News Page</h2>} />
          <Route path="/products" element={<h2 className="p-10">Our Products Page</h2>} />
          <Route path="/blog" element={<h2 className="p-10">Blog Page</h2>} />
          <Route path="/pricing" element={<h2 className="p-10">Pricing Page</h2>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/superadmin-dashboard" element={<SuperadminDashboard />} />
          <Route 
            path="/hoteladmin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['HOTELADMIN']}>
                <HoteladminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/payment" element={<Payment />} />
          <Route path="/create-hotel-admin" element={<CreateHotelAdmin />} />
          
          {/* Product pages */}
          <Route path="/pms" element={<PMS />} />
          <Route path="/channel-manager" element={<ChannelManager />} />
          <Route path="/rms" element={<RMS />} />
          <Route path="/booking-engine" element={<BookingEngine />} />

          {/* PMSS Routes */}
          <Route path="/pmss" element={<Pmss />}>
            <Route path="reservation" element={<Reservation />} />
            <Route path="reservation/create/regular" element={<CreateReservation />} />
            <Route path="stay-view" element={<StayViewPage />} /> {/* ✅ added */}
            <Route path="rooms-view" element={<RoomsView />} />
            <Route path="reports" element={<Reports />} />


          </Route>

          {/* Additional PMS pages not inside nested outlet */}
          <Route path="/pmss/reservation/create/complimentary" element={<ComplimentaryReservation />} />
          <Route path="/pmss/reservation/create/outoforder" element={<OutOfOrderRoomForm />} />
          <Route path="/pmss/reservation/create/group" element={<GroupReservationForm />} />
          <Route path="/pmss/guests" element={<GuestListHeader />} />

          <Route path="/restaurant/edit-menu" element={<MenuBuilder></MenuBuilder>} />
          <Route path="/spa/edit-menu" element={<SpaMenuManager></SpaMenuManager>} />
          <Route path="/pmss/restaurant-management" element={<RestaurantManagement></RestaurantManagement>} />
          <Route path="/pmss/spa-management" element={<SpaManagement></SpaManagement>} />
          <Route path="/pmss/bar-management" element={<BarManagement />} />
        </Routes>
      </BrowserRouter>
    </ReservationProvider>
  );
};

export default App;
