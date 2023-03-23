const express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require("cookie-session");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
// const COOKIE = require("config").get("COOKIE");

require("dotenv").config();

const app = express();
const port = 4000;
const version = "/api/v1";

// path file
const path = require("path");
app.use(version + "/static", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 400,
});

app.use(limiter);

var corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    optionsSuccessStatus: 200,
    preflightContinue: true,
    credentials: true,
};
app.use(cors(corsOptions));

app.get('/', function (req, res) {
    res.send('Express.js is now online.');
});

const server = app.listen(port, function () {
    console.log(`Backend is running port: http://localhost:${port}`);
});

const { routeApi } = require("./api/route");
routeApi(app, version);

module.exports = server;
