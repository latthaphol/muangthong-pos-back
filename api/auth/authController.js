const model = require('./authModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { genToken } = require('../../middlewares/session');

class authController {
    async login(req, res) {
        try {
            const fields = ["username", "password"]
            let { object: { username, password }, missing } = await check_field(req, fields)
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                // UID000001
                var regUsername = /UID(\d{6})/
                if (regUsername.test(username)) {
                    let user_id = Number(username.substr(3, username.length))
                    const result = await model.login(user_id)
                    if (result.length > 0) { // found user
                        let user = result[0]
                        if (password != user.user_password) { // incorrect password
                            failed(res, "Your password is incorrect!")
                        } else {
                            // Password correct
                            let user_data = { username, user_id, user_fname: user["user_fname"], user_lname: user["user_lname"], user_email: user["user_email"], point: user["point"] }
                            const token = await genToken(user_data)
                            success(res, { token, ...user_data }, "login success")
                        }
                    } else { // not found user
                        failed(res, "User not found.")
                    }
                } else {
                    failed(res, 'Your username is incorrect!')
                }
            }
        } catch (error) {
            console.log(error)
            failed(res, 'login fail')
        }
    }

    async logout(req, res) {
        try {
            req.session.destroy();
            success(res, { message: "You was logged out." })
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async register(req, res) {
        try {
            const fields = ["user_fname", "user_lname", "user_email", "user_password"]
            let { object, missing } = await check_field(req, fields, { user_type: 0, point: 0 })
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                await model.register(obj)
                success(res, { message: "Register success.", object })
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }
}

module.exports = new authController() 