require("dotenv").config();
const express = require("express");
const app = express();
const allRouter = require("./api/app.router");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/", allRouter);
const port = process.env.APP_PORT || 4000;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});
