const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const cors = require("./middleware/cors");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comments");
const refreshRoutes = require("./routes/refresh");
const reportsRoutes = require("./routes/reports");

// Create express instance
const app = express();

// Parse Post Request
app.use(express.json());

// CORS authorisation
app.use(cors);

// Routes protection
app.use(helmet({ crossOriginResourcePolicy: false }));

// Cookie Middleware
app.use(cookieParser());

// User authentication
app.use("/api/auth", authRoutes);
// Refresh
app.use("/api/refresh", refreshRoutes);
// Post routes
app.use("/api/user", userRoutes);
// Post routes
app.use("/api/post", postRoutes);
// Comments router
app.use("/api/comment", commentRoutes);
// Reports router
app.use("/api/report", reportsRoutes);

// Images Fixed Route
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
