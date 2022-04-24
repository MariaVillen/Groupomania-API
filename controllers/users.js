const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Sign Up of User

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.password;

  bcrypt
    .hash(pass, 12)
    .then((hashedPass) => {
      const user = new User({
        email: email,
        password: hashedPass,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((err) => res.status(400).json({ message: "Erreur: " + err }));
    })
    .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
};

// Login of User

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Erreur: Utilisateur non trouvé" });
      }
      // User Found
      bcrypt
        .compare(pass, user.password)
        .then((doPassMatch) => {
          if (!doPassMatch) {
            return res
              .status(401)
              .json({ message: "Erreur: mot the pass incorrect" });
          }
          // Valid Password
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
              expiresIn: "1h",
            }),
          });
        })
        .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
    })
    .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
};
