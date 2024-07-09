const express = require('express')
const router = express.Router();
const ChainController = require('../../controllers/user/Chain')

router.get('/address', ChainController.address);

module.exports = router