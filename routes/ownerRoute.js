const express = require("express");
const router = express.Router();
const Car = require("../models/carModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const authOwner = require("../middleware/authOwner");
const ImageKit = require("imagekit");
const multer = require("multer");

// setup ImageKit
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// setup multer (simpan di memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ─────────────────────────────────────
// ADD CAR
// POST /api/owner/car
// ─────────────────────────────────────
router.post("/car", authOwner, upload.single("image"), async (req, res) => {
  try {
    const { brand, model, year, category, seating_capacity, fuel_type, transmission, pricePerDay, location, description, features, image } = req.body;

    // upload foto ke Image Kit
    const uploadRespose = await imageKit.upload({
      file: req.file.buffer,
      fileName: `car_${Date.now()}`,
      folder: "/cars",
    });

    // buat car baru
    const car = await Car.create({
      owner: req.userId,
      brand,
      model,
      year: Number(year),
      category,
      seating_capacity: Number(seating_capacity),
      fuel_type,
      transmission,
      pricePerDay: Number(pricePerDay),
      location,
      description,
      features: features ? (typeof features === "string" ? JSON.parse(features) : features) : [],
      image: uploadRespose.url,
    });

    res.json({ success: true, car });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// GET OWNER CARS
// GET /api/owner/cars
// ─────────────────────────────────────
router.get("/cars", authOwner, async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.userId }).sort({ createdAt: -1 });

    res.json({ success: true, cars });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// DELETE CAR
router.delete("/car/:id", authOwner, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "mobil berhasil dihapus!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// TOGGLE AVAILABLE
router.put("/car/:id", authOwner, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    car.isAvaliable = !car.isAvaliable;
    await car.save();
    res.json({ success: true, car });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// GET OWNER BOOKINGS
// GET /api/owner/bookings
// ─────────────────────────────────────
router.get("/bookings", authOwner, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.userId }).populate("car").populate("user", "name email image").sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// UPDATE BOOKING STATUS
// PUT /api/owner/booking/:id
// ─────────────────────────────────────
router.put("/booking/:id", authOwner, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });

    res.json({ success: true, booking });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// DASHBOARD
// GET /api/owner/dashboard
// ─────────────────────────────────────
router.get("/dashboard", authOwner, async (req, res) => {
  try {
    const totalCars = await Car.countDocuments({ owner: req.userId });
    const totalBookings = await Booking.countDocuments({ owner: req.userId });
    const pendingBookings = await Booking.countDocuments({
      owner: req.userId,
      status: "pending",
    });
    const completedBookings = await Booking.countDocuments({
      owner: req.userId,
      status: "completed",
    });
    const recentBookings = await Booking.find({ owner: req.userId }).populate("car").populate("user", "name email").sort({ createdAt: -1 }).limit(5);
    const revenueData = await Booking.aggregate([{ $match: { owner: req.userId, status: "completed" } }, { $group: { _id: null, total: { $sum: "$price" } } }]);
    const monthlyRevenue = revenueData[0]?.total || 0;

    res.json({
      success: true,
      dashData: {
        totalCars,
        totalBookings,
        pendingBookings,
        completedBookings,
        recentBookings,
        monthlyRevenue,
      },
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
