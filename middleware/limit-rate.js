const expressLimit = require("express-rate-limit");

//Limit Conections
const maxAttempts = expressLimit({
  // Miliseconds delay
  windowMs: 5 * 60 * 1000, // 15 minutes<
  // Conection times auth
  max: 5,
  message:
    "Votre compte est bloqué pendant quelques minutes suite aux tentatives de connexions échouées !",
});

module.exports = maxAttempts;
