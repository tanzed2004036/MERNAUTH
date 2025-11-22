import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../../client/src/assets/emailTemplates.js";

dotenv.config();

export const register = async (req, res) => {
  const { name, email, password } = req.body; // Get data from client request

  // 1️⃣ Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password",
    });
  }

  try {
    // 2️⃣ Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3️⃣ Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user in database
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Generate JWT token
    const token = jwt.sign(
      { id: newUser._id }, // Payload
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: "3d" } // Token expiry
    );

    // 6️⃣ Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // JS can't access cookie
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 3 * 24 * 60 * 60 * 1000, //Token expiry (maxAge) অনুযায়ী auto logout হয়।        // 3 days in milliseconds
    });
    // sending welcome email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to our website",
      text: `Hello ${name || ""},


Thank you for joining our website! with your email id : ${email}.
We're excited to have you on board.Feel free to explore and reach out if you have any questions.
Best regards,
The Team`,
    };

    await transporter.sendMail(mailOption);

    // 7️⃣ Send response to client
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    // 8️⃣ Error handling
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  try {
    // 2️⃣ Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // 5️⃣ Send token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // 6️⃣ Send response
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // 7️⃣ Error handling
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const logout = (req, res) => {
  // 1️⃣ Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  // 2️⃣ Send response
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// send verification OTP controller
export const sendVerifyOtp = async (req, res) => {
  try {
    // const { userId } = req.body;
    // get user id from middleware
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to our website",
      // text: "Hello " + (user.name || "") + ",\n\nYour verification OTP for your account (" + user.email + ") is: " + otp + "\n\nThis OTP is valid for 1 day. Please do not share it with anyone.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Team",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}}",user.email)
    };

    await transporter.sendMail(mailOption);

    // 7️⃣ Send response to client
    res.status(201).json({
      success: true,
      message: "OTP sent to Email",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("otp not sent :", error);

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  // const { userId, otp } = req.body;
      const userId = req.userId;      // userId from middleware
    const { otp } = req.body;       // OTP from frontend

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide information & otp",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp != otp) {
      return res.status(400).json({
        success: false,
        message: "Invalis OTP",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.status(201).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// check user is authenticated or not
export const isAuthenticated = async (req, res) => {
  try {
    return res.status(201).json({
      success: true,
      message: "User is Authenticated",
      // user: req.user,     //chatgpt 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Send password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(404).json({
      success: false,
      message: "Email is Required",
    });
  }

  try {
    // 1️⃣ Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Your Password OTP",
      text: `Hello ${user.name || ""},


You requested to reset your password.
Your OTP is: ${otp}


This OTP is valid for 15 minutes. Do not share it with anyone.


If you did not request this, please ignore this email.


Best regards,
The Team`,
    };

    await transporter.sendMail(mailOption);

    // 7️⃣ Send response to client
    res.status(201).json({
      success: true,
      message: "Password Reset OTP sent to Email",
    });
  } catch (error) {
    console.error("Error sending reset OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

//Reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(404).json({
      success: false,
      message: "Email,otp,newpassword are Required",
    });
  }
  try {
    // 1️⃣ Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2️⃣ Check OTP
    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 3️⃣ Check OTP expiry
    if (Date.now() > user.resetOtpExpireAt) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired. Request a new one." });
    }

    // 4️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // 5️⃣ Clear OTP fields
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
