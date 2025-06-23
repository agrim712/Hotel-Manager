import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Login = () => {
  const [role, setRole] = useState("SUPERADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("userRole", response.data.role);

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
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userRole");
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
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-100 rounded-full filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-100 rounded-full filter blur-xl opacity-70"></div>
        <div className="absolute top-1/4 -right-8 w-16 h-16 bg-rose-100 rounded-full filter blur-xl opacity-60"></div>

        <motion.form
          onSubmit={handleLogin}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full border border-white shadow-xl"
          whileHover={{ scale: 1.01 }}
        >
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              Sign in to your Asyncotel Admin Panel
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
                  required
                  placeholder="superadmin@asyncotel.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
                  required
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                >
                  <option className="text-gray-800" value="SUPERADMIN">Super Admin</option>
                  <option className="text-gray-800" value="HOTELADMIN">Hotel Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
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
                    animate={
                      isHovered
                        ? { scale: 1.05, transition: { duration: 0.2 } }
                        : { scale: 1 }
                    }
                  >
                    Login
                  </motion.span>
                )}
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-gray-500 text-sm"
          >
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