const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({ success: false, message: "Tidak ada token!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "owner") {
      return res.json({ success: false, message: "Akses ditolak! Bukan owner" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.json({ success: false, message: "Token tidak valid" });
  }
};

module.exports = authOwner;
