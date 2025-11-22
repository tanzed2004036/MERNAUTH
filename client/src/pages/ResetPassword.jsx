import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { AppContent } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setisEmailSent] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        {
          email,
        }
      );

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setisEmailSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

   const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp( otpArray.join(""));
    setIsOtpSubmitted(true)

  
  };
   const onSubmitNewPassword = async (e) => {
     e.preventDefault();

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/"); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  
  };
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md shadow-lg px-8 py-10 rounded-2xl">
        {/* -------------------- EMAIL FORM -------------------- */}
        {!isEmailSent && (
          <form onSubmit={onSubmitEmail} className="space-y-5 text-center">
            <h1 className="text-3xl font-semibold">Reset Password</h1>
            <p className="text-gray-600">Enter your registered email</p>

            <div className="flex items-center gap-3 border p-3 rounded-lg">
              <img src={assets.mail_icon} className="w-5" alt="" />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Enter your email"
                className="flex-1 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg  
              hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </form>
        )}

        {/* -------------------- OTP FORM -------------------- */}
        {!isOtpSubmited && isEmailSent && (
          <form 
          onSubmit={onSubmitOtp}
          className="flex flex-col items-center gap-6 w-full text-center">
            <h2 className="text-2xl font-semibold">Verify OTP</h2>
            <p className="text-gray-600">Enter the 6-digit OTP sent to email</p>

            <div onPaste={handlePaste} className="flex gap-3 justify-center">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onInput={(e) => handleInput(e, index)}
                    ref={(e) => (inputRefs.current[index] = e)}
                    className="w-12 h-12 text-center border rounded-lg text-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg  
              hover:bg-blue-700 transition"
            >
              Submit OTP
            </button>
          </form>
        )}

        {/* -------------------- NEW PASSWORD FORM -------------------- */}
        {isOtpSubmited && isEmailSent && (
          <form onSubmit={onSubmitNewPassword} className="space-y-5 text-center">
            <h1 className="text-2xl font-semibold">Enter New Password</h1>

            <div className="flex items-center gap-3 border p-3 rounded-lg">
              <img src={assets.lock_icon} className="w-5" alt="" />

              <input
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="flex-1 outline-none"
              />

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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg  
              hover:bg-blue-700 transition"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
