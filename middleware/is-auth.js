const jwt = require("jsonwebtoken");
const Users = require("../models/User");


// Needs req.body.requestingUserId!

function authRole(roleAllowed) {
  return async (req, res, next) => {
    try {
      // Verify if is there is a token
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(403).json({
          message: "No token provided!",
        });
      }

      // Decode Token to extract userId
      const decodedToken = await jwt.verify(token, process.env.SECRET_TOKEN);
      const userId = decodedToken.userId;
      const userRole = decodedToken.userRole;
      const requestingUserId = parseInt(req.body.requestingUserId);
      
      // Data of authenticated user
      //const userData = await Users.findByPk(userId);


      // User comparison to see if the user sent by the req.body and the user of the token are the same.
      if (requestingUserId && requestingUserId !== userId) {ç
        return res.status(401).json({ error: "User id non valable"});
      }

      // Test Rol
      if ([].concat(roleAllowed).includes(/*userData.role*/ userRole)) {
        req.userRole = userData.role;
        req.userId= userData.idUsers;
        next();
      } else {
        return res.status(401).json({ error: "Accès interdit pour " + userData.role });
      }
    } catch (err) {
      return res.status(401).json({ error: "Requête non authentifiée" });
    }
  };
}

module.exports = authRole;
