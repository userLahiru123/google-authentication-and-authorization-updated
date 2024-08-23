const { authenticateJWT } = require("../auth/token_validation");
const { googleAuthentication, callBackFromIdp, getToken, getUsers } = require("./login/login.controller");

const router = require("express").Router();

router.get("/auth",googleAuthentication);
router.get("/auth-callback",callBackFromIdp);
router.get("/token",getToken);
router.get("/users",authenticateJWT,getUsers);

module.exports = router;