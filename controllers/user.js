const Users = require("../models/User");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {validation} = require("../helpers/validation");


//*******************************************/
//router.get("/", userController.getAllUsers);
exports.getAllUsers = (req, res) => {

    const role = req.userRole;
    const userId = req.userId;

    // Visible content for admins
    if (role === 'admin') {
    Users.findAll( {

      attributes: { 
        exclude: ['password']
      }, 
        
      order: [['createdAt', 'DESC']]

    })
    .then((data) => {
        res.status(200).json(data);
    })
    .catch((err) => {
        res.status(500).json({DataBaseError: err});
    });    
    } else {
      // Visible Content for Users
      Users.findAll( {
        attributes: { 
          exclude: ['password', 'email', 'deleteAt']
        }, 
        order: [['createdAt', 'DESC']],
        where: {
          isActive: 1,
          idUsers: {[Op.not]: userId}
        }
      })
      .then((data) => {
          res.status(200).json(data);
      })
      .catch((err) => {
          res.status(500).json({DataBaseError: err});
      });    
    }
};



//*******************************************/
//router.get("/:id", userController.getUserById);
exports.getUserById = (req, res) => {

    const userId = parseInt(req.params.id);
    const role = req.userRole;

    if (!userId) {
        return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
    }

    // If user is asking for his own information

    if(req.userId === userId) {
      Users.findOne({ where: {idUsers: userId} })
      .then((data) => {
          res.status(200).json(data);
      })
      .catch((err) => {
          res.status(500).json({DataBaseError: err});
      }); 

    } else {
    
      // if User is asking for others information
      let excludedInfo;
      if (role==='admin') { 
        excludedInfo = ['password'];
      } else {
        excludedInfo = ['password','email','deletedAt'];
     }

      Users.findOne({ 
        where: {idUsers: userId}, 
        attributes: {exclude: excludedInfo}})
      .then((data) => {
          res.status(200).json(data);
      })
      .catch((err) => {
          res.status(500).json({DataBaseError: err});
      }); 
    }
};


//*******************************************/
//router.put("/:id/admin", userController.updateUserByAdmin);
 // This is used only to update name, lastName, email, activate, and change role

exports.updateUser = (req, res) => {

  // Requester data
 const userRole= req.userRole;
 const userIdReq = req.userId;

 // Confirm if userId exists
 const userId = parseInt(req.params.id);
 if (!userId) {
     return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
 } 


  const getInfoAllowed = async (userRole, userIdReq, user)=>{

      // Check that user to modify is not admin
      if (user.role === 'admin' && user.idUsers !== userIdReq) {
        return req.status(401).json({Error: "Vous ne pouvez pas modifier les données d'un administrater."})
      } 
      // Check if the rol is of admin but modify a user
      else if (userRole === 'admin' && user.role === 'user') {
        try {
          return {
            lastName: validation.isName(req.body.user.lastName), 
            name: validation.isName(req.body.user.name), 
            email: validation.isEmail(req.body.user.email), 
            isActive: validation.isBoolean(req.body.user.isActive), 
            role: req.body.user.role,
            bio: validation.cleanWhiteSpace(req.body.user.bio)}
        } catch(err) {
          return req.status(400).json({Error: err.message});
        }
      } 
         
        // Check if the rol is user that modify his information
        else if (userRole ==='user' && userIdReq === user.idUsers) {
          console.log('por ahora bien');
          // Hash Password
          let password;
          try{
          const pass = validate.isPassword(req.body.user.password);
          } catch(err){
            return req.status(400).json({Error: err.message});
          }
          if (pass) {
            password = await bcrypt.hash(pass, 12);
            console.log(password);
          }
          return {
            bio: req.body.user.bio,
            password: password}
        } else {
          return res.status(400).json({message: 'No puedes modificar datos de otro user'})
        }

  }

 // Find User to Update 
 
 Users.findByPk(userId).then(
   async (user) => {
    if(user){
      const modifiedUser = await getInfoAllowed(userRole, userIdReq, user);

      Users.update({...modifiedUser}, {
       where: { idUsers: userId}})
       .then(()=>{
          if(req.body.user.password) {

            //TODO: destruir token anterior
            const token = req.headers.authorization.split(" ")[1];
            //jwt.destroy(token);
            
            //enviar nuevo token
            res.status(200).json({
              userId: user.idUsers,
              userRole: user.role,
              token: jwt.sign(
                { userId: user.idUsers, userRole: user.role },
                process.env.SECRET_TOKEN,
                {
                  expiresIn: "1h",
                }
              ),
            });
          } else {
          res.status(200).json({message: 'Utilisateur modifié'});
          }
       }).catch((err)=>{res.status(400).json({message: 'error update' + err.message})})
      }
   }
 ).catch((err) => res.status(400).json({Erreur: 'error: ' + err.message}));
}


//router.put("/:id", userController.updateUser);

  /*
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
};*/

//router.delete("/delete", userController.deleteUser);
exports.deleteUser = (req, res) => {

  //TODO: KILL TOKEN
  const userToDelete = parseInt(req.params.id);
  if (!userToDelete) {
    return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
  } 

  const role = req.userRole;
  const userRequester = req.userIdReq;

  if (role === 'admin' || userRequester === userToDelte) {

    Users.destroy({
      where: {
        idUsers: userToDelete
      }
    })
    .then(()=>{
      res.status(200).json({message: "Utilisateur supprimé"});
    })
    .catch((err)=>{
      res.status(500).json({DataBaseError: err.message});
    })
  } else {
    return res.status(400).json({message: "Vous devez être administrateur pour effacer la compte d'une autre personne"});
  }

};