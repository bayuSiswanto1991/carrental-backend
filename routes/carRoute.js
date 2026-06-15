const express = require("express");
const router = express.Router();
const Car = require("../models/carModel");

// ─────────────────────────────────────
// GET ALL CARS
// GET /api/cars
// ─────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find({ isAvaliable: true }).populate("owner", "name email image").sort({ createdAt: -1 });

    res.json({ success: true, cars });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// GET CAR BY ID
// GET /api/cars/:id
// ─────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("owner", "name, email, image");

    if (!car) {
      return res.json({ success: false, message: "Mobil tidak ditemukan" });
    }

    res.json({ success: true, car });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
