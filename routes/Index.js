var express = require('express');
var router = express.Router();
const IndexController = require('../controllers/Index')

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/register', IndexController.register);
router.post('/login', IndexController.login);
router.post('/refresh', IndexController.refresh);

module.exports = router;
