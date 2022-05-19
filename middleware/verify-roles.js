const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles || !req?.isActive) return res.sendStatus(403); //unhautorized
        const rolesArray = [...allowedRoles];
        // verify at least one valid role exists
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => vale===true);
        if (!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles;
