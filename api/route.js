// Your main file

const auth = require("../api/auth/authRoute");
const struct = require("../api/struct/structRoute");
const product = require("../api/product/productRoute");
const employee = require("../api/employee/employeeRoute");
const promotion = require("../api/promotion/promotionRoute");
const member = require("./Member/memberRoute");
const dashboard = require("./Dashboard/DashboardRoute");
const apriori = require("./apriori/aprioriRoute"); // Adjust the path accordingly

exports.routeApi = (app, version) => {
    app.use(version + "/auth", auth);
    app.use(version + "/struct", struct);
    app.use(version + "/product", product);
    app.use(version + "/employee", employee);
    app.use(version + "/promotion", promotion);
    app.use(version + "/member", member);
    app.use(version + "/dashboard", dashboard);
    app.use(version + "/apriori", apriori);
};
