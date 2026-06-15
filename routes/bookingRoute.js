const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");
const authUser = require("../middleware/authUser");

// ─────────────────────────────────────
// CREATE BOOKING
// POST /api/booking
// ─────────────────────────────────────
router.post("/", authUser, async (req, res) => {
  try {
    const { carId, pickupDate, returnDate, pickupLocation, returnLocation } = req.body;

    // cari mobil
    const car = await Car.findById(carId);
    if (!car) {
      return res.json({ success: false, message: "Mobil tidak ditemukan!" });
    }

    // hitung total hari
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));

    // hitung total harga
    const price = car.pricePerDay * totalDays;

    // buat booking
    const booking = await Booking.create({
      car: carId,
      user: req.userId,
      owner: car.owner,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      totalDays,
      price,
      status: "pending",
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// GET BOOKINGS
// GET /api/booking/my
// ─────────────────────────────────────
router.get("/my", authUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate("car").populate("owner", "name email image").sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
