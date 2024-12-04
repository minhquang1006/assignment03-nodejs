// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const transactionSchema = new Schema({
//   user: {
//     type: {
//       email: String,
//       fullName: String,
//       phoneNumber: String,
//       cardNumber: String,
//     },
//     required: true,
//   },
//   hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
//   rooms: {
//     type: [
//       {
//         roomID: { type: Schema.ObjectId, ref: "Room", required: true },
//         roomOrder: [{ type: String, required: true }],
//       },
//     ],
//     required: true,
//   },
//   dateStart: { type: Date, required: true }, // Check-in date
//   dateEnd: { type: Date, required: true }, // Check-out date
//   totalBill: { type: Number, required: true }, // Price of booking
//   paymentMethod: { type: String, required: true }, // Payment method
//   status: { type: String, default: "Booked", required: true }, // Status of booking
// });

// module.exports = mongoose.model("Transaction", transactionSchema);
