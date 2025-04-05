import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/services/db.js";
import cors from "cors"
dotenv.config();
connectDB();
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://admin.myapp.com",
//   "https://dashboard.client.com"
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
import {  userRouter } from "./src/routes/index.js";
app.use("/api/admins", userRouter);
import { driverRouter } from "./src/routes/index.js";
app.use("/api/driver", driverRouter);
import { passengerRouter } from "./src/routes/index.js";
app.use("/api/passenger",passengerRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
