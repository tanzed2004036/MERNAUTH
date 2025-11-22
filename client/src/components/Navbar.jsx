import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();

  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent);

  // send verification otp
  const sendVerificationOtp = async () => {
    try {
        axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp"
        // , {withCredentials: true,  }
    );
      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  // logout function
  const logout = async () => {
        try {
           axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/auth/logout");
            data.success && setIsLoggedin(false);
            data.success && setUserData(false);
            navigate('/')
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        }
    };


  return (
    <div className="w-full flex justify-between items-center p-2 sm:p-3 sm:px-24 absolute top-0 from-gray-900 via-gray-800 to-black shadow-2xl shadow-black/60">
      <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />

      {/* After login round letter */}
      {userData ? (
        <div className="relative inline-flex items-center gap-4">
          {/* Avatar group */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold cursor-pointer">
              {userData.name[0].toUpperCase()}
            </div>

            {/* Verify email text */}
            {!userData.isAccountVerified && 
              <div onClick={sendVerificationOtp} className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-amber-950 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all whitespace-nowrap hover:bg-gray-800 cursor-pointer">
                Verify email
              </div>
            }
          </div>

          {/* Logout icon */}
          <FiLogOut 
          onClick={logout}
            className="w-6 h-6 cursor-pointer hover:text-red-500"
            title="Logout"
          />
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login
          <img src={assets.arrow_icon} alt="Arrow Icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
