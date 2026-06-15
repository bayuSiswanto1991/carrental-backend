const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authUser = require("../middleware/authUser");

// ─────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // cek email sudah ada
    const exitingUser = await User.findOne({ email });
    if (exitingUser) {
      return res.json({ success: false, message: "Email sudah terdaftar" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // buat user baru
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // buat token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // cek user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email tidak terdaftar!" });
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Password salah!" });
    }

    // buat token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────
// GET MY PROFILE
// GET api/auth/me
// ─────────────────────────────────────
router.get("/me", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────
// UPGRADE ROLE
// PUT api/auth/upgrade
// ─────────────────────────────────────

router.put("/upgrade", authUser, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { role: "owner" }, { new: true });

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
