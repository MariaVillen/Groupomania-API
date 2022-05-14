const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
      const userRol = decodedToken.userRol;
      const userData = await User.findByPk(userId);

      // User comparison to see if the user sent by the req.body and the user of the token are the same.
      if (req.body.userId && req.body.userId !== userId) {
        res.status(401).json({ message: "Erreur: User Id non valable" });
      }

      // Test Rol
      if ([].concat(role).includes(userData.role)) {
        next();
      } else {
        res.status(401).json({ message: "Erreur: forbidden access." });
      }
    } catch (err) {
      res.status(401).json({ message: "Erreur: Requête non authentifiée" });
    }
  };
}

module.exports = authRole;
