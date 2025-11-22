import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

   // const user = await userModel.findById(userId).select("-password -verifyOtp -resetPasswordOtp"); // password, OTP fields hide করা হলো
     const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      userData:{
        name:user.name,
        isAccountVerified: user.isAccountVerified
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Optional: check if admin (if you have a role field)
    // if (req.body.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }

    const users = await userModel.find().select("-password -verifyOtp -resetPasswordOtp");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};