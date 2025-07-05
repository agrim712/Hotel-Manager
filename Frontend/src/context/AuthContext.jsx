import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new

  const fetchHotelDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/hotel/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLoggedIn(true);
      setUserRole(localStorage.getItem("userRole"));
      setHotel(res.data.hotel);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setHotel(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userRole,
        hotel,
        setIsLoggedIn,
        setUserRole,
        setHotel, // ✅ exposed so Login can call it
        fetchHotelDetails,
        logout,
        loading, // ✅
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
