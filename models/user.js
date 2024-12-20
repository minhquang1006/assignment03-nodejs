const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, min: 9 },
  phone: { type: String, required: true },
  role: { type: String, default: "customer" },
});

module.exports = mongoose.model("User", userSchema);
