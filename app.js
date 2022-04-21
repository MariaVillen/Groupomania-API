const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.uwerq.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const app = express();

// Routes protection
app.use(helmet({ crossOriginResourcePolicy: false }));

// parse Post
app.use(express.json());

// CORS authorisation
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
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
