require("dotenv").config();
const express = require("express");
const app = express();
const allRouter = require("./api/app.router");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { generateRSAKeyPair } = require("./auth/token_validation");

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use("/", allRouter);
const port = process.env.APP_PORT || 4000;
app.listen(port, () => {
  generateRSAKeyPair();
  console.log("server up and running on PORT :", port);
});
