const Users = require("../models/User");

//router.get("/", userController.getAllUsers);
exports.getAllUsers = (req, res) => {
    Users.findAll({ order: [
        ['createdAt', 'DESC'],
    ]})
    .then((data) => {
        res.status(200).send(data);
    })
    .catch((err) => {
        res.status(401).send(err);
    });    
};

//router.get("/:id", userController.getUserById);
exports.getUserById = (req, res) => {
    Users.findOne({ where: {id: req.params.id} })
    .then((data) => {
        res.status(200).send(data);
    })
    .catch((err) => {
        res.status(401).send(err);
    }); 
};

//router.put("/:id", userController.updateUser);
exports.updateUser = (req, res) => {
    res.status(200).send('modify user');
};

//router.delete("/delete", userController.deleteUser);
exports.deleteUser = (req, res) => {
    res.status(200).send('delete user');
};


