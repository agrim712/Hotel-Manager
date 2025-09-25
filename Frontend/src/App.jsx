import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Contact from "./Components/Contact";
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
import { RoomProvider } from './context/RoomContext';
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
import SpaManagement from './pages/SPA/Spa_Dashboard';
import BarManagement from './pages/Bar/Bar_Dashboard';
import SpaMenuManager from './pages/SPA/Spa_menu_builder';
import Reports from './pages/PMS/Reports';
import HomePage from './pages/BookingEngine/Booking';
import SearchResultsPage from './pages/BookingEngine/SearchResultsPage';
import RoomDetailPage from './pages/BookingEngine/RoomDetailPage';
import RateManagement from './pages/PMS/RateManagement';
import ExpenseManager from './pages/PMS/ExpenseManager';
import RevenueManagement from './pages/PMS/RevenueManagement'
import { ProductProvider, useProductContext } from "./context/ProductAccessContext";
import axios from 'axios';
import HousekeepingDashboard from './pages/PMS/HouseKeeping';
import OperationsDashboard from './pages/PMS/OperationsDashboard';
import SecurityManagement from './pages/PMS/SecurityManagement';
import SalesMarketing from './pages/PMS/SalesMarketing';
import EmployeeDirectory from './pages/PMS/EmployeeDirectory';
import EmployeeForm from './pages/PMS/EmployeeForm';
import AccountingDashboard from './pages/PMS/Accounting';
import FolioCreation from './pages/PMS/CustomerFolio';

// Import POS Components
import WaiterManagement from './pages/POS/WaiterManagement';
import POSDashboard from './pages/POS/POSDashboard';
import OutletsDashboard from './pages/POS/OutletsDashboard';
import OrderManagement from './pages/POS/order/OrderManagement';
import TableManagement from './pages/POS/TableManagement';
import KitchenDisplaySystem from './pages/POS/KitchenDisplaySystem';
import InventoryManagement from './pages/POS/InventoryManagement';
import MenuCreation from './pages/POS/MenuCreation';
import Billing from './pages/POS/Billing';
import RecipeCreation from './pages/POS/RecipeCreation';
import RecipeList from './pages/POS/RecipeList';
import OutletManagement from './pages/POS/OutletManagement';
import POSSettings from './pages/POS/POSSettings';

axios.defaults.baseURL = 'http://localhost:5000';

