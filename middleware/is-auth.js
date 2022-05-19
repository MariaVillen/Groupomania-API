const jwt = require("jsonwebtoken");

// Needs req.body.requestingUserId!

const isAuth = (req, res, next)  => {
  console.log("entra");
  return async (req, res, next) => {
      // Verify if is there is a token
      const authHeader = req.headers.authorization || req.headers.Authorization;
      
      // If header not on right format
      if (!authHeader?.startsWith('Bearer ')) { return res.sendStatus(401);}
    
      const token = authHeader.split(" ")[1];

      // Decode Token to extract userId
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
      req.userId = decodedToken.UserInfo.userId;
      req.role = decodedToken.UserInfo.userRole;

      next();
  //     const userRole = Object.keys(ROLES_LIST).includes(role);
  //     const requestingUserId = parseInt(req.body.requestingUserId);
      
  //     // Data of authenticated user
  //     //const userData = await Users.findByPk(userId);

  //     // User comparison to see if the user sent by the req.body and the user of the token are the same.
  //     if (requestingUserId && requestingUserId !== userId) {
  //       ç;
  //       return res.status(401).json({ error: "User id non valable" });
  //     }

  //     // Test Rol
  //     if ([].concat(roleAllowed).includes(/*userData.role*/ userRole)) {
  //       req.userRole = userData.role;
  //       req.userId = userData.idUsers;
  //       next();
  //     } else {
  //       return res
  //         .status(401)
  //         .json({ error: "Accès interdit pour " + userData.role });
  //     }
  //   } catch (err) {
  //     return res.status(401).json({ error: "Requête non authentifiée" });
  //   }
  // };
}
}

module.exports = isAuth;
