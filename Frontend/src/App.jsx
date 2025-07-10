import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Contact from "./components/Contact";
import PMS from "./components/PMS";
import BookingEngine from "./components/BookingEngine";
import Onboard from "./components/Onboard";
import Navbar from './Components/Navbar';
import Login from "./Components/Login";
import SuperadminDashboard from './pages/SuperadminDashboard';
import CreateHotelAdmin from './Components/CreateHotelAdmin';
import HoteladminDashboard from './pages/HoteladminDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Payment from './Components/Payment';
import { useAuth, AuthProvider } from "./context/AuthContext";
import Pmss from './pages/PMS/Pmss';
import Reservation from './pages/PMS/Reservation';
import CreateReservation from './pages/PMS/CreateReservation';
import ComplimentaryReservation from './pages/PMS/Complimentary';
import OutOfOrderRoomForm from './pages/PMS/OutOfOrder';
import GroupReservationForm from "./pages/PMS/GroupReservation";
import GuestListHeader from './pages/PMS/Guests';
import StayViewPage from './pages/PMS/stayview';
import RoomsView from './pages/PMS/RoomsView';
import OnboardedHotels from './pages/SuperAdmin/OnboardedHotels';
import './index.css';
import { ReservationProvider } from './context/ReservationContext';
import RestaurantManagement from './pages/Resturant/Resturant_dashboard';
import MenuBuilder from './pages/Resturant/MenuBuilder';
import SpaManagement from './pages/SPA/Spa_Dashboard';
import BarManagement from './pages/Bar/Bar_Dashboard';
import SpaMenuManager from './pages/SPA/Spa_menu_builder';
import Reports from './pages/PMS/Reports';
import HomePage from './pages/BookingEngine/Booking';
import SearchResultsPage from './pages/BookingEngine/SearchResultsPage';
import RoomDetailPage from './pages/BookingEngine/RoomDetailPage';
import RateManagement from './pages/PMS/RateManagement';
import ExpenseManager from './pages/PMS/ExpenseManager';
import { ProductProvider, useProductContext } from "./context/ProductAccessContext";
// In your axios configuration file or App.js
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
const ProductRoutes = () => {
  const { products } = useProductContext();

  const hasProduct = (key) => {
    return products.some(p => p?.value === key);
  };

  return (
    <Routes>
      {hasProduct("PMS") && (
        <>
          <Route path="/pms" element={<PMS />} />
          <Route path="/pmss" element={<Pmss />}>
            <Route path="reservation" element={<Reservation />} />
            <Route path="reservation/create/regular" element={<CreateReservation />} />
            <Route path="stay-view" element={<StayViewPage />} />
            <Route path="rooms-view" element={<RoomsView />} />
            <Route path="reports" element={<Reports />} />
             <Route path="expenses" element={<ExpenseManager />} />
          </Route>
          <Route path="/pmss/reservation/create/complimentary" element={<ComplimentaryReservation />} />
          <Route path="/pmss/reservation/create/outoforder" element={<OutOfOrderRoomForm />} />
          <Route path="/pmss/reservation/create/group" element={<GroupReservationForm />} />
          <Route path="/pmss/guests" element={<GuestListHeader />} />
          <Route path="/pmss/rate-management" element={<RateManagement />} />
        </>
      )}

      {hasProduct("Bar Management") && (
        <Route path="/pmss/bar-management" element={<BarManagement />} />
      )}

      {hasProduct("Spa Management") && (
        <>
          <Route path="/pmss/spa-management" element={<SpaManagement />} />
          <Route path="/spa/edit-menu" element={<SpaMenuManager />} />
        </>
      )}

      {hasProduct("Restaurant Management") && (
        <>
          <Route path="/pmss/restaurant-management" element={<RestaurantManagement />} />
          <Route path="/restaurant/edit-menu" element={<MenuBuilder />} />
        </>
      )}
    </Routes>
  );
};


const AppRoutes = () => {
  const { loading, isLoggedIn, userRole, logout } = useAuth();

  if (loading) {
    return <div className="text-white text-center p-10 text-xl">Loading...</div>;
  }

  return (
    <ReservationProvider>
      <BrowserRouter>
        <ProductProvider>
          <Navbar
            isLoggedIn={isLoggedIn}
            onLogout={logout}
            isSuperadmin={userRole === "SUPERADMIN"}
          />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/onboard" element={<Onboard />} />
            <Route path="/login" element={<Login />} />
  <Route path="/booking-engine" element={<HomePage />} />
  <Route path="/booking-engine/:hotelId" element={<HomePage />} />
  <Route path="/booking-engine/search" element={<SearchResultsPage />} />
  <Route path="/booking-engine/room" element={<RoomDetailPage />} />
            <Route
              path="/superadmin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                  <SuperadminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/onboarded-hotels" element={<OnboardedHotels />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/create-hotel-admin" element={<CreateHotelAdmin />} />

            <Route
              path="/hoteladmin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["HOTELADMIN"]}>
                  <HoteladminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/*" element={<ProductRoutes />} />
          </Routes>
        </ProductProvider>
      </BrowserRouter>
    </ReservationProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
