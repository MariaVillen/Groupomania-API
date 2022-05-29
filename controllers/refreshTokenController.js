const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../utils/roles_list");
const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");
const { Op } = require("sequelize");
const { send } = require("express/lib/response");


exports.refreshTokenHandler = async (req, res) => {

  console.log("entra en refrshToken L11");

  // 1 - Verify Cookies
  const cookies = req.cookies;

  // 1.A ) No cookies sent
  if (!cookies?.jwt) {
    console.log("las cookies no fueron enviadas. Error 401");
    return res.status(401).json({'error':' No cookies sent'});
  }

  // 1.B) Cookies sent
  
  const refreshToken = cookies.jwt;

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
  // CASE TOKEN NOT FOUND IN DB
  .then( (foundToken) => {
    console.log("encontro el foundtoken? : ", foundToken.token);
    if (!foundToken) {
      // reuse situation
      res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
      console.log(" UserId establecemos a quien borramos. Cookie: ", cookieTokenDecoded.userId, " BD: ", foundToken.userId, " resultado: ", userId);
      const userId = (cookieTokenDecoded) ? cookieTokenDecoded.userId : foundToken.userId;
      console.log("no lo encontró, destruimos todo");
      RefreshTokens.destroy({
          where: { userId: userId },
      })
      .then(()=>{ 
        console.log("enviamos respuest 403 L53");
        return res.sendStatus(403)})
      .catch((err)=> { 
        console.log("enviamos respuesta 500 L56", err); 
        return res.status(500).json({"DataBaseError": err.message})
      })
    } else {
    console.log("continua al proximo")
    return foundToken;}}
  )
  // FOUND TOKEN
  // CASE FOUND TOKEN USER NOT EQUAL USER TOKEN DB
  .then ((foundToken)=>{
    
    console.log("el token se decodifico, vamos a ver si son los mismos usuariso el del token y el de la db L68");
    console.log( "Son distintos? ", (cookieTokenDecoded && (cookieTokenDecoded?.userId !== foundToken?.userId )));
    console.log("cookie ", cookieTokenDecoded?.userId);
    console.log("TokenDB ", foundToken?.userId);
    if (cookieTokenDecoded && (cookieTokenDecoded.userId !== foundToken.userId) ) {
     // kill al tokens of userDB and TokenDB
     console.log("el token de usuario no es el mismo que el de la db");
     RefreshTokens.destroy({
      where: {
        [Op.or]: [
          { userId: cookieTokenDecoded.userId },
          { userId: foundToken.userId },
        ],
      }
    })
    .then(()=> { 
      console.log("enviamos 403 2do then L82"); 
      res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
      return res.sendStatus(403)})
    .catch((err)=> { 
      console.log("enviamos 500 2othen l85"); 
      return res.status(500).json({"DataBaseError": err.message})})
    } 
    return foundToken;
  })

  // SUCCESS
  .then ((foundToken)=>{
    console.log("todo ha ido bien L94");
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
    console.log("hacemos el update del refresh token");
  RefreshTokens.update(
    {token: newRefreshToken}, 
    { where: {
    token: refreshToken,
    userId: foundToken.userId}}
  )
  .then((result)=>{

    if (result) {

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true }); 
    // Send new Cookie

    console.log("enviamos cookie y accessToken");
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })

        // Send new access token
        console.log("retornamos success 200");
      return res.status(200).json({
        userId: foundToken.userId,
        userRole: ROLES_LIST[foundToken.user.role],
        accessToken: accessToken,
      });
    } else {
      console.log("retornamos error 400 L139");
      return res.status(400).json({"error": "Can't update"});
    }
  })
  })
  .catch((err)=> {
    console.log("este es el ultimo catche respuest 500L145"); 
    res.status(500).json({"DataBaseError": err})
  })
}
