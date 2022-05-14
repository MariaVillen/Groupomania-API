const Users = require("../models/User");

//router.get("/", userController.getAllUsers);
exports.getAllUsers = (req, res) => {

    Users.findAll({ order: [
        ['createdAt', 'DESC'],
    ]})
    .then((data) => {
        res.status(200).json(data);
    })
    .catch((err) => {
        res.status(500).json({DataBaseError: err});
    });    
};

//router.get("/:id", userController.getUserById);
exports.getUserById = (req, res) => {

    const userId = parseInt(req.params.id);

    if (!userId) {
        return res.status(400).json({Erreur: "Indiquez l'Id de l'utilisateur"})
    }
    Users.findOne({ where: {id: userId} })
    .then((data) => {
        res.status(200).json(data);
    })
    .catch((err) => {
        res.status(500).json({DataBaseError: err});
    }); 
};

//router.put("/:id", userController.updateUser);
exports.updateUser = (req, res) => {


   // Confirm if userId exists
    const userId = parseInt(req.params.id);

    if (!userId) {
        return res.status(400).json({Erreur: "Indiquez l'Id de l'utilisateur"})
    } 


    Users.update({ profilePicture, coverPicture, bio, password, id:  req.params.id}, { where: {id: req.params.id} })
    .then(() => res.status(200).json({ message: 'Utilisateur modifié !'}))
    .catch(error => res.status(400).json({ error }));

    res.status(200).json('modify user');


    const prodId = req.params.id;
  if (req.file) {
    Sauce.findById(prodId)
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        const sentImageUrl = `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`;

        // Removing old file image and updating sauce
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: prodId },
            {
              ...JSON.parse(req.body.sauce),
              _id: prodId,
              imageUrl: sentImageUrl,
            }
          )
            .then(() => {
              res.status(200).json({ message: "Objet modifié" });
            })
            .catch((err) =>
              res.status(400).json({ message: "Erreur: " + err })
            );
        });
      })
      .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
  } else {
    console.log(req.body);
    // Updating data sauce when image was not changed
    Sauce.updateOne({ _id: prodId }, { ...req.body, _id: prodId })
      .then(() => {
        // Modify Message if update has partially failed because image was not modify on mimetype error
        const message = req.mimetypeError
          ? "Objet modifié. Erreur: L'image n'a pas été modifiée. Veuillez ajouter une image dans le format correct: png, jpg, jpeg."
          : "Objet modifié.";
        res.status(200).json({ message: message });
      })
      .catch((err) => res.status(400).json({ message: "Erreur: " + err }));
  }
};

exports.activateUser = (req,res) => {
    const userId = parseInt(req.params.id);

    if (!userId) {
        return res.status(400).json({Erreur: "Indiquez l'Id de l'utilisateur"})
    }

    if(!req.isActive) {
        return res.status(400).json({Erreur: "Parametres manquantes (isActive)"})
    }



}

//router.delete("/delete", userController.deleteUser);
exports.deleteUser = (req, res) => {
    res.status(200).json('delete user');
};


