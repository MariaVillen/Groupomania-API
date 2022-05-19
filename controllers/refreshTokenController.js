const jwt = require("jsonwebtoken");
const ROLES_LIST = require('../utils/roles_list');


exports.refreshTokenHandler = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await Users.findOne({ where: { refreshToken: cookies.jwt } });
  if (!foundUser) return res.status(403); //forbidden

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decodedToken) => {
      if (err || foundUser.idUsers !== decodedToken.userId)
        return res.sendStatus(403);
      const accessToken = jwt.sign(
        { "UsernameInfo": {
            userId: decodedToken.userId,
            userRole: ROLES_LIST[foundUser.role]
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expires: "15m" }
      );
      res.json({
        userId: foundUser.idUsers,
        userRole: foundUser.role,
        accessToken: accessToken,
      });
    }
  );
}; // end function
