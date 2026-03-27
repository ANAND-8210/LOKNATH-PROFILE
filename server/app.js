const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Booking = require("./models/Booking");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = 5000;
const ROOT_DIR = path.join(__dirname, "..");
const ROOT_INDEX_FILE = path.join(ROOT_DIR, "index.html");
const CLIENT_DIR = path.join(ROOT_DIR, "client");
const CLIENT_INDEX_FILE = path.join(CLIENT_DIR, "index.html");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adls-diagnostic-center";
const MEMORY_BOOKINGS = [];

let bookingStorage = {
  mode: "memory",
  async save(bookingData) {
    const savedBooking = {
      id: `mem-${Date.now()}-${MEMORY_BOOKINGS.length + 1}`,
      ...bookingData,
      createdAt: new Date().toISOString()
    };

    MEMORY_BOOKINGS.push(savedBooking);
    return savedBooking;
  }
};

let databaseStatus = {
  connected: false,
  mode: "memory",
  message: "Running with in-memory booking storage."
};

const normalizeBookingInput = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  phone: typeof body.phone === "string" ? body.phone.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
  package: typeof body.package === "string" ? body.package.trim() : "",
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

  if (!bookingData.package) {
    errors.push("Please select a package.");
  }

  if (!bookingData.date) {
    errors.push("Preferred date is required.");
  }

  return errors;
};

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(ROOT_DIR, { index: false }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is running",
      database: databaseStatus
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
      const savedBooking = await bookingStorage.save(bookingData);

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

  app.use("/api", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API route not found."
    });
  });

  app.get("/", (req, res) => {
    res.sendFile(ROOT_INDEX_FILE);
  });

  app.get("/app", (req, res) => {
    res.sendFile(CLIENT_INDEX_FILE);
  });

  app.get("*", (req, res) => {
    res.sendFile(CLIENT_INDEX_FILE);
  });

  return app;
};

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });

    bookingStorage = {
      mode: "mongodb",
      async save(bookingData) {
        return Booking.create(bookingData);
      }
    };

    databaseStatus = {
      connected: true,
      mode: "mongodb",
      message: "MongoDB connected successfully."
    };

    console.log("MongoDB connected successfully.");
  } catch (error) {
    bookingStorage = {
      mode: "memory",
      async save(bookingData) {
        const savedBooking = {
          id: `mem-${Date.now()}-${MEMORY_BOOKINGS.length + 1}`,
          ...bookingData,
          createdAt: new Date().toISOString()
        };

        MEMORY_BOOKINGS.push(savedBooking);
        return savedBooking;
      }
    };

    databaseStatus = {
      connected: false,
      mode: "memory",
      message: "MongoDB unavailable. Using in-memory booking storage."
    };

    console.warn("MongoDB unavailable. Falling back to in-memory booking storage.");
    console.warn(error.message);
  }
};

const startServer = async () => {
  const app = createApp();

  await connectToDatabase();

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Frontend available at http://localhost:${PORT}/client/index.html`);
      resolve({ app, server });
    });

    server.on("error", (error) => {
      reject(error);
    });
  });
};

module.exports = {
  PORT,
  createApp,
  startServer
};
