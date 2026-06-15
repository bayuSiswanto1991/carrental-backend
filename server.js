require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoute = require("./routes/authRoute");
const carRoutes = require("./routes/carRoute");
const bookingRoute = require("./routes/bookingRoute");
const ownerRoute = require("./routes/ownerRoute");

app.use("/api/auth", authRoute);
app.use("/api/cars", carRoutes);
app.use("/api/booking", bookingRoute);
app.use("/api/owner", ownerRoute);

// error hendler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// connect MongoDB + start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connectes");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("Error", err.message);
    process.exit(1);
  }
};

startServer();
