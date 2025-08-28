import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const fetchHotelDetails = async () => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("userRole");

      if (!token || !storedRole) {
    setLoading(false);
    return; // Add missing closing brace
  }

    setToken(token); // Set token before making the request

    try {
      const res = await axios.get("http://localhost:5000/api/hotel/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsLoggedIn(true);
      setUserRole(storedRole);
      setHotel(res.data.hotel);
    } catch (err) {
      console.error("Failed to fetch hotel details:", err);
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
        token,
        setIsLoggedIn,
        setUserRole,
        setHotel,
        fetchHotelDetails,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);