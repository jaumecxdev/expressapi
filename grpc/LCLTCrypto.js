
require('dotenv').config();
const fs = require("fs");
const crypto = require("crypto");

const passphrase = process.env.PASSPHRASE;
//console.log(passphrase);


/**
 * GENERATE KEYS FOR ACCOUNTS
 */

// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is "rsa"
// 2. An object with the properties of the key
// https://nodejs.org/api/crypto.html#cryptogeneratekeypairsynctype-options
exports.generate3Keys  = () => {
    // 'rsa', 'rsa-pss', 'dsa', 'ec', 'ed25519', 'ed448', 'x25519', 'x448', or 'dh'
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: "pem",
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: "pem",
            cipher: 'aes-256-cbc',
            //passphrase: ''
            passphrase: passphrase
        },
    });

    // openssl list -digest-algorithms
    // SHA-256 hashes are always 256 bits long
    const hashKey = crypto.createHash('sha256').update(publicKey).digest('hex');

    return { hashKey, publicKey, privateKey }
}


/**
 * Sign Transaction
 * 
 * @param privateKey
 * @param transaction ({ sender, payload })
 * @returns signed transaction ({ sender, signature, payload })
 */

exports.signTransaction = (privateKey, transaction) => {

    const signer = crypto.createSign("rsa-sha256");
    signer.update(transaction.payload);

    transaction.signature = signer.sign({
        key: privateKey,
        passphrase: passphrase
    }, "hex");

    return transaction;
}



/**
 * Verify Sign Transaction
 * 
 * @param publicKey
 * @param transaction ({ sender, signature, payload })
 * @returns verified (bool)
 */

exports.verifySignedTransaction = (publicKey, transaction) => {

    const verifier = crypto.createVerify("rsa-sha256")
    verifier.update(transaction.payload)

    return verifier.verify(publicKey, transaction.signature, "hex");
}










// OLD ENCRYPTS / DECRYPTS

exports.encryptText = (plainText) => {
    return crypto.publicEncrypt({
        key: fs.readFileSync('../public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    },
    // We convert the data string to a buffer
    Buffer.from(plainText)
    )
}
  
exports.decryptText = (encryptedText) => {
    return crypto.privateDecrypt(
      {
        key: fs.readFileSync('../private_key.pem', 'utf8'),
        // In order to decrypt the data, we need to specify the
        // same hashing function and padding scheme that we used to
        // encrypt the data in the previous step
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        passphrase: passphrase
      },
      encryptedText
)
}
