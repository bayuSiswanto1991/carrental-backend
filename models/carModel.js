const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    brand: {
      type: String,
      require: true,
    },
    model: {
      type: String,
      require: true,
    },
    year: {
      type: Number,
      require: true,
    },
    category: {
      type: String,
      enum: ["Economy", "Luxury", "SUV", "Sedan"],
      require: true,
    },
    seating_capacity: {
      type: Number,
      require: true,
    },
    fuel_type: {
      type: String,
      enum: ["Gasoline", "Diesel", "Hybrid", "Electric"],
      require: true,
    },
    transmission: {
      type: String,
      enum: ["Automatic", "Manual", "Semi-Automatic"],
      require: true,
    },
    pricePerDay: {
      type: Number,
      require: true,
    },
    location: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      require: true,
    },
    isAvaliable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Car", carSchema);
