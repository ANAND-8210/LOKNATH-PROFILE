const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Booking = require("./models/Booking");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adls-diagnostic-center";
const CLIENT_DIR = path.join(__dirname, "..", "client");

app.use(cors());
app.use(express.json());
app.use(express.static(CLIENT_DIR));

const normalizeBookingInput = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  phone: typeof body.phone === "string" ? body.phone.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
  selectedPackage: typeof body.package === "string" ? body.package.trim() : "",
  date: typeof body.date === "string" ? body.date.trim() : ""
});

const validateBookingInput = (bookingData) => {
  const errors = [];
  const phoneDigits = bookingData.phone.replace(/\D/g, "");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!bookingData.name) {
    errors.push("Full name is required.");
  }

  if (!bookingData.phone) {
    errors.push("Phone number is required.");
  } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push("Phone number must be between 10 and 15 digits.");
  }

  if (!bookingData.email) {
    errors.push("Email is required.");
  } else if (!emailPattern.test(bookingData.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!bookingData.selectedPackage) {
    errors.push("Please select a health package.");
  }

  if (!bookingData.date) {
    errors.push("Preferred date is required.");
  }

  return errors;
};

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running."
  });
});

app.post("/api/bookings", async (req, res) => {
  const bookingData = normalizeBookingInput(req.body);
  const validationErrors = validateBookingInput(bookingData);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors[0],
      errors: validationErrors
    });
  }

  try {
    const savedBooking = await Booking.create({
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email,
      package: bookingData.selectedPackage,
      date: bookingData.date
    });

    return res.status(201).json({
      success: true,
      message: "Booking saved successfully.",
      data: savedBooking
    });
  } catch (error) {
    console.error("Failed to create booking:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving the booking."
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, "index.html"));
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
};

startServer();
