const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validation } = require("../helpers/validation");
const Users = require("../models/User");
const RefreshTokens = require("../models/refreshToken");
const ROLES_LIST = require("../utils/roles_list");

// Sign Up new user
// [POST] http:/localhost:3000/auth/signup
exports.postSignUp = async (req, res) => {

  let { lastName, name, email, password } = req.body;

  // Verify all champs are completed
  if (!email || !password || !lastName || !name) {
    return res
      .status(400)
      .json({ "error": "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  // Champs validation
  try {
    email = validation.isEmail(email);
    password = validation.isPassword(password);
    lastName = validation.isName(lastName);
    name = validation.isName(name);
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }

  // Hashing password and creating user
  try {
    const hashedPass = await bcrypt.hash(password, 12);
    const newUser = await Users.create({
      email: email,
      password: hashedPass,
      lastName: lastName,
      name: name,
    });
    res.status(201).json({
      "message": `Nouvel utilisateur ${newUser.name} ${newUser.lastName} créé.`,
    }); 
  } catch (err) {
    res.status(400).json({ "error": "Email déjà utilisé" });
  }
};

// Login user
// [POST] http:/localhost:3000/auth/login
exports.postLogin = async (req, res) => {
  // Recover email
  let { email, password } = req.body;

  // Verify all champs are completed
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  // Email to lowecase-
  email = email.toLowerCase();

  // Find user with email and password
  try {
    const foundUser = await Users.findOne({
      where: { email: email },
    });

    if (!foundUser) {
      return res.status(401).json({ error: "Utilisateur non trouvé." });
    }

    if (foundUser.isActive !== 1) {
      return res
        .status(401)
        .json({ error: "Le compte de l'utilisateur n'est pas actif." });
    }

    // User Found
    const validPass = await bcrypt.compare(password, foundUser.password);

    if (!validPass) {
      return res.status(401).json({ error: "Mot the passe incorrecte." });
    }

    // The password is valid
    // Creating new tokens

    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: foundUser.id,
          userRole: ROLES_LIST[foundUser.role], // send the code-role (Set with ROLES_LIST), not the name of role.
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }             // < ------------------ 15 min refresh token
    );

    const newRefreshToken = jwt.sign(
      { userId: foundUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "50s" }             // < ------------------ 1 day refresh token
    );

    // Cookies verification
    const cookies = req.cookies;

    // Case: no cookies
    if (!cookies?.jwt) {
      // Save new refresh token to Db
      await RefreshTokens.create({
        token: newRefreshToken,
        userId: foundUser.id,
      });

      // Send new cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 50 * 1000, // < ------------------ 1 day cookie
      });

      // Send new access token
      res.status(200).json({
        userId: foundUser.id,
        userRole: ROLES_LIST[foundUser.role],
        accessToken: accessToken,
      });

      // Case: cookies found
    } else {
      // In this moment we have a cookie and a user
      // Get refreshToken from cookie
      const refreshToken = cookies.jwt;

      // Erase old cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      // Find token of cookie in DB
      const foundToken = await RefreshTokens.findOne({ token: refreshToken });

      // No token in DB but there is a cookie : REUSE SITUATION.

      if (!foundToken) {
        // Extract data from the cookies token.
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, decodedToken) => {
            // Token is valid but not in db
            if (decodedToken) {
              // Destroy all refreshTokens of the user of the cookie
              await RefreshTokens.destroy({
                where: {
                  userId: decodedToken.userId,
                },
              });

              // Destroy all refreshTokens of the user logged.
              await RefreshTokens.destroy({
                where: {
                  userId: foundUser.id,
                },
              });
            }

            // In all case send 403 (token not valid and not in db also)
            return res.sendStatus(403); // Forbidden;
          }
        );
      }

      // Cookie found in DB an there is a cookie
      // Old token found, update and change it for the new refresh token
      await foundToken.destroy();

      await RefreshTokens.create({
        token: newRefreshToken,
        userId: foundUser.id,
      });

      // Send new cookies
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // < ------------------ 1 day cookie
      });

      // Sent new access token

      res.status(200).json({
        userId: foundUser.id,
        userRole: ROLES_LIST[foundUser.role],
        accessToken: accessToken,
      });
    }
  } catch (err) {
    console.log("user not found");
  }
};

// Logout Controller
// [POST] http:/localhost:3000/auth/rslogout
exports.postLogout = async (req, res) => {
  // Get cookies
  const cookies = req.cookies;

  //
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  } // success no content to send back

  const refreshToken = cookies.jwt;

  // Verify if refreshToken is on DB

  // Find the token in DB
  try {
    const foundToken = await RefreshTokens.findOne({
      where: { token: refreshToken },
    });

    // Token Not Found
    if (!foundToken) {
      // Erase de cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.sendStatus(204); // success but no content;
    } else {
      await foundToken.destroy();
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.sendStatus(204); //Ok but no content to send}
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
