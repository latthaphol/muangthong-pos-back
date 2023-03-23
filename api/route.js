const auth = require("../api/auth/authRoute");

exports.routeApi = (app, version) => {
     app.use(version + "/auth", auth);
};