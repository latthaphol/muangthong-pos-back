const auth = require("../api/auth/authRoute");
const struct = require("../api/struct/structRoute");
const product = require("../api/product/productRoute");
const employee = require("../api/employee/employeeRoute");
const promotion = require("../api/promotion/promotionRoute");


exports.routeApi = (app, version) => {
     app.use(version + "/auth", auth);
     app.use(version + "/struct", struct);
     app.use(version + "/product", product);
     app.use(version +"/employee",employee);
     app.use(version +"/promotion",promotion)
};