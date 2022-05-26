const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../utils/roles_list");
const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");
const { Op } = require("sequelize");
const { send } = require("express/lib/response");


exports.refreshTokenHandler = async (req, res) => {


  // 1 - Verify Cookies
  const cookies = req.cookies;

  // 1.A ) No cookies sent
  if (!cookies?.jwt) {
    return res.status(401).json({'error':' No cookies sent'});
  }

  // 1.B) Cookies sent
  
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  // 2 - Verify cookie Token 
  const cookieTokenDecoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  // 3 - Search cookie in DB

  RefreshTokens.findOne({
    where: {
      token: refreshToken
    },
    include: Users
  })
  
  .then( (foundToken) => {

    if (!foundToken) {
      if (cookieTokenDecoded) {
        // reuse situation
        RefreshTokens.destroy({
          where: { userId: cookieTokenDecoded.userId },
        })
        .then(()=> {return res.sendStatus(403)})
        .catch((err)=> {return res.status(500).json({'error': err.message})});
      } else {
        return res.sendStatus(403);
      }
    }

    // FOUND TOKEN IN DB

    if(cookieTokenDecoded) {
      // verficar si token y db tienen el mismo user
      if (cookieTokenDecoded.userId === foundToken.userId) {
        // ******** SUCCESS ***************//
        
            // Create new Refresh Token
            const newRefreshToken = jwt.sign(
              { userId: foundToken.userId },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: "1d" }
            );

            // Create a new access token
            const accessToken = jwt.sign(
              {
                UserInfo: {
                  userId: cookieTokenDecoded.userId,
                  userRole: ROLES_LIST[foundToken.user.role], // sends the code, not the name of role
                },
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "15m" }
            );

            RefreshTokens.update(
              {token: newRefreshToken}, 
              { where: {
              token: refreshToken,
              userId: foundToken.userId}}
              ).then(()=>{

                 // Send new Cookie
            res.cookie("jwt", newRefreshToken, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
              maxAge: 24 * 60 * 60 * 1000,
            })

               // Send new access token
            return res.json({
              userId: foundToken.userId,
              userRole: ROLES_LIST[foundToken.user.role],
              accessToken: accessToken,
            });
           })
          
      } else {
        // kill al tokens of userDB and TokenDB
        /*RefreshTokens.destroy({
          where: {
            [Op.or]: [
              { userId: cookieTokenDecoded.userId },
              { userId: foundToken.userId },
            ],
          },
        })
        .then(()=> {return res.sendStatus(403)})
        .catch((err)=> {return res.status(500).json({"DataBaseError": err.message})});*/
                 console.log('FUCK YOU ERROR');
      }

   // NO TOKEN FOUND IN DB
   } else {

    /**RefreshTokens.destroy({
      where: { userId: foundToken.userId },
    })
    .then(()=>{ return res.sendStatus(403)} )
    .catch((err)=> {return res.status(500).json({"DataBaseError": err.message})})*/
    console.log('FUCK YOU ERROR');
   }
  })
  .catch((err)=> { return res.status(500).json({"DataBaseError": err.message})})
}