const ProductRoutes = () => {
  const { products } = useProductContext();

  // ✅ FIX: use "name" instead of "value"
  const hasProduct = (key) => {
    const found = products?.some(p => p?.name === key);
    console.log("🔎 Checking product:", key, "->", found, "Products:", products);
    return found;
  };

  // Helper functions for product groups
  const hasAnyPMS = () => hasProduct("Starter PMS") || hasProduct("Pro PMS") || hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS");
  const hasProOrEnterprisePMS = () => hasProduct("Pro PMS") || hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS");
  const hasEnterprisePMS = () => hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS");
  const hasRevenueSuite = () => hasProduct("Revenue Suite") || hasProduct("All-in-One PMS");
  const hasBookingEngineSuite = () => hasProduct("Booking Engine Suite") || hasProduct("All-in-One PMS");
  const hasPOSSuite = () => hasProduct("POS Suite") || hasProduct("All-in-One PMS");

  return (
    <Routes>
      {/* Basic PMS Features - Available in all PMS tiers */}
      {hasAnyPMS() && (
        <>
          <Route path="/pms" element={<PMS />} />
          <Route path="/pmss" element={<Pmss />}>
            <Route path="stay-view" element={<StayViewPage />} />
            <Route path="rooms-view" element={<RoomsView />} />
            <Route path="folio" element={<FolioCreation />} />
            <Route path="guests" element={<GuestListHeader />} />
          </Route>
        </>
      )}

      {/* Pro PMS and above features */}
      {hasProOrEnterprisePMS() && (
        <>
          <Route path="/pmss/reservation" element={<Reservation />} />
          <Route path="/pmss/reservation/create/regular" element={<CreateReservation />} />
          <Route path="/pmss/reservation/create/complimentary" element={<ComplimentaryReservation />} />
          <Route path="/pmss/reservation/create/outoforder" element={<OutOfOrderRoomForm />} />
          <Route path="/pmss/reservation/create/group" element={<GroupReservationForm />} />
          <Route path="/pmss/housekeeping" element={<HousekeepingDashboard />} />
          <Route path="/pmss/expenses" element={<ExpenseManager />} />
          <Route path="/pmss/reports" element={<Reports />} />
        </>
      )}

      {/* Enterprise PMS and Revenue Suite features */}
      {(hasEnterprisePMS() || hasRevenueSuite()) && (
        <>
          <Route path="/pmss/rate-management" element={<RateManagement />} />
          <Route path="/pmss/revenue-manager" element={<RevenueManagement />} />
          <Route path="/pmss/operations" element={<OperationsDashboard />} />
          <Route path="/pmss/sales" element={<SalesMarketing />} />
          <Route path="/pmss/accounting" element={<AccountingDashboard />} />
          <Route path="/pmss/security" element={<SecurityManagement />} />
          <Route path="/pmss/hr" element={<EmployeeDirectory />} />
          <Route path="/pmss/hr/employee" element={<EmployeeForm />} />
        </>
      )}

      {/* POS Suite features */}
      {hasPOSSuite() && (
        <>
          <Route path="/pmss/bar-management" element={<BarManagement />} />
          <Route path="/pmss/spa-management" element={<SpaManagement />} />
          <Route path="/spa/edit-menu" element={<SpaMenuManager />} />
          {/* Comprehensive POS Routes */}
          <Route path="/pos" element={<POSDashboard />} />
          <Route path="/pos/dashboard" element={<POSDashboard />} />
          <Route path="/pos/outlets-dashboard" element={<OutletsDashboard />} />
          <Route path="/pos/orders" element={<OrderManagement />} />
          <Route path="/pos/orders/new" element={<OrderManagement />} />
          <Route path="/pos/tables" element={<TableManagement />} />
          <Route path="/pos/waiters" element={<WaiterManagement />} />
          <Route path="/pos/kitchen" element={<KitchenDisplaySystem />} />
          <Route path="/pos/inventory" element={<InventoryManagement />} />
          <Route path="/pos/recipes" element={<RecipeCreation />} />
          <Route path="/pos/recipes/list" element={<RecipeList />} />
          <Route path="/pos/menu" element={<MenuCreation />} />
          <Route path="/pos/outlets" element={<OutletManagement />} />
          <Route path="/pos/settings" element={<POSSettings />} />
          <Route path="/pos/billing" element={<Billing />} />
          <Route path="/pos/billing/:orderId" element={<Billing />} />
          
          {/* Restaurant POS Routes */}
          <Route path="/restaurant/pos" element={<POSDashboard />} />
          <Route path="/restaurant/pos/dashboard" element={<POSDashboard />} />
          <Route path="/restaurant/pos/orders" element={<OrderManagement />} />
          <Route path="/restaurant/pos/tables" element={<TableManagement />} />
          <Route path="/restaurant/pos/kitchen" element={<KitchenDisplaySystem />} />
          <Route path="/restaurant/pos/inventory" element={<InventoryManagement />} />
          <Route path="/restaurant/pos/recipes" element={<RecipeCreation />} />
          <Route path="/restaurant/pos/recipes/list" element={<RecipeList />} />
          <Route path="/restaurant/pos/menu" element={<MenuCreation />} />
          <Route path="/restaurant/pos/outlets" element={<OutletManagement />} />
          <Route path="/restaurant/pos/billing" element={<Billing />} />
          <Route path="/restaurant/pos/billing/:orderId" element={<Billing />} />
          <Route path="/restaurant/pos/waiters" element={<WaiterManagement />} />
        </>
      )}

      {/* Booking Engine Suite features */}
      {hasBookingEngineSuite() && (
        <>
          <Route path="/booking-engine" element={<HomePage />} />
          <Route path="/booking-engine/:hotelId" element={<HomePage />} />
          <Route path="/booking-engine/search" element={<SearchResultsPage />} />
          <Route path="/booking-engine/:hotelId/room" element={<RoomDetailPage />} />
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
            <Route path="/payment" element={<Payment />} />
            
            <Route
              path="/superadmin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                  <SuperadminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/onboarded-hotels" element={<OnboardedHotels />} />
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
    <RoomProvider>
      <AppRoutes />
    </RoomProvider>
  </AuthProvider>
);

export default App;
