const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();

module.exports = {
  authenticateJwtHandler: async (req, res, next) => {
  const access_token = await req.cookies.asToken;

    if (!access_token) return res.status(403).send('A token is required for authentication');

    try {
        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
  },

  generateToken: (size)=> {
    return crypto.randomBytes(size).toString("base64url");
  }
};
