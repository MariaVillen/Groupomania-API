const verifyRoles = (allowedRoles) => {
    return (req, res, next) => {
        console.log(req.role);
        if (!req?.role) return res.status(403).json({'error': 'No role passed'}); //unhautorized
        // verify at least one valid role exists
        const result = allowedRoles.includes(req.role);
        if (!result) return res.status(401).json({'error': 'No role authorized'});// no roles forbidden.
        next();
    }
}

module.exports = verifyRoles;
