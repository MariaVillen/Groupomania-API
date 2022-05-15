const jwt = require("jsonwebtoken");
const Users = require("../models/User");

function authRole(role) {
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
      const userData = await Users.findByPk(userId);
      const userSentInBody = parseInt(req.body.userId);


      // User comparison to see if the user sent by the req.body and the user of the token are the same.
      if (userSentInBody && userSentInBody !== userId) {
        console.log( userSentInBody, ' ', userData, ' ', userId)
        return res.status(401).json({ message: "Erreur: User Id non valable"});
      }

      // Test Rol
      if ([].concat(role).includes(userData.role)) {
        req.userRole = userData.role;
        req.userId= userData.idUsers;
        console.log('paso la autenticacion');
        next();
      } else {
        console.log('forbiden access',  userData.role, role);
        return res.status(401).json({ message: "Erreur: forbidden access.", role: userData.role });
      }
    } catch (err) {
      return res.status(401).json({ message: "Erreur: Requête non authentifiée" });
    }
  };
}

module.exports = authRole;
