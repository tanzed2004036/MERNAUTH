import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import authRouter from './routes/authRoute.js'
import userRouter from "./routes/userRoute.js";
              




// .env load
dotenv.config();


const app = express();                                // create application
const port = process.env.PORT || 5000


connectDB()               // mongoDB connection


app.use(express.json());                                // 👉 Frontend থেকে JSON ডাটা পাঠালে backend যাতে সেটা বুঝতে পারে।
app.use(cookieParser());                                //👉 Request এ থাকা cookies পড়ার সুবিধা দেয়।


// Middlewares
app.use(cors({
    origin: "http://localhost:5173",  // তোমার frontend URL
    credentials: true                                             //👉 Frontend (React) থেকে cookie/tokenসহ request allow করতে লাগে। credentials: true মানে cookie পাঠাতে পারবে।
}));


app.get("/", (req, res) => {
  res.send("Api working");
});

app.use("/api/auth", authRouter)  
app.use("/api/user", userRouter)

// Start Server
app.listen(5000, () => {
    console.log(`Server running on port : ${port}`);                   // server link http://localhost:5000


});
