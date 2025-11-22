import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
}, { timestamps: true });

// Export model (prevent model overwrite on hot reload in Next.js or Nodemon)
// userModel = যদি আগেই User model থাকে → use that না হলে → নতুন User model create করো code reload er somoy kaje lage  

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;



