const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
    userId = decodedToken.userId;

    // User comparison to see if the user sent by the req.body and the user of the token are the same.
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json({ message: "Erreur: User Id non valable" });
    } else {
      next();
    }
  } catch (err) {
    res.status(401).json({ message: "Erreur: Requête non authentifiée" });
  }
};
