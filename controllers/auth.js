const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");

const Users = require("../models/User");


exports.postSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.confirmPass;
  const lastname = req.body.lastname;
  const name = req.body.name;

  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      return Users.create({
        email: email,
        password: hashedPass,
        username: username,
        lastname: lastname,
        name: name,
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).send(`User ${result.username} created!`);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// // Sign Up of User

exports.postLogin = (req, res) => {

  const email = req.body.email;
  const pass = req.body.password;

  Users.findOne({ email: email })
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
  }
  

  exports.postLogout = (req, res) => {}

  