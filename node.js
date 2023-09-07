const https = require("http");
const fs=require('fs')
const path = require("path");
var express = require("express");
var app = express();
const server = https.createServer(app);
const dotenv = require("dotenv");
dotenv.config();
const reviewScrapper = require("./Controllers/reviewScrapper");

app.use(express.json())





app.use("/", reviewScrapper);


server.listen(process.env.PORT, (req, res) => {
  console.log("hii")
})
module.exports=server;
