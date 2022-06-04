const jwt = require("jsonwebtoken");

// Needs req.body.requestingUserId!

const isAuth = (req, res, next)  => {

  // Verify if is there is a token
  const authHeader = req.headers.authorization;

  // If header not on right format
  if ( !authHeader?.startsWith('Bearer ') ) { return res.status( 401 ).json({'error': 'No authHeader'});}
    
  const token = authHeader.split(" ")[1];

  // Decode Token to extract userId
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    ( err, decoded ) =>{
          
      if (err) {

      // verifier la validitée du refresh token
      // Si c'est valide: actualiser l'access token /como lo envio con la respuesta?
      // si c'est pas le cas: 403 et logout. 
        return res.status( 403 ).json({ 'error':'Token expired or invalid' });

      } else {
        req.userId = decoded.UserInfo.userId;
        req.role = decoded.UserInfo.userRole;
        next();
      }
    }
  )
}

module.exports = isAuth;
