const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const fs = require('fs');

exports.currentPath = process.cwd();
exports.myFs = fs

require("dotenv").config();
const app = express();
const port = 4000;
const version = "/api/v1";

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
// path file
app.use('/static', express.static(__dirname + '/static'));

// const limiter = rateLimit({
//     windowMs: 60 * 1000,
//     max: 400,
// });

// app.use(limiter);

// auth session
const oneDay = 1000 * 60 * 60 * 24;
app.set('trust proxy', 1) // trust first proxy
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());

var corsOptions = {
    optionsSuccessStatus: 200,
    preflightContinue: true,
    credentials: true,
};
app.use(cors(corsOptions));

app.get('/', function (req, res) {
    res.send('Express.js is now online.');
});

const index = app.listen(port, function () {
    console.log(`Backend is running port: http://localhost:${port}`);
});

const { routeApi } = require("./api/route");
routeApi(app, version);

module.exports = index;
