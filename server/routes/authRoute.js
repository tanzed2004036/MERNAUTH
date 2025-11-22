import express from "express";
import { register, login, logout, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword, isAuthenticated } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";


const authrouter = express.Router();


authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.post("/logout", logout);
authrouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authrouter.post("/verify-account", userAuth, verifyEmail);
authrouter.get("/is-auth", userAuth, isAuthenticated);
authrouter.post("/send-reset-otp", sendResetOtp);
authrouter.post("/reset-password", resetPassword);

export default authrouter;