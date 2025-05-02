import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [role, setRole] = useState("SUPERADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password, role },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
  
      if (!response.data.token) {
        throw new Error("No token received from server");
      }
  
      // Store auth data
      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("userRole", response.data.role);
  
      // Determine where to redirect
      const redirectPath =
        response.data.role === "SUPERADMIN"
          ? "/superadmin-dashboard"
          : response.data.isPaymentDone
            ? "/pmss"
            : "/hoteladmin-dashboard";
  
      navigate(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error || err.message || "Login failed");
  
      // Clear any partial storage
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userRole");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
          Asyncotel Admin Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            required
            placeholder="superadmin@asyncotel.com"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            required
            placeholder="Admin@1234"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="SUPERADMIN">Super Admin</option>
            <option value="HOTELADMIN">Hotel Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition duration-200 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;