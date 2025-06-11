import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Contact from "./components/Contact";
import PMS from "./components/PMS";
import ChannelManager from "./components/ChannelManager";
import RMS from "./Components/RMS";
import BookingEngine from "./components/BookingEngine";
import Onboard from "./components/Onboard";
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

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-red-500 w-full h-16 px-10 text-white">
      <Link className="text-xl font-bold" to="/">Asyncotel</Link>
      <div className="flex space-x-8">
        <Link to="/">HOME</Link>
        <Link to="/news">NEWS</Link>
        <Link to="/products">OUR PRODUCTS</Link>
        <Link to="/blog">BLOG</Link>
        <Link to="/pricing">PRICING</Link>
        <Link to="/contact">CONTACT US</Link>
        <Link to="/login">LOGIN</Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <ReservationProvider>
      <BrowserRouter>
        <Navbar />
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

          </Route>

          {/* Additional PMS pages not inside nested outlet */}
          <Route path="/pmss/reservation/create/complimentary" element={<ComplimentaryReservation />} />
          <Route path="/pmss/reservation/create/outoforder" element={<OutOfOrderRoomForm />} />
          <Route path="/pmss/reservation/create/group" element={<GroupReservationForm />} />
          <Route path="/pmss/guests" element={<GuestListHeader />} />
        </Routes>
      </BrowserRouter>
    </ReservationProvider>
  );
};

export default App;
