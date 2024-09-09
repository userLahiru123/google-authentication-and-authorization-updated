const crypto = require("crypto");
require('dotenv').config();
const { generateKeyPair } = require('jose');
const { jwtVerify } = require('jose');
let PRIVATE_KEY;
let PUBLIC_KEY;

module.exports = {
  authenticateJwtHandler: async (req, res, next) => {
    const token = await req.cookies.refreshtoken;

    if (token.startsWith("Bearer ")) {
      refresh_token = token.substring(7, token.length);
    }

    if (!refresh_token) return res.status(403).send('A token is required for authentication');

    try {
      const { payload } = await jwtVerify(refresh_token, PUBLIC_KEY);
      req.user = payload;
    } catch (err) {
      return res.status(401).send('Invalid Token');
    }

    return next();
  },

  generateToken: (size) => {
    return crypto.randomBytes(size).toString("base64url");
  },

  generateRSAKeyPair: async () => {
    // Generate an RSA key pair with a modulus length of 2048 bits
    const { publicKey, privateKey } = await generateKeyPair('RS256', {
      modulusLength: 2048,
    });

    PUBLIC_KEY = publicKey;
    PRIVATE_KEY = privateKey;
  },

  getPublicKey: () => {
    return PUBLIC_KEY;
  },

  getSigningKey: () => {
    return PRIVATE_KEY;
  }
};