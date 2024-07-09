const fs = require('fs');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const gRPCConfig = require('../config/grpc.config.js');

const nodeChainIP = gRPCConfig.url;
const credentials = grpc.credentials.createSsl(
    fs.readFileSync('./certs/ca.crt'),         // @param rootCerts — The root certificate data.
    fs.readFileSync('./certs/client.key'),     // @param privateKey — The client certificate private key, if available.
    fs.readFileSync('./certs/client.crt')      // @param certChain — The client certificate key chain, if available.
)

// GRPC BLOCKCHAIN SERVICE
const blockchainProto = grpc.loadPackageDefinition(
    protoLoader.loadSync("./grpc/protos/blockchain.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
        defaults: true,
        oneofs: true
    })
).blockchainProto;

var grpcBlockchain =  new blockchainProto.Blockchain(nodeChainIP, credentials);
var grpcBlockchainMiddleware = (req, res, next) => {
    req.grpcBlockchain = grpcBlockchain;
    next();
}


// GRPC ACCOUNT SERVICE
const accountProto = grpc.loadPackageDefinition(
    protoLoader.loadSync("./grpc/protos/accounts.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
        defaults: true,
        oneofs: true
    })
).accountProto;

var grpcAccount =  new accountProto.Account(nodeChainIP, credentials);
var grpcAccountMiddleware = (req, res, next) => {
    req.grpcAccount = grpcAccount;
    next();
}


// GRPC COIN SERVICE
const coinProto = grpc.loadPackageDefinition(
    protoLoader.loadSync("./grpc/protos/coins.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
        defaults: true,
        oneofs: true
    })
).coinProto;

var grpcCoin =  new coinProto.Coin(nodeChainIP, credentials);
var grpcCoinMiddleware = (req, res, next) => {
    req.grpcCoin = grpcCoin;
    next();
}


module.exports = {
    blockchainProto, grpcBlockchain, grpcBlockchainMiddleware,
    accountProto, grpcAccount, grpcAccountMiddleware,
    coinProto, grpcCoin , grpcCoinMiddleware
}
