const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Booking = require("./server/models/Booking");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = 5000;
const ROOT_DIR = __dirname;
const CLIENT_FILE = path.join(ROOT_DIR, "client", "index.html");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adls-diagnostic-center";

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT_DIR, { index: false }));

const normalizeBookingInput = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  phone: typeof body.phone === "string" ? body.phone.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
  packageName: typeof body.package === "string" ? body.package.trim() : "",
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

  if (!bookingData.packageName) {
    errors.push("Please select a package.");
  }

  if (!bookingData.date) {
    errors.push("Preferred date is required.");
  }

  return errors;
};

app.get("/", (req, res) => {
  res.status(200).send("Server is running ✅");
});

app.get("/app", (req, res) => {
  res.sendFile(CLIENT_FILE);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running ✅"
  });
});

app.post("/api/bookings", async (req, res) => {
  console.log("Incoming booking data:", req.body);

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
      package: bookingData.packageName,
      date: bookingData.date
    });

    return res.status(201).json({
      success: true,
      message: "Booking saved successfully.",
      data: savedBooking
    });
  } catch (error) {
    console.error("Failed to save booking:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while saving the booking."
    });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Frontend available at http://localhost:${PORT}/client/index.html`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
};

startServer();
