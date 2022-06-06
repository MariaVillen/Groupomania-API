const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../utils/roles_list");

const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");



// Get a new access token when it expires
// [GET] http:/localhost:3500/api/refresh
exports.refreshTokenHandler = async (req, res) => {

  console.log("Entra a analizar el refreshToken");

  // 1 - Verify Cookies
  const cookies = req.cookies?.jwt;
  console.log("cookies " , cookies);
  // 1.A ) No cookies sent (refresh token expired or not logged)
  if ( !cookies ) {
    console.log("las cookies no fueron enviadas. Error 403");
    return res.status( 403 ).json({ 'error':'Refesh expired or user not logged. Have to login.' });

  } else {
    console.log("las cookies fueron enviadas ", cookies);
    // 1.B) Cookies sent

    const refreshToken = cookies;
    console.log("contenido de refreshToken ");
    // 2 - Verify cookie Token 
    const cookieTokenDecoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!cookieTokenDecoded) {
      console.log("Pero no son validas");
      return res.status(403).json({ 'error': 'Invalid Token. You have to login'});
    
    } else {

      // 3 - Search cookie in DB
      try {
      
        const tokenInDb = await RefreshTokens.findOne({ where: { token: refreshToken}, include: Users })

        if (tokenInDb && (tokenInDb.user.id === cookieTokenDecoded.userId)) {
        
        console.log("Las cookies se enviaron, son validas, se encontro el usuario en la base de datos y es el mismo que el del token enviado");
          
        // Create new Refresh Token
        const newRefreshToken = jwt.sign(
          { userId: tokenInDb?.userId },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }                  // < ------------------ 1 day refresh token
        );

        // Create a new access token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              userId: cookieTokenDecoded?.userId,
              userRole: ROLES_LIST[ tokenInDb?.user.role ], // sends the code, not the name of role
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }                   // < ------------------ 15 minutes access token
        );

        // Update Token 

        try {
          await RefreshTokens.update(
            { token: newRefreshToken }, 
            { where: {
            token: refreshToken,
            userId: tokenInDb?.user.id}}
          )
          console.log("El antiguo refresh token se sustituyo por el nuevo y enviamos nuevo access y refresh token");     
          // Clean Old cookie
          res.clearCookie( "jwt", { httpOnly: true, sameSite: "none", secure: true } ); 
            
          // Send new refresh token via cookie
          console.log("enviamos cookie y accessToken");
          res.cookie( "jwt", newRefreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,          // < ------------------ 1 day cookie
          })

          // Send new access token
          console.log("retornamos success 200");

          return res.status( 200 ).json( {
            userId: tokenInDb?.user.id,
            userRole: ROLES_LIST[tokenInDb?.user.role],
            accessToken: accessToken,
          });
        } catch (err) {
          console.log("Por alguna razon no se puedo hacer el update en la base de datos del nuevo token");
          return res.status(500).json({"error": `Error: ${err} while updating refreshtoken`});
        }

        } else {
          console.log("El token no se encontró en la base de datos o el que hay en la base de datos no coincide con el usuario que hay en el token enviado");
          RefreshTokens.destroy({
            where: { userId: cookieTokenDecoded.userId },
          })
          .then(() => {
            console.log("retornamos error 403")
            res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
            return res.status(403).json({"error":"token not found in DB or not of a user id. Reuse Situation."})
          })
          .catch((err) => {
            console.log("retornamos error 500");
            return res.status(500).json({"error" : `Error ${err} while destroying refresh on reuse situation`});
          })
        }

      } catch (error) {
        console.log(" Hubo un error buscando en el base de datos al token");
        return res.status(500).json({"message": `Error: ${error} while looking for token in DB`});
      }
    } 
  }
}