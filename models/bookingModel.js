const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  flight_id: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  passengerEmail: {
    type: String,
    required: true,
  },
  passengerPhone: {
    type: String,
    required: true,
  },
  bookedcount: {
    firstClassCount: {
      type: Number,
      required: true,
    },
    economicClassCount: {
      type: Number,
      required: true,
    },
    businessClassCount: {
      type: Number,
      required: true,
    },
  },

  depature: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
