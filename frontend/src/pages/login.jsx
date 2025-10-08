import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import Button from "../components/button";
import { toast } from "react-hot-toast";
import { Lock, User } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [empNumber, setEmpNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!empNumber || !password) {
      toast.error("Please enter both Employee ID and Password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login(empNumber, password);
      const { accessToken, ...userData } = response.data;

      login(userData, accessToken);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-500 to-gray-100 font-sans">
      <div className="bg-white max-w-md w-11/12 p-8 rounded-2xl shadow-lg text-center animate-[cardEnter_0.5s_ease]">
        <img src="/logo.png" alt="Logo" className="w-24 mb-4 mx-auto" />

        <h1 className="mb-4 text-4xl font-bold ">
          <span className="text-black">Log</span>
          <span className="text-[#ff6600]">In</span>
        </h1>

        {/* Employee ID Input */}
        <div className="relative my-3">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
          <input
            type="text"
            value={empNumber}
            onChange={(e) => setEmpNumber(e.target.value)}
            placeholder="Employee ID"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-base bg-gray-100 focus:border-[#ff6600] focus:bg-white outline-none transition"
          />
        </div>

        {/* Password Input */}
        <div className="relative my-3">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-base bg-gray-100 focus:border-[#ff6600] focus:bg-white outline-none transition"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <Button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <p className="mt-4">
          Forgot Password?{" "}
          <span
            className="text-[#ff6600] font-medium cursor-pointer hover:text-[#cc3500] transition"
            onClick={() => toast.info("Contact your administrator")}
          >
            Click here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;