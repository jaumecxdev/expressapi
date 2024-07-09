var express = require('express');
var router = express.Router();
const UserIndexController = require('../../controllers/user/Index')

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/logout', UserIndexController.logout);
router.post('/create/org', UserIndexController.createorg);
router.post('/create/company', UserIndexController.createcompany);
router.post('/coin/mine', UserIndexController.mine);
router.post('/coin/transfer', UserIndexController.transfer);

module.exports = router;
