const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validation } = require("../helpers/validation");
const ROLES_LIST = require("../utils/roles_list");

const Users = require("../models/User");
const RefreshTokens = require("../models/refreshToken");


// Sign Up a user
// [POST] http:/localhost:3500/auth/signup
exports.postSignUp = async (req, res) => {

  let { lastName, name, email, password } = req.body;

  // Verify all champs are completed
  if ( !email || !password || !lastName || !name ) {
    return res.status( 400 ).json({ "error": "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  // Champs validation
  try {
    email = validation.isEmail( email );
    password = validation.isPassword( password );
    lastName = validation.isName( lastName );
    name = validation.isName( name );
  } catch ( err ) {
    return res.status( 400 ).json({ "error": err.message });
  }

  // Hashing password and creating user
  try {
    const hashedPass = await bcrypt.hash( password, 12 );
    const newUser = await Users.create({
      email: email,
      password: hashedPass,
      lastName: lastName,
      name: name,
    });
    return res.status(201).json({"message": `Nouvel utilisateur ${newUser.name} ${newUser.lastName} créé.`}); 
  } catch ( err ) {
    return res.status( 400 ).json({ "error": "Email déjà utilisé" });
  }
};

// Login user
// [POST] http:/localhost:3500/auth/login
exports.postLogin = async (req, res) => {

  // Recover email
  let { email, password } = req.body;

  // Verify all champs are completed
  if ( !email || !password ) {
    return res.status( 400 ).json({ "error": "Veuillez remplir l'ensemble des champs du formulaire." });
  }

  // Email to lowecase-
  email = email.toLowerCase();

  // Find user with email and password

  try {
    const foundUser = await Users.findOne({
      where: { email: email },
    });

    if (!foundUser) {
      return res.status( 401 ).json({ "error": "Utilisateur non trouvé." });
    }

    if ( foundUser.isActive !== 1 ) {
      return res.status( 401 ).json({ "error": "Le compte de l'utilisateur n'est pas actif." });
    }

    // User Found
    const validPass = await bcrypt.compare( password, foundUser.password );

    if ( !validPass ) {
      return res.status( 401 ).json({ "error": "Mot de passe incorrecte." });
    }

    // The password is valid


    // Cookies verification
    const cookies = req.cookies;
    console.log("Login ok. Procedemos a ver si hay cookies");
    // Case: no cookies
    if ( !cookies?.jwt ) {
      console.log("no hay cookies, logueamos");
      try{

        
      // Creating new tokens

      const accessToken = jwt.sign(
        {UserInfo: {
            userId: foundUser.id,
            userRole: ROLES_LIST[foundUser.role], // send the code-role (Set with ROLES_LIST), not the name of role.
        }},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }             // < ------------------ 15 min refresh token
      );

      const newRefreshToken = jwt.sign(
        { userId: foundUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }             // < ------------------ 1 day refresh token
      );
      // Save new refresh token to Db
      await RefreshTokens.create({
        token: newRefreshToken,
        userId: foundUser.id,
      });

      // Send new cookie with refresh token
      res.cookie( "jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // < ------------------ 1 day cookie
      } );

      // Send new access token
      return res.status( 200 ).json({
        userId: foundUser.id,
        userRole: ROLES_LIST[foundUser.role],
        accessToken: accessToken,
      });

      } catch (err) {

        return res.status(500).json({ "error": `error ${err.message} while adding refresh token to db`});

      }
      // Case: cookies found
    } else {
      console.log("hay cookies. Verificamos si son validas");
      const cookieTokenDecoded = jwt.verify( cookies.jwt, process.env.REFRESH_TOKEN_SECRET )
      
      if (cookieTokenDecoded) {
        console.log("son validas. reuse situation error 403");
        console.log("destruimos refresh token por reuse situation en login");

        RefreshTokens.destroy({
          where: { userId: cookieTokenDecoded.userId },
        })
        .then(() => {
          console.log("retornamos error 403");
          res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
          return res.status(403).json({"error":"token not valid. Reuse Situation."})
        })
        .catch((err) => {
          console.log("retornamos error 500");
          return res.status(500).json({"error" : `Error ${err} while destroying refresh on reuse situation`});
        })

      } else {

        console.log("no son validas- error 403");
        res.clearCookie( "jwt", { httpOnly: true, sameSite: "none", secure: true } );
        return res.status(403).json({"error":"Trying to login with an invalid cookie. You have been logout. Try again"});

      }      
    }
  } catch (err) {
    console.log("se produce un error al buscar el usuario en la base de datos");
    return res.status(500).json({ "error": `error ${err.message} while founding user to login`})
  }
}


// Logout Controller
// [POST] http:/localhost:3500/auth/logout
exports.postLogout = async (req, res) => {
  // Get cookies
  const cookies = req.cookies;

  if ( !cookies?.jwt ) {
    return res.sendStatus( 204 );
  } // success no content to send back

  const refreshToken = cookies.jwt;

  // Verify if refreshToken is on DB

  // Find the token in DB
  try {
    const foundToken = await RefreshTokens.findOne({
      where: { token: refreshToken }
    });

    // Token Not Found
    if ( !foundToken ) {
      // Erase de cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.sendStatus( 204 ); // success but no content;

    } else {

      await foundToken.destroy();

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.sendStatus( 204 ); //Ok but no content to send}
    }

  } catch ( err ) {
    console.log("error", err);
    return res.status(500).json({ "error" : `${err.message} while founding token in DB `})
  }
}
