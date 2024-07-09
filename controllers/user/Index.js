const { signTransaction } = require('../../grpc/LCLTCrypto.js');
const { Account } = require('../../mongo/models/Account');
const { Token } = require('../../mongo/models/Token');
const { Coin } = require('../../mongo/models/Coin');
const { code } = require('../../config/constants.config.js');
const { CodeError, secureJsonParse } = require('../../helpers/Utils.js');

exports.logout = async (req, res) => {
    try {
        // req.user, access_token
        if (!req.body.access_token) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        await Token.findOneAndDelete({ access: req.body.access_token }).exec();

        res.status(201).json({
            status: true,
            result: {
                message: 'Logged out'
            }
        });
    
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error
        });
    }
}


// Create and Save a new Org
exports.createorg = async (req, res) => {
    try {
        // req.user, name, coin_code, coin_name, coin_equal
        if (!req.body.name) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const exists = await Account.exists({ type: 'orgs', ['info.name']: req.body.name }).exec();
        if (exists) {
            throw new CodeError({ code: code.ALREADY_EXISTS, message: "Org already exists" });
        }

        if (req.body.coin_code) {
            const coinExists = await Coin.exists({ code: req.body.coin_code }).exec();
            if (coinExists) {
                throw new CodeError({ code: code.ALREADY_EXISTS, message: "Coin already exists" });
            }
        }

        var org = null;
        var coin = null;

        // Create new Org
        const createOrgAccount = async (payload) => {
            const orgAccount = new Account({
                address: payload.account.address,
                publicKey: payload.account.public,
                privateKey: payload.account.private,
                type: 'orgs',
                info: {
                    name: req.body.name
                }
            });

            return await orgAccount.save();
        }

        // Create new Coin
        const createCoin = async (payload, org_address) => {
            const coinModel = new Coin({
                address: payload.coin,
                code: req.body.coin_code,
                name: req.body.coin_name,
                equal: req.body.coin_equal,
                org_address: org_address
            });

            return await coinModel.save();
        }

        const coinCallback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error creating coin account" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                var aa = arguments[1];

                coin = await createCoin(secureJsonParse(response.payload), org.address);
                if (coin == null) {
                    throw new CodeError({ code: code.ERROR, message: "Error creating coin" });
                }

                // Set Coin to Org
                await org.lcltSetCoinAddress(coin.address);

                // ORG WITH COIN
                res.status(201).json({
                    status: true,
                    result: {
                        message: "Org created successfully",
                        org: {
                            address: org.address,
                            name: org.info.name
                            //coin_address: org.info.coin_address
                        },
                        coin: {
                            address: coin.address,
                            code: coin.code,
                            name: coin.name,
                            equal: coin.equal
                        }
                    }
                });
            }
        }

        // Create new Blockchain Org account
        var transaction = signTransaction(req.user.privateKey, {
            sender: req.user.address,
            payload: JSON.stringify({ type: 'orgs' }),     // { type: 'orgs', name: req.body.name }
        });

        const orgCallback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error creating org account" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                // Create new user
                org = await createOrgAccount(secureJsonParse(response.payload));
                if (org == null) {
                    throw new CodeError({ code: code.ERROR, message: "Error creating org" });
                }
                // add Permits to org
                await org.lcltAddPermit('users', req.user.address, 'owner');
                // add Permits to User (sender)
                await req.user.lcltAddPermit('orgs', org.address, 'owner');
                
                // CREATE COIN ?
                if (req.body.coin_code) {

                    // Create new Blockchain Coin
                    var transaction = signTransaction(req.user.privateKey, {
                        sender: req.user.address,
                        payload: JSON.stringify({
                            org_address: org.address
                        }),
                    });

                    /* payload: JSON.stringify({
                        org_address: org.address, 
                        code: req.body.coin_code,
                        name: req.body.coin_name,
                        equal: req.body.coin_equal
                    }), */

                    await req.grpcCoin.create(transaction, coinCallback);
                }
                else {
                    // ORG WITHOUT COIN
                    res.status(201).json({
                        status: true,
                        result: {
                            message: "Org created successfully",
                            org: {
                                address: org.address,
                                name: org.info.name,
                                //chain_address: org.address
                            }
                        }
                    });
                }
            }
        };

        await req.grpcAccount.create(transaction, orgCallback);

    } catch (error) {
        res.status(500).json({
            status: false,
            error: { code: error.code, message: error.message }
        });
    }
}


