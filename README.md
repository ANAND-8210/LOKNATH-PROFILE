# ADLS Diagnostic Center Booking System

This project is a full booking system for a diagnostic center website with a static frontend and an Express backend that can run locally or on Render.

## Project Structure

```text
client/
  index.html
  style.css
  script.js
server/
  models/
    Booking.js
  server.js
package.json
.env.example
```

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js with Express.js
- Database: MongoDB with Mongoose

## Step 1: Install Node.js

1. Download the Node.js LTS installer from the official Node.js website.
2. Run the installer and keep the default options selected.
3. After installation, open a terminal and check:

```bash
node -v
npm -v
```

If both commands show versions, Node.js is installed correctly.

## Step 2: Install Project Dependencies

Open a terminal in the project root and run:

```bash
npm install
```

This installs Express, Mongoose, CORS, Dotenv, and Nodemon.

## Step 3: Connect MongoDB

Create a `.env` file in the project root by copying `.env.example`.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/adls-diagnostic-center
```

### Option A: Local MongoDB

1. Install MongoDB Community Server on your computer.
2. Make sure the MongoDB service is running.
3. Use this connection string in `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/adls-diagnostic-center
```

### Option B: MongoDB Atlas

1. Create a free cluster in MongoDB Atlas.
2. Create a database user and allow your IP address.
3. Copy your Atlas connection string.
4. Paste it into `.env`.

Example:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net/adls-diagnostic-center?retryWrites=true&w=majority
```

## Step 4: Start the Server

You can start the app in either of these ways.

From the project root:

```bash
npm start
```

Or from inside the `server` folder:

```bash
node server.js
```

For development with auto-restart:

```bash
npm run dev
```

## Step 5: Open the Website

Once the server starts, open:

```text
http://localhost:5000
```

The Express server will serve the frontend and API from the same origin, so booking works without changing the frontend code.

## Render Deployment

This repo is configured for Render with [`render.yaml`](./render.yaml).

### Option A: Deploy from `render.yaml`

1. Push this repo to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select your GitHub repository.
4. Render will detect `render.yaml` and create the Node web service.
5. Set `MONGODB_URI` in the Render dashboard if you want persistent booking storage.
6. Deploy the service.

### Option B: Create the Render Web Service Manually

1. Push this repo to GitHub.
2. In Render, choose `New +` -> `Web Service`.
3. Connect the repository.
4. Use these settings:

```text
Environment: Node
Build Command: npm install
Start Command: npm start
```

5. Add this environment variable in Render:

```text
NODE_ENV=production
```

6. Add `MONGODB_URI` if you want persistent bookings in MongoDB Atlas.

### Important Render Notes

- Render provides its own `PORT`, and the app now uses that automatically.
- The frontend now uses the same site origin for `/api/health` and `/api/bookings`, so it works on Render without hardcoded localhost URLs.
- If `MONGODB_URI` is not set or MongoDB is unavailable, the site still works, but bookings are stored only in memory and will be lost after restart.

## API Endpoint

### Create Booking

```http
POST /api/bookings
```

Request body:

```json
{
  "name": "Amit Kumar",
  "phone": "9876543210",
  "email": "amit@example.com",
  "package": "Normal Health Checkup Package",
  "date": "2026-03-30"
}
```

## Features Included

- Responsive package cards
- Modal booking form
- Frontend validation
- Fetch API submission
- Express API endpoint
- MongoDB booking storage
- Disabled button while submitting
- Loading spinner
- Success and error alerts
- Form reset after successful booking

## Beginner Notes

- `client/script.js` handles rendering packages, validation, modal behavior, and API calls.
- `server/app.js` contains the Express app, API routes, and database startup logic.
- `server.js` is the main entry point used by local development and Render.
- `server/models/Booking.js` defines the MongoDB schema.

## Production Tips

- Replace placeholder contact details in the frontend with your real business details.
- Use HTTPS and environment variables in production.
- Add rate limiting and CAPTCHA before deploying publicly.
- Add email or SMS notifications if you want booking confirmations sent automatically.

## Contact

For any inquiries, you can reach me at:

- **Email**: <lok8898saw@gmail.com>
- **Phone**: 8454822399
