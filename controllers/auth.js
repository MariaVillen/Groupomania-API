const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Users = require("../models/User");

exports.postSignUp = (req, res) => {
  const {lastName, name, email, password} = req.body;

  // vérification que tous les champs sont remplis
  if(!email || !password || !lastName || !name) {
    return res.status(400).json({'Error': "Veuillez remplir l'ensemble des champs du formulaire"});
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      return Users.create({
        email: email,
        password: hashedPass,
        lastName: lastName,
        name: name,
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).json(`User ${result.name} created!`);
    })
    .catch((err) => {
      res.status(500).json({DataBaseError: err});
    });
};

// // Sign Up of User

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // vérification que tous les champs sont remplis
  if(!email || !password) {
    return res.status(400).json({'Error': "Veuillez remplir l'ensemble des champs du formulaire"});
  }

  Users.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Erreur: Utilisateur non trouvé" });
      }
      if (!user.isActive) {
        return res.status(401).json({message: "Votre compte n'est pas active. Veuillez contacter RRHH"});
      }
      // User Found
      bcrypt
        .compare(password, user.password)
        .then((doPassMatch) => {
          if (!doPassMatch) {
            return res
              .status(401)
              .json({ message: "Erreur: mot the pass incorrect" });
          }
          // Valid Password
          res.status(200).json({
            userId: user.idUsers,
            userRol: user.rol,
            token: jwt.sign({ userId: user.idUsers, userRol: user.rol }, process.env.SECRET_TOKEN, {
              expiresIn: "1h",
            }),
          });
        })
        .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
    })
    .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
};

exports.postLogout = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      message: "No token provided!"
    });
  } else {
  jwt.destroy(token); 
  }
};
