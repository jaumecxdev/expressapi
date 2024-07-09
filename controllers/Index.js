const bcrypt = require('bcrypt');
const { Account } = require('../mongo/models/Account');
const { Token } = require('../mongo/models/Token');
const { code } = require('../config/constants.config.js');
const { CodeError, secureJsonParse, generateTokens } = require('../helpers/Utils.js');

// Register and Save a new user
exports.register = async (req, res) => {

    try {
        if (!req.body.email && !req.body.password) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const exists = await Account.exists({ type: 'users', ['info.email']: req.body.email }).exec();
        if (exists) {
            throw new CodeError({ code: code.ALREADY_EXISTS, message: "User already exists" });
        }

        const createUserAccount = async (payload) => {
            const userAccount = new Account({
                address: payload.account.address,
                publicKey: payload.account.public,
                privateKey: payload.account.private,
                type: 'users',
                info: {
                    email: req.body.email,
                    password: await bcrypt.hash(req.body.password, 10),
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    phone: req.body.phone,
                    role: 'user',    // super_admin (tech admin), admin (manager admin), user (user)
                }
            });

            return await userAccount.save();
        }

        const callback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error creating user account" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                // Create new user
                const user = await createUserAccount(secureJsonParse(response.payload));
                if (user == null) {
                    throw new CodeError({ code: code.ERROR, message: "Error creating user" });
                }

                const { accessToken, refreshToken } = await generateTokens(user._id, user.info.email);

                res.status(201).json({
                    status: true,
                    result: {
                        message: "User created successfully",
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            address: user.address,
                            email: user.info.email,
                            firstName: user.info.firstName,
                            lastName: user.info.lastName,
                            phone: user.info.phone
                        }
                    }
                });
            }
        }

        // Create new Blockchain user account
        const transaction = {
            sender: '',
            signature: '',
            payload: JSON.stringify({
                //type: req.body.type,
                /* email: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone */
            }),
        }

        await req.grpcAccount.create(transaction, callback);

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error
        });
    }
};

// Create new User Tokens
exports.login = async (req, res) => {
    try {
        if (!req.body.email && !req.body.password) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const user = await Account.findOne({ type: 'users', ['info.email']: req.body.email }).exec();
        if (user == null) {
            throw new CodeError({ code: code.ERROR, message: "User does not exist" });
        }

        const passOk = await bcrypt.compare(req.body.password, user.info.password);
        if (!passOk) {
            throw new CodeError({ code: code.ERROR, message: "Password Incorrect" });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id, req.body.email);

        res.status(201).json({
            status: true,
            result: {
                message: "Login successfull",
                access_token: accessToken,
                refresh_token: refreshToken
            }
        });
    
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error
        });
    }
}

// Refresh User Tokens
exports.refresh = async (req, res) => {
    try {
        if (!req.body.email && !req.body.refresh_token) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const user = await Account.findOne({ type: 'users', ['info.email']: req.body.email }).exec();
        if (user == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "User does not exist" });
        }

        const oldRefreshToken = await Token.findOneAndDelete({ refresh: req.body.refresh_token }).exec();
        if (oldRefreshToken == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "Token does not exist" });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id, req.body.email);
        
        res.status(200).json({
            status: true,
            result: {
                message: "Token refreshed successfully",
                access_token: accessToken,
                refresh_token: refreshToken
            }
        });
    
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error
        });
    }
}