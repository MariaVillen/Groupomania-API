const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../utils/roles_list");
const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");
const { Op } = require("sequelize");

exports.refreshTokenHandler = async (req, res) => {
  // verify Cookies
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({'error':' No cookies sent'});
  } //no jwt cookie exists (unlogged / unAuthorized)

  const refreshToken = cookies.jwt;

  // Erase old cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  // Search refresh token in DB
  try {
    const foundToken = await RefreshTokens.findOne({
      where: { token: refreshToken },
      include: Users,
    });

    if (foundToken) {

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decodedToken) => {
        // If token cant be decoded -> REUSE SITUATION!!
        if (err) {
          try {
            // Destroy all tokens from user of the token found in DB
            userOwnerOfToken = foundToken.userId;
            const result = await RefreshTokens.destroy({
              where: { userId: userOwnerOfToken },
            });
            return res.sendStatus(403); // Forbidden;
          } catch (err) {
            return res
              .status(500)
              .json({ error: err.message + "at destroy all tokens" });
          }
        }
        console.log("foundtoken L73 = ", foundToken);
        // Decoded token but id user of token is not the same of the user id of the same token in DB -> REUSE SITUATION!!
        if (foundToken.userId !== decodedToken.userId) {
          try {
            const result = await RefreshTokens.destroy({
              where: {
                [Op.or]: [
                  { userId: decodedToken.userId },
                  { userId: foundToken.userId },
                ],
              },
            });
            return res.sendStatus(403); // Forbidden;
          } catch (err) {
            return res
              .status(500)
              .json({ error: err.message + "at not equal users" });
          }
        }

        // Token ok and is equal to the DB user of Token.

        // Create new Refresh Token
        const newRefreshToken = jwt.sign(
          { userId: foundToken.userId },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        try {
          // Destroy old refresh token and create a new one.
          const userId = foundToken.userId;
          console.log("destruyendo tokens");
          const destroy = foundToken.destroy().then(
            refreshTokens.create({
              token: newRefreshToken,
              userId: userId,
            }).catch((err) =>{console.log(err)})
          ).catch((err)=>{console.log(err)})
         

          // Send new Cookie
          res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
        } catch (err) {
          return res
            .status(500)
            .json({ error: err.message + "at create refresh token" + err });
        }

        // Create a new access token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              userId: decodedToken.userId,
              userRole: ROLES_LIST[foundToken.user.role], // sends the code, not the name of role
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        // Send new access token
        res.json({
          userId: foundToken.userId,
          userRole: ROLES_LIST[foundToken.user.role],
          accessToken: accessToken,
        });
      }
    ) } else {
      // Token not found in DB but sent -> REUSE SITUATION!
      // Decodificamos el token in cookies
      try {
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, decodedToken) => {
            // can't decodify
            if (err) {
              return res.sendStatus(403); //Forbidden
            } else {
              // erase all tokens from user's cookies.
              const userOwnerOfToken = decodedToken.userId;
              const result = await RefreshTokens.destroy({
                where: { userId: userOwnerOfToken },
              });
              return res.sendStatus(403);
            }
          }
        );
      } catch (err) {
        return res.status(500).json({ error: err.message + "at verify token" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message + "at verify token" });
  } 

};
