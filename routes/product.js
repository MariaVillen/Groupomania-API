
const express = require('express');

const productController = require('../controllers/products');
const isAuth = require('../middleware/is-auth');
const multer = require('../middleware/multer-config.js');

const router = express.Router();

router.post ('/:id/like', isAuth, productController.postLikeSauce); // User make a like, dislike
router.get('/:id', isAuth, productController.getSauceById); // User get a sauce detail
router.put('/:id', isAuth, multer, productController.putUpdateSauce); // User modify the sauce
router.delete('/:id', isAuth, productController.deleteSauce); // User remove the sauce
router.get('/', isAuth, productController.getAllSauces); // User get all sauces from DB
router.post('/', isAuth, multer, productController.postAddSauce); // User add a Sauce to the DB

module.exports = router;