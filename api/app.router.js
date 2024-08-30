const { authenticateJwtHandler } = require("../auth/token_validation");
const { googleAuthenticationHandler, authCallBackHandler, tokenHandler, usersHandler } = require("./login/login.controller");

const router = require("express").Router();

router.get("/auth",googleAuthenticationHandler);
router.get("/auth-callback",authCallBackHandler);
router.get("/token",tokenHandler);
router.get("/users",authenticateJwtHandler,usersHandler);

module.exports = router;