// Create and Save a new Company
exports.createcompany = async (req, res) => {
    try {
        // req.user, name, org_address
        if (!req.body.name) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const companyExists = await Account.exists({ type: 'companies', ['info.name']: req.body.name }).exec();
        if (companyExists) {
            throw new CodeError({ code: code.ALREADY_EXISTS, message: "Company already exists" });
        }

        var company = null;
        var org = null;

        if (req.body.org_address) {
            org = await Account.findOne({ type: 'orgs', address: req.body.org_address }).exec();
            if (org == null) {
                throw new CodeError({ code: code.NOT_FOUND, message: "Org do not exists" });
            }
        }

        // Create new Company
        const createCompanyAccount = async (payload) => {
            const companyAccount = new Account({
                address: payload.account.address,
                publicKey: payload.account.public,
                privateKey: payload.account.private,
                info: {
                    name: req.body.name
                }
            });

            return await companyAccount.save();
        }

        const joinCallback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error joining company to org" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                // add Permits to company
                await company.lcltAddPermit('orgs', org.address, '');
                // add Permits to Org
                await org.lcltAddPermit('companies', company.address, '');

                // COMPANY WITH JOIN TO ORG
                res.status(201).json({
                    status: true,
                    result: {
                        message: "Company created successfully",
                        company: {
                            address: company.address,
                            name: company.info.name
                        },
                        org: {
                            address: org.address,
                            name: org.info.name
                        }
                    }
                });
            }
        }

        // Create new Blockchain Company account
        var transaction = signTransaction(req.user.privateKey, {
            sender: req.user.address,
            payload: JSON.stringify({ type: 'companies' }),
        });

        const companyCallback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error creating comnpany account" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                // Create new company
                company = await createCompanyAccount(secureJsonParse(response.payload));
                if (company == null) {
                    throw new CodeError({ code: code.ERROR, message: "Error creating company" });
                }
                // add Permits to company
                await company.lcltAddPermit('users', req.user.address, 'owner');
                // add Permits to User (sender)
                await req.user.lcltAddPermit('companies', company.address, 'owner');
                
                // JOIN TO ORG ?
                if (req.body.org_address) {

                    // Join company to Org
                    var transaction = signTransaction(req.user.privateKey, {
                        sender: req.user.address,
                        payload: JSON.stringify({
                            from: company.address,
                            to: req.body.org_address,
                            as: ''
                        }),
                    });

                    await req.grpcAccount.join(transaction, joinCallback);
                }
                else {
                    // COMPANY WITHOUT JOIN
                    res.status(201).json({
                        status: true,
                        result: {
                            message: "Company created successfully",
                            company: {
                                address: company.address,
                                name: company.info.name
                            }
                        }
                    });
                }
            }
        };

        await req.grpcAccount.create(transaction, companyCallback);

    } catch (error) {
        res.status(500).json({
            status: false,
            error: { code: error.code, message: error.message }
        });
    }
}


// Mine Coin by Org
exports.mine = async (req, res) => {
    try {
        // req.user, org_address, org_address
        if (!req.body.org_address || !req.body.count) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const org = await Account.findOne({ type: 'orgs', address: req.body.org_address }).exec();
        if (org == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "Org do not exists" });
        }

        const coin = await Coin.findOne({ address: org.info.coin_address }).exec();
        if (coin == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "Coin do not exists" });
        }

        // Mine Coin Blockchain
        var transaction = signTransaction(req.user.privateKey, {
            sender: req.user.address,
            payload: JSON.stringify({
                org_address: org.address,
                coin_address: org.info.coin_address,
                count: req.body.count
            }),
        });

        const callback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error mining coin" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                payload = secureJsonParse(response.payload);
                await org.lcltAddBalance(payload.coin, payload.count);
                
                res.status(201).json({
                    status: true,
                    result: {
                        message: "Mined Coin successfully",
                        count: payload.count,
                        org: {
                            address: payload.org,
                            balance: org.balances[payload.coin]
                        },
                        coin: {
                            address: payload.coin
                        }
                    }
                });
                
            }
        };

        await req.grpcCoin.mine(transaction, callback);

    } catch (error) {
        res.status(500).json({
            status: false,
            error: { code: error.code, message: error.message }
        });
    }
}


// Transfer Coin
exports.transfer = async (req, res) => {
    try {
        // req.user, from, to, coin_address, count
        if (!req.body.from || !req.body.to || !req.body.coin_address || !req.body.count) {
            throw new CodeError({ code: code.MISSING_PARAMS, message: "Content can not be empty" });
        }

        const from = await Account.findOne({ address: req.body.from }).exec();
        if (from == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "From do not exists" });
        }

        const to = await Account.findOne({ address: req.body.to }).exec();
        if (to == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "To do not exists" });
        }

        const coin = await Coin.findOne({ address: req.body.coin_address }).exec();
        if (coin == null) {
            throw new CodeError({ code: code.NOT_FOUND, message: "Coin do not exists" });
        }

        // Transfer Coin Blockchain
        var transaction = signTransaction(req.user.privateKey, {
            sender: req.user.address,
            payload: JSON.stringify({
                from: req.body.from, 
                to: req.body.to,
                coin_address: req.body.coin_address,
                count: req.body.count
            }),
        });

        const callback = async (err, response) => {
            if (err) {
                throw new CodeError({ code: code.CHAIN_ERROR, message: "Error mining coin" });
            } else {
                console.log("Response: " + JSON.stringify(response));
                
                payload = secureJsonParse(response.payload);
                await from.lcltSubBalance(payload.coin, payload.count);
                await to.lcltAddBalance(payload.coin, payload.count);
                
                res.status(201).json({
                    status: true,
                    result: {
                        message: "Transfer Coin successfully",
                        count: payload.count,
                        coin: {
                            address: payload.coin,
                        },
                        from: {
                            address: from.address,
                            balance: from.balances[payload.coin]
                        },
                        to: {
                            address: to.address,
                            balance: to.balances[payload.coin]
                        }
                    }
                });
            }
        };

        await req.grpcCoin.transfer(transaction, callback);

    } catch (error) {
        res.status(500).json({
            status: false,
            error: { code: error.code, message: error.message }
        });
    }
}