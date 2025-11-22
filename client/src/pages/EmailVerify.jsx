import React, { useContext, useEffect, useRef } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContent);

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

    // Keep only digits
    const pasteArray = paste.split("");

    // if (digits.length === 0) return;

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

    // Move focus to the last filled box
    // const lastIndex = Math.min(digits.length - 1, inputRefs.current.length - 1);
    // inputRefs.current[lastIndex].focus();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Collect OTP from all inputs
    const otpArray = inputRefs.current.map((e) => e.value);
    const otp = otpArray.join("");

    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        {
          otp,
        }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/"); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };


  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin,userData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
    <h2 className="text-2xl font-semibold mb-4 text-center">
      Verify Your Email
    </h2>

    <p className="text-center mb-6">
      Enter the 6-digit OTP sent to your email
    </p>

    {/* 🟦 FORM STARTS HERE */}
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center gap-6 w-full">

      {/* OTP INPUTS */}
      <div
        onPaste={handlePaste}
        className="flex gap-3 justify-center w-full"
      >
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

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg 
        hover:bg-blue-700 transition-all"
      >
        Verify Email
      </button>
    </form>
    {/* 🟦 FORM ENDS */}
  </div>
</div>

  );
};

export default EmailVerify;
