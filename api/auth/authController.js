const model = require('./authModel')
const { success, failed } = require('../../config/response')

class authController {
    async login(req, res) {
        try {
            const { username, password } = req.body
            let user = await model.login(username)

            if (user.length > 0) {
                const compare_hash = true
                if (compare_hash) {
                    success(res, { user })
                } else {
                    failed(res, "รหัสผ่านไม่ถูกต้อง")
                }

            } else {
                failed(res, "ไม่พบผู้ใช้")
            }
        } catch (error) {
            console.log(error)
            failed(res, 'login fail')
        }
    }
}

module.exports = new authController() 