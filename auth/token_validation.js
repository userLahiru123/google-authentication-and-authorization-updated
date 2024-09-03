const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();

module.exports = {
  authenticateJwtHandler: async (req, res, next) => {
    const token = await req.cookies.refreshtoken;

    // if (authHeader.startsWith("Bearer ")) {
    //   refresh_token = authHeader.substring(7, authHeader.length);
    // }

    if (token.startsWith("Bearer ")) {
      refresh_token = token.substring(7, token.length);
    }

    if (!refresh_token) return res.status(403).send('A token is required for authentication');

    try {
      const decoded = jwt.verify(refresh_token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
    } catch (err) {
      return res.status(401).send('Invalid Token');
    }
    return next();
  },

  generateToken: (size) => {
    return crypto.randomBytes(size).toString("base64url");
  }
};