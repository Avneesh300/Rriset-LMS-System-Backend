
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({
  path: "./.env",
});
const path = require("path");
const mainRouter = require("./grouproute/mainRoute");


const connectDB = require("./config/db");


const app = express();

// Database Connect
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


app.use("/api/v1", mainRouter);

// Test Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use((error, req, res, next) => {
  console.log("ERROR => ", error);

  return res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
    error: error,
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});