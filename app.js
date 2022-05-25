const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const helmet = require("helmet");

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
//const commentRoutes = require("./routes/comments");
//const reportsRoutes = require("./routes/reports");
const refreshRoutes = require("./routes/refresh");


// Create express instance
const app = express();


// Parse Post Request
app.use(express.json());

// CORS authorisation
app.use((req, res, next) => {
  
  const origin = req.headers.origin;

  if (process.env.ORIGINS_ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", true); // for cookies
  }
  //res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );

  return next();
});

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
//app.use("/api/comments", commentRoutes);
// Reports router
//app.use("/api/reports", reportsRoutes);


// Images Fixed Route
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
