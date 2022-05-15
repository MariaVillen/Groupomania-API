const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validation } = require("../helpers/validation");
const Users = require("../models/User");


// Sign Up Controller

exports.postSignUp = (req, res) => {
  let { lastName, name, email, password } = req.body;

  // Verify all champs are completed
  if (!email || !password || !lastName || !name) {
    return res
      .status(400)
      .json({ Error: "Veuillez remplir l'ensemble des champs du formulaire" });
  }

  // validate champs:
  console.log('antes validacion: ', password);
  try{
    email = validation.isEmail(email);
    password = validation.isPassword(password);
    lastName = validation.isName(lastName);
    name = validation.isName(name);
  } catch(err) {
    console.log(err);
    return res.status(400).json({Error: err.message});
  }
  console.log('Luego Validacion ', password);
  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      return Users.create({
        email: email.toLowerCase(),
        password: hashedPass,
        lastName: lastName,
        name: name,
      });
    })
    .then((result) => {
      res.status(200).json(`User ${result.name} created!`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ DataBaseError: err.message });
    });
};



// Login Controller

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

   // Verify all champs are completed
  if (!email || !password) {
    return res
      .status(400)
      .json({ Error: "Veuillez remplir l'ensemble des champs du formulaire" });
  }

  Users.findOne({ where: { email: email.toLowerCase() } })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Erreur: Utilisateur non trouvé" });
      }
      if (!user.isActive) {
        console.log(user.isActive);
        return res
          .status(401)
          .json({
            message: "Votre compte n'est pas active. Veuillez contacter RRHH",
          });
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
            userRole: user.role,
            token: jwt.sign(
              { userId: user.idUsers, userRole: user.role },
              process.env.SECRET_TOKEN,
              {
                expiresIn: "1h",
              }
            ),
          });
        })
        .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
    })
    .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
};


// Logout Controller

exports.postLogout = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      message: "No token provided!",
    });
  } else {
    //TODO: destruir el token anterior
    //jwt.destroy(token);
  }
};
