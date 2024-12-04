// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const hotelSchema = new Schema({
//   name: { type: String, required: true },
//   title: { type: String, required: true },
//   type: { type: String, required: true },
//   city: { type: String, required: true },
//   address: { type: String, required: true },
//   distance: { type: Number, required: true, min: 0 },
//   photos: { type: [String], required: true },
//   desc: { type: String, required: true },
//   rating: { type: Number, required: true, min: 0, max: 10 },
//   featured: { type: Boolean, default: false },
//   cheapestPrice: { type: Number, required: true, min: 1 },
//   rooms: {
//     type: [
//       {
//         type: Schema.ObjectId,
//         ref: "Room",
//         required: true,
//       },
//     ],
//     required: true,
//   },
// });

// module.exports = mongoose.model("Hotel", hotelSchema);
