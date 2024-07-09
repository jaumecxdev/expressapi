require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Token } = require('../mongo/models/Token');

class CodeError extends Error {
    constructor(args){
        super(args);
        this.code = args.code;
        this.message = process.env.NODE_ENV === 'development' ? args.message : "";
    }
}


const secureJsonParse = (str) => {
    try{
       return JSON.parse(str);
    }catch (e){
       return {};
    }
}


const generateAccessToken = (user) => {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3000m'});        // 30m
    return accessToken;
}

const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '5000m'});      // 50m
    return refreshToken;
}

const generateTokens = async (userId, email) => {
    const accessToken = generateAccessToken({ user: email });
    const refreshToken = generateRefreshToken({ user: email });

    // Production: Save Tokens in Redis Cache
    const tokenModel = new Token({
        access: accessToken,
        refresh: refreshToken,
        userId: userId,
    });

    await tokenModel.save();
    
    return { accessToken, refreshToken }
}

module.exports = {
    CodeError,
    secureJsonParse,
    generateTokens
}