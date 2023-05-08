const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const AdminModel = require("./models/adminModel");
const UserModel = require("./models/userModel");
const FlightModel = require("./models/flightModel");
const BookingModel = require("./models/bookingModel");
const app = express();
const jwt = require("jsonwebtoken");

app.use(
  cors({
    origin: "*",
  })
);

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;

app.use(express.json());
mongoose
  .connect(
    `mongodb+srv://${username}:${password}@flightbooking.dojt722.mongodb.net/flightbooking`
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log(err);
  });



// CREATE USER
app.post("/user", async (req, res) => {
  let {
    user_name,
    password,
    email,
    age,
    contact_number,
    address,
    passport,
  } = req.body;
  const hash = await bcrypt.hash(password, 10);
  if (passport === "Yes") passport = "true";
  else passport = "false";

  const user = new UserModel({
    name: user_name,
    password: hash,
    email: email,
    age: age,
    contact_number: contact_number,
    address: address,
    passport: passport,
  });
  try {
    await user.save();
    res.send(true);
  } catch {
    res.send(false);
  }
});

// CREATE FLIGHT
app.post("/flight", async (req, res) => {
  const {
    airline,
    flightNumber,
    origin,
    destination,
    departure,
    firstclassCount,
    economyclassCount,
    businessclassCount,
    duration,
    business,
    firstClass,
    economy,
  } = req.body;

  console.log(business);
  const flight = new FlightModel({
    airline: airline,
    flightNumber: flightNumber,
    origin: origin,
    destination: destination,
    departureDate: departure,
    firstclassCount: firstclassCount,
    economyclassCount: economyclassCount,
    businessclassCount: businessclassCount,
    duration: duration,
    cost: {
      business: business,
      firstClass: firstClass,
      economy: economy,
    },
  });

  try {
    flight.save();
    res.send(true);
  } catch {
    res.send("Error!!");
  }
});

// DELETE FLIGHT
app.delete("/flight/:id", async (req, res) => {
  const { id } = req.params;
  // res.send(id);
  try {
    await FlightModel.findByIdAndDelete(id);
    res.send(true);
  } catch (error) {
    res.send(error);
  }
});

// USER LOGIN
app.post("/userlogin", async (req, res) => {
  const { email, password } = req.body;

  const response = await UserModel.find(
    { email: email },
    { password: 1, name: 1, _id: 1 }
  );

  if (response.length !== 0) {
    bcrypt
      .compare(password, response[0].password)
      .then((resp) => {
        if (resp) {
          const user = { email: email };
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
          res.json({
            accessToken: accessToken,
            name: response[0].name,
            id: response[0].id,
          });
        } else res.send(false);
      })
      .catch((error) => console.log(error));
  } else res.send("NE");
});

// ADMIN LOGIN
app.post("/adminlogin", async (req, res) => {
  const { name, password } = req.body;
  const response = await AdminModel.find(
    { name: name },
    { password: 1, _id: 0 }
  );
  bcrypt
    .compare(password, response[0].password)
    .then((resp) => {
      if (resp) {
        res.send(true);
      } else res.send(false);
    })
    .catch((error) => console.log(error));
});
//FLIGHT NUMBER SUGGESTIONS
app.post("/flightnumber", async (req, res) => {
  const { value } = req.body;
  const response = await FlightModel.find(
    {},
    // {
    //   origin: { $regex: value, $options: "i" },
    // },
    { flightNumber: 1, _id: 0 }
  );
  console.log(response);
  res.send(response);
});
// ORIGIN SUGGESTIONS
app.post("/fromsuggestions", async (req, res) => {
  const { value } = req.body;
  const response = await FlightModel.find(
    {},
    // {
    //   origin: { $regex: value, $options: "i" },
    // },
    { origin: 1, _id: 0 }
  );
  console.log(value);
  res.send(response);
});

// DEPATURE SUGGESTIONS
app.post("/tosuggestions", async (req, res) => {
  let { value } = req.body;

  const response = await FlightModel.find(
    {
      destination: { $regex: value, $options: "i" },
    },
    { destination: 1, _id: 0 }
  );

  res.send(response);
});

// SEARCH FOR FLIGHTS BASED ON PLACE , DATE AND TIME
app.post("/search", async (req, res) => {
  const { fromValue, toValue, departure, arrival } = req.body;

  const departureDate = new Date(departure);
  const arrivalDate = new Date(arrival);

  arrivalDate.setDate(arrivalDate.getDate() + 1);

  const response = await FlightModel.find({
    departureDate: { $gte: departureDate, $lt: arrivalDate },
    destination: { $regex: toValue, $options: "i" },
    origin: { $regex: fromValue, $options: "i" },
  });
  console.log(response);
  res.send(response);
});

// BOOK FLIGHTS
app.post("/flight/:id", async (req, res) => {
  const { id } = req.params;
  var { firstticket, businessticket, economyticket, u_id } = req.body;

  const bookedcount =
    parseInt(firstticket) + parseInt(businessticket) + parseInt(economyticket);
  const updateData = {
    $inc: {
      economyclassCount: economyticket * -1,
      firstclassCount: firstticket * -1,
      businessclassCount: businessticket * -1,
    },
  };
  try {
    const flight = await FlightModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    const user = await UserModel.findById(u_id);
    console.log(u_id);
    const booking = new BookingModel({
      user_id: u_id,
      flight_id: id,
      flightNumber: flight.flightNumber,
      passengerName: user.name,
      passengerEmail: user.email,
      passengerPhone: user.contact_number,
      bookedcount: bookedcount,
      depature: flight.destination,
      origin: flight.origin,
      date: flight.departureDate,
      bookedcount: {
        firstClassCount: firstticket,
        economicClassCount: economyticket,
        businessClassCount: businessticket,
      },
    });
    booking.save();
    res.send("Booked successfully");
  } catch (error) {
    console.log(error);
  }
});
// MY BOOKINGS
app.post("/user/:id", async (req, res) => {
  const { id } = req.params;
  const response = await BookingModel.find({ user_id: id });
  res.send(response);
});
// DELETE BOOKINGS
app.post("/delbooking/:id", async (req, res) => {
  const { id } = req.params;
  const { f_id } = req.body;
  const booked = await BookingModel.findById(id);
  console.log(booked);
  const updateData = {
    $inc: {
      economyclassCount: booked.bookedcount.economicClassCount,
      firstclassCount: booked.bookedcount.firstClassCount,
      businessclassCount: booked.bookedcount.businessClassCount,
    },
  };
  await FlightModel.findOneAndUpdate({ _id: f_id }, updateData);
  await BookingModel.findByIdAndDelete(id);
});

// ALL FLIGHTS
app.post("/flightsfetch", async (req, res) => {
  const response = await FlightModel.find({});
  res.send(response);
});
// ALL BOOKINGS ADMIN
app.post("/allbooking", async (req, res) => {
  const { flightNumber, departure } = req.body;
  const departureDate = new Date(departure);
  const response = await BookingModel.find({ flightNumber: flightNumber });
  res.send(response);
});
app.listen(3000, () => {
  console.log("Listening in port 3000");
});
