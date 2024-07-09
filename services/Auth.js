require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Account } = require('../mongo/models/Account');

// Check Access Token
exports.checkAccessToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader == null) {
        res.status(403).json({"message": "Header not present"});
    }

    const access_token = authHeader.split(' ')[1];
    if (access_token == null) {
        res.status(403).json({"message": "Access Token not present"});
    }

    //const access_token_db = await Model.Token.findOne({ access: req.body.access_token }).exec();
    //if (access_token_db == null) res.status(403).json({"message": "Access Token not found"});

    jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(403).json({"message": err.message}); // "jwt expired", "invalid token"
        }
        else {
            // user.user == email
            req.user = await Account.findOne({ type: 'users', ['info.email']: user.user }).exec();
            next();
        }
    });
}

// Check Admin Access Token
exports.checkAdminAccessToken = async (req, res, next) => {
    if (req.user.role >= 2) {
        res.status(403).json({
            status: false,
            error: {
                message: req.app.get('env') === 'development' ? "Insufficient permissions" : {},
            }
        });
    }
    else {
        req.user = user;
        next();
    }
}
