const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validation } = require("../helpers/validation");
const Users = require("../models/User");


// Sign Up new user
// [POST] http:/localhost:3000/signup
// // Body Content Expected: {email, password, name, lastName}.
exports.postSignUp = (req, res) => {
  let { lastName, name, email, password } = req.body;

  // Verify all champs are completed
  if (!email || !password || !lastName || !name) {
    return res
      .status(400)
      .json({ Error: "Veuillez remplir l'ensemble des champs du formulaire" });
  }

  // Champs validation.
  try{
    email = validation.isEmail(email);
    password = validation.isPassword(password);
    lastName = validation.isName(lastName);
    name = validation.isName(name);
  } catch(err) {
    console.log(err);
    return res.status(400).json({error: err.message});
  }

  // Hashing password and creating user
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
      res.status(200).json(`Utilisateur ${result.name} ${result.lastName} créé!`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ DataBaseError: err.message });
    });
};

// Login user
// [POST] http:/localhost:3000/login
// // Body Content Expected: {email, password}
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


// Verify all champs are completed
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Veuillez remplir l'ensemble des champs du formulaire" });
  }

  Users.findOne({ where: { email: email.toLowerCase() } })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur non trouvé" });
      }
      if (!user.isActive) {
        console.log(user.isActive);
        return res
          .status(401)
          .json({
            error: "Votre compte n'est pas active. Veuillez contacter RRHH",
          });
      }

      // User Found
      bcrypt
        .compare(password, user.password)
        .then((doPassMatch) => {
          if (!doPassMatch) {
            return res
              .status(401)
              .json({ Error: "Mot the passe incorrecte." });
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
        .catch((err) => res.status(500).json({ DataBaseError: err.messasge }));
    })
    .catch((err) => res.status(500).json({ DataBaseError: err.message }));
};


// Logout Controller
// [POST] http:/localhost:3000/logout
exports.postLogout = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      error: "Token pas fourni!",
    });
  } else {
    //TODO: destruir el token anterior
    //jwt.destroy(token);
  }
};
