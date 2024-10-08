const { Issuer, generators } = require('openid-client');
const { saveUser, saveAuthStateDetails, retrieveAuthStateDetails, saveRefreshToken, getRefreshToken } = require("./login.service");
const jwt = require("jsonwebtoken");
const { getUsers } = require('../users/user.service');
const { generateToken } = require('../../auth/token_validation');
// const { LocalStorage } = require('node-localstorage');
require('dotenv').config();
var { localStorage } = require('local-storage');
const http = require('http');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let client = null;

module.exports = {

  googleAuthenticationHandler: async (req, res) => {
    const googleIssuer = await Issuer.discover('https://accounts.google.com');
    client = new googleIssuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: REDIRECT_URI,
      response_types: ['code'],
    });

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();
    const value = generators.nonce();
    const generatedNonce = value;

    const authUrl = client.authorizationUrl({
      redirect_uri: REDIRECT_URI,
      scope: 'openid email profile',
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      state: state,
      // nonce: generatedNonce
    });

    //save auth state details..........
    saveAuthStateDetails(state, code_challenge, code_verifier, generatedNonce, authUrl);

    req.session.nonce = generatedNonce;
    res.redirect(authUrl);
  },

  authCallBackHandler: async (req, res) => {
    const { code, state } = req.query;
    const nonce = req.query.nonce;
    const myState = state;

    // Retrieve state and code_verifier from auth_state table............
    const result = await retrieveAuthStateDetails(state);

    const { code_verifier } = result.rows[0];

    const tokenSet = await client.callback('http://localhost:3000/auth-callback', { code, myState }, {
      code_verifier: code_verifier,
      redirect_uri: REDIRECT_URI
    });

    // const refreshToken = tokenSet.refresh_token;
    const userinfo = await client.userinfo(tokenSet.access_token);
    const userSub = userinfo.sub;
    const userMail = userinfo.email;

    res.cookie('user_sub', userSub, {
      httpOnly: true,
      secure: true
    });

    // Save user info to the user table
    await saveUser(userinfo);

    //generate refresh token.......
    const myRefreshToken = generateToken(32);

    //save in local storage..............
    if (typeof localStorage === "undefined" || localStorage === null) {
      var LocalStorage = require('node-localstorage').LocalStorage;
      localStorage = new LocalStorage('./scratch');
    }
    localStorage.setItem('token', myRefreshToken, (7 * 24 * 60 * 60 * 1000));

    // Save refresh token
    await saveRefreshToken(userSub, myRefreshToken);

    res.cookie('APP_REFRESH_TOKEN', myRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });

    res.redirect('/token');
  },

  tokenHandler: async (req, res) => {
    const appRefreshToken = await req.cookies.APP_REFRESH_TOKEN;

    if (!appRefreshToken) {
      res.send("Unauthorized user");
    }

    // check exist refresh token in database
    const tokenResult = getRefreshToken(appRefreshToken);
    if (!tokenResult) {
      res.send("Unauthorized token");
    }

    const { access_token } = req.query;
    const payload = { access_token };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const refreshtoken = 'Bearer ' + token;

    // res.options.headers('authorization', 'Bearer ' + token);

    res.cookie('refreshtoken', refreshtoken, {
      httpOnly: true,
      secure: true
    });

    res.redirect('/users');
  },

  usersHandler: async (req, res) => {
    const user_sub = await req.cookies.user_sub;
    const result = await getUsers(user_sub);
    res.json(result.rows);
  }
};