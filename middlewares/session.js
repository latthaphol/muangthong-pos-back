const jwt = require('jsonwebtoken')

var _sessionChecker = (req, res, next) => {
    console.log(`Session Checker: ${req.session.id}`.green);
    console.log(req.session);
    if (req.session.profile) {
        console.log(`Found User Session`.green);
        next();
    } else {
        console.log(`No User Session Found`.red);
        res.redirect('/login');
    }
};

const secret_key = 'secretkey'

var _genToken = async (user_data) => {
    return await jwt.sign(user_data, secret_key)
}

var _verifyToken = async (token) => {
    return await jwt.verify(token, secret_key)
}

exports.sessionChecker = _sessionChecker
exports.genToken = _genToken
exports._verifyToken = _verifyToken