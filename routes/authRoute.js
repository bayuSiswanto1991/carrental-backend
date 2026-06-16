const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authUser = require("../middleware/authUser");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const ImageKit = require("imagekit");

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

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

// ─────────────────────────────────────
// UPDATE PROFILE
// PUT /api/auth/profile
// ─────────────────────────────────────
router.put(
  "/profile",
  authUser,
  upload.single("image"), // ← middleware 1
  async (req, res) => {
    // ← middleware 2 (handler)
    try {
      const { name } = req.body;
      let imageUrl = undefined;

      if (req.file) {
        const uploadResponse = await imageKit.upload({
          file: req.file.buffer,
          fileName: `user_${Date.now()}`,
          folder: "/users",
        });
        imageUrl = uploadResponse.url;
      }

      const updateData = { name };
      if (imageUrl) updateData.image = imageUrl;

      const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");

      res.json({ success: true, user });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
