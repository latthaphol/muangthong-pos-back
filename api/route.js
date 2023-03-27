const auth = require("../api/auth/authRoute");
const struct = require("../api/struct/structRoute");
const product = require("../api/product/productRoute");

exports.routeApi = (app, version) => {
     app.use(version + "/auth", auth);
     app.use(version + "/struct", struct);
     app.use(version + "/product", product);
};