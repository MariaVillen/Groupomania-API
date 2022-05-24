const jwt = require("jsonwebtoken");
const ROLES_LIST = require('../utils/roles_list');
const RefreshTokens = require('../models/RefreshToken');
const Users = require('../models/User');
const { Op } = require('sequelize');
const res = require("express/lib/response");



exports.refreshTokenHandler = async (req, res) => {
  
  // verify Cookies
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401) //no jwt cookie exists (unlogged / unAuthorized)
  
  const refreshToken = cookies.jwt;

  // Erase old cookie 
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", /*secure: true*/ })
  
  // Search refersh token in DB
  const foundToken = await RefreshTokens.findOne({ where: { token: refreshToken }, include: Users });

  // Token not found in DB but sent -> REUSE SITUATION!
  if (!foundToken) {

    // Decodificamos el token in cookies
    try {
    jwt.verify(
      refreshToken, 
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decodedToken) => {
        // can't decodify
        if (err) {return res.sendStatus(403); //Forbidden
        } else {
          // erase all tokens from user's cookies.
          const userOwnerOfToken = decodedToken.userId
          const result = await RefreshTokens.destroy({
            where: {userId: userOwnerOfToken}
          })
          return res.sendStatus(403);
        }
      }
    );
    } catch(err) {
      res.status(500).json({'error': err.message});
    }
  } 
  
  // Token found in DB
  // Recover data from refreshToken 

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decodedToken) => {

      // If token cant be decoded -> REUSE SITUATION!!
      if (err) {
        try{
        // Destroy all tokens from user of the token found in DB 
        userOwnerOfToken = foundToken.userId;
        const result = await RefreshTokens.destroy({
        where: {userId: userOwnerOfToken}
        })
        return res.sendStatus(403)// Forbidden;
      } catch(err) {
        return res.status(500).json({'error': err.message});
      }
        
      // Decoded token but id user of token is not the same of the user id of the same token in DB -> REUSE SITUATION!!
      } else if (foundToken.userId !== decodedToken.userId) {
        try{
          const result = await RefreshTokens.destroy({
          where: { [Op.or]: [{userId: decodedToken.userId},{usersId: foundToken.userId}]
          }})
          return res.sendStatus(403)// Forbidden;
        } catch(err) {
          return res.status(500).json({'error': err.message});
        }  
      }

      // Token ok and is equal to the DB user of Token.

      // Create new Refresh Token 

      const newRefreshToken = jwt.sign(
        { userId: foundToken.userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "5m" }
      );

      try {
      // update refresh token
      const result = await RefreshTokens.update(
        { token: newRefreshToken },
        {
          where: { token: foundToken },
        }
      );

      // Send new Cookie
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          //secure: true,
          maxAge: 5*60*1000
          //maxAge: 24 * 60 * 60 * 1000,
        });
      } catch(err) {
        return res.status(500).json({'error':err.message});
      }

      // Create a new access token  
      const accessToken = jwt.sign(
        { "UserInfo": {
          userId: decodedToken.userId, 
          userRole: ROLES_LIST[foundToken.user.role] // sends the code, not the name of role
        }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      // Send new access token
      res.json({
        userId: foundToken.usersId,
        userRole: ROLES_LIST[foundToken.user.role],
        accessToken: accessToken,
      });
    }
  );
};
