const express = require('express')
const AuthController = require('../controllers/Auth')
const UserController = require('../controllers/user/User')
const router = express.Router();

/* router.get('/', UserController.findAll);
router.get('/:id', UserController.findOne); */
/* router.patch('/:id', UserController.update);
router.delete('/:id', UserController.destroy); */
router.post('/create', AuthController.create);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshTokens);
router.delete('/logout', AuthController.logout);

module.exports = router