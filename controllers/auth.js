const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validation } = require("../helpers/validation");
const Users = require("../models/User");

// Sign Up new user
// [POST] http:/localhost:3000/signup
// Body Content Expected: {email, password, name, lastName}

exports.postSignUp = async (req, res) => {
  let { lastName, name, email, password } = req.body;
  console.log(req.body);

  // Verify all champs are completed
  if (!email || !password || !lastName || !name) {
    return res
      .status(400)
      .json({ error: "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  // Champs validation
  try {
    email = validation.isEmail(email);
    password = validation.isPassword(password);
    lastName = validation.isName(lastName);
    name = validation.isName(name);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }

  // Hashing password and creating user
  try {
    const hashedPass = await bycrypt.hash(password, 12);
    const newUser = await Users.create({
      email: email,
      password: hashedPass,
      lastName: lastName,
      name: name,
    });

    res.status(201).json({
      message: `Nouvel utilisateur ${newUser.name} ${newUser.lastName} créé.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Login user
// [POST] http:/localhost:3000/login
// // Body Content Expected: {email, password}
exports.postLogin = async (req, res) => {
  let { email, password } = req.body;

  email = email.toLowerCase();

  // Verify all champs are completed
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  try {
    const foundUser = await Users.findOne({
      where: { email: email },
    });

    if (!foundUser) {
      return res.status(401).json({ error: "Utilisateur non trouvé." });
    }

    if (!foundUser.isActive) {
      return res
        .status(403)
        .json({ error: "Le compte de l'utilisateur n'est pas actif." });
    }

    // User Found
    const validPass = await bcrypt.compare(password, foundUser.password);

    if (!validPass) {
      return res.status(401).json({ error: "Mot the passe incorrecte." });
    } else {
      // Valid Password

      const accessToken = jwt.sign(
        { userId: foundUser.idUsers, userRole: foundUser.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { userId: foundUser.idUsers, userRole: foundUser.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // save refresh token
      const result = await Users.update(
        { refreshToken: refreshToken },
        {
          where: { idUsers: foundUser },
        }
      );

      // send response
      if (result) {
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          userId: foundUser.idUsers,
          userRole: foundUser.role,
          accessToken: accessToken,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout Controller
// [POST] http:/localhost:3000/logout
exports.postLogout = async (req, res) => {
  // On client delete de accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204); // success no content to send back
  const refreshToken = cookies.jwt;
  try {
    // Is refresh token in Db?
    const foundUser = await Users.findOne({ where: { token: cookies.jwt } });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.sendStatus(204); //forbidden
    }
    // Delete refresh token
    const result = await foundUser.update({ refreshToken: "" });
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(204); //forbidden
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
