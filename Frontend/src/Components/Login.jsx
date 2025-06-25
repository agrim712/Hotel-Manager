import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useProductContext } from "../context/ProductAccessContext"; // ✅ Add this

const Login = () => {
  const [role, setRole] = useState("SUPERADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { setProducts } = useProductContext(); // ✅ Get context updater

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

      const { token, role: userRole, products = [], isPaymentDone } = response.data;

      if (!token) throw new Error("No token received from server");

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", userRole);

      if (userRole === "HOTELADMIN") {
        localStorage.setItem("products", JSON.stringify(products));
        setProducts(products); // ✅ Immediate context update
      }

      const redirectPath =
        userRole === "SUPERADMIN"
          ? "/superadmin-dashboard"
          : isPaymentDone
          ? "/pmss"
          : "/hoteladmin-dashboard";

      navigate(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error || err.message || "Login failed");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-amber-50 to-rose-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <motion.form
          onSubmit={handleLogin}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full border border-white shadow-xl"
          whileHover={{ scale: 1.01 }}
        >
          <div className="text-center mb-8">
            <motion.h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </motion.h2>
            <motion.p className="text-gray-600">
              Sign in to your Asyncotel Admin Panel
            </motion.p>
          </div>

          {error && (
            <motion.div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                placeholder="superadmin@asyncotel.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="SUPERADMIN">Super Admin</option>
                <option value="HOTELADMIN">Hotel Admin</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 shadow-lg"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <motion.span
                    animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                  >
                    Login
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          <motion.div className="mt-6 text-center text-gray-500 text-sm">
            <p>
              By continuing, you agree to Asyncotel's{" "}
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
