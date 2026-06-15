const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.ObjectId,
      ref: "Car",
      require: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    pickupDate: {
      type: Date,
      require: true,
    },
    returnDate: {
      type: Date,
      require: true,
    },
    pickupLocation: {
      type: String,
      require: true,
    },
    returnLocation: {
      type: String,
      require: true,
    },
    totalDays: {
      type: Number,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
