import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from 'axios'
import { toast } from "react-toastify";

function Login() {
  const [state, setState] = useState("sign in");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

    const { backendUrl, setIsLoggedin,getUserData } = useContext(AppContent);

    const onSubmitHandler = async (e) => {
         e.preventDefault();
      try {
       

        axios.defaults.withCredentials = true

        if (state === "sign up") {
          const {data}=await axios.post(backendUrl + '/api/auth/register',{name,email,password})

          if(data.success){
            setIsLoggedin(true);
            getUserData()
            navigate('/')
            toast.success(data.message);
          }
            else{
              toast.error(data.message);
            }
          }
         else {
          const {data}=await axios.post(backendUrl + '/api/auth/login',{email,password})

          if(data.success){
            setIsLoggedin(true);
            getUserData()
            navigate('/')
            toast.success(data.message);
          }
            else{
              toast.error(data.message);
            }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "something wrong");
      }
    };

    return (
  <div className="min-h-screen flex items-center justify-center .bg-gradient-to-br from-purple-200 to-blue-200">
    <div className="bg-white shadow-lg rounded-2xl p-8 w-[90%] max-w-md">
      {/* Logo */}
      <img src={assets.logo} alt="" className="w-20 mx-auto mb-4" />

      {/* Title */}
      <h1 className="text-2xl font-semibold text-center mb-6">
        {state === "sign up" ? "Create Account" : "Sign In"}
      </h1>

      {/* Form */}
      <form 
      onSubmit={onSubmitHandler} 
    className="space-y-4">
        {/* Name input - only sign up */}
        {state === "sign up" && (
          <div className="flex items-center gap-3 border p-3 rounded-lg">
            <img src={assets.person_icon} className="w-5" alt="" />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Enter your name"
              className="flex-1 outline-none"
            />
          </div>
        )}

        {/* Email */}
        <div className="flex items-center gap-3 border p-3 rounded-lg">
          <img src={assets.mail_icon} className="w-5" alt="" />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email} // na dile React জানে না user কী লিখলো। value দিলে React input-এর value update করে।
            type="email"
            placeholder="Enter your email"
            className="flex-1 outline-none"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 border p-3 rounded-lg">
          <img src={assets.lock_icon} className="w-5" alt="" />

          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="flex-1 outline-none"
          />

          {/* Eye toggle */}
          {showPassword ? (
            <FaEyeSlash
              className="text-green-500 text-xl cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FaEye
              className="text-red-600 text-xl cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {/* Forgot Password */}
        {state === "sign in" && (
          <p
            onClick={() => navigate("/reset-password")}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            Forgot Password?
          </p>
        )}

        {/* Submit Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all">
          {state === "sign up" ? "Sign Up" : "Sign In"}
        </button>

        {/* Toggle */}
        {state === "sign up" ? (
          <p className="text-center text-sm mt-2">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => setState("sign in")}
            >
              Sign In
            </span>
          </p>
        ) : (
          <p className="text-center text-sm mt-2">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => setState("sign up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </form>
    </div>
  </div>
    );
}

export default Login;
