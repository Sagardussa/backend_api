import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import roleRoute from "./routes/role.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin:'http://localhost:4200',
    origin: process.env.LIVE_URL,
    credentials: true,
  })
);

app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

//respone handler middleware

app.use((obj, req, res, next) => {
  const statusCode = obj.status || 500;
  const message = obj.message || "Something went wrong!";

  return res.status(statusCode).json({
    success: [200, 201, 204].some((a) => (a === obj.status ? true : false)),
    status: statusCode,
    message: message,
    data: obj.data,
  });
});

//DB connection
const connectMongooDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connected to database");
  } catch (error) {
    throw error;
  }
};

app.listen(process.env.PORT || '3000', () => {
  connectMongooDB();
  console.log("connected to backend");
});
