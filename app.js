const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.uwerq.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const allowedOrigins = JSON.parse(process.env.ORIGINS_ALLOWED);
const app = express();

// parse Post
app.use(express.json());

// Routes protection
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS authorisation
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

 // res.setHeader("Access-Control-Allow-Origin", '*'); 
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

// NO-SQL Injection protection
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// User authentication
app.use("/api/auth", userRoutes);

// Sauce routes
app.use("/api/sauces", productRoutes);

// Images Fixed Route
app.use("/images", express.static(path.join(__dirname, "images")));

// Database connection
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !", err));

module.exports = app;
