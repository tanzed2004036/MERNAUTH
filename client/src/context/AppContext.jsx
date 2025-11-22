import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials=true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  // check authenticated or not
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth"
        // , {withCredentials: true,}
    );
      if (data.success) {
        setIsLoggedin(true);
        await getUserData();
      }
    } catch (error) {
      console.log("Auth error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  // user data লোড
  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data"
        // , {withCredentials: true,  }
    );
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getAuthState(); //Component লোড হওয়ার পর getAuthState() ফাংশন কল করবে। অর্থাৎ page load হওয়ার সাথে সাথে ইউজারের login state চেক করবে।
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
  );
};
