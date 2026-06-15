const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "owner"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
