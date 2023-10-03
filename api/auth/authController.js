const model = require("./authModel");
const { success, failed } = require("../../config/response");
const { check_field } = require("../../middlewares/utils");
const { genToken } = require("../../middlewares/session");
const { formatMID } = require("../../middlewares/formatter");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class authController {
  async login(req, res) {
    try {
      const fields = ["user_username", "user_password"];
      let {
        object: { user_username, user_password },
        missing,
      } = await check_field(req, fields);

      if (missing.length > 0) {
        failed(res, `Column "${missing}" is missing!`);
      } else {
        const result = await model.loginByUsername(user_username);

        if (result.length > 0) {
          let user = result[0];
          const isPasswordValid = await bcrypt.compare(
            user_password,
            user.user_password
          ); // Verify the password using bcrypt

          if (!isPasswordValid) {
            failed(res, "Your password is incorrect!");
          } else {
            let user_data = {
              uid: `UID${user.user_id.toString().padStart(6, "0")}`,
              user_id: user.user_id,
              user_username: user["user_username"], // Changed from 'user_email' to 'user_username'
              user_type: user["user_type"],
            };

            const memberInfo = await model.getMemberByUserId(user.user_id);

            if (memberInfo) {
              user_data.member_id = memberInfo.member_id;
              user_data.member_fname = memberInfo.member_fname;
              user_data.member_lname = memberInfo.member_lname;
              user_data.member_email = memberInfo.member_email;
              user_data.is_active = memberInfo.is_active;
              user_data.member_address = memberInfo.member_address;
              user_data.member_phone = memberInfo.member_phone;
            }

            const token = await genToken(user_data);
            success(res, { token, ...user_data }, "login success");
          }
        } else {
          failed(res, "ไม่มีผู้ใช้งาน");
        }
      }
    } catch (error) {
      console.log(error);
      failed(res, "login fail");
    }
  }

  async logout(req, res) {
    try {
      req.session.destroy();
      success(res, { message: "You was logged out." });
    } catch (error) {
      console.log(error);
      failed(res, "Internal Server Error");
    }
  }

  async register(req, res) {
    try {
      const fields = ["user_username", "user_password"];
      let { object, missing } = await check_field(req, fields, {});

      if (missing.length > 0) {
        failed(res, `Column "${missing}" is missing!`);
      } else {
        // Encode the password using bcrypt
        const hashedPassword = await bcrypt.hash(
          object.user_password,
          saltRounds
        );

        object.is_active = 1;
        object.user_password = hashedPassword; // Store the hashed password
        object.user_type = 1;

        await model.register(object);
        success(res, { message: "Register success.", object });
      }
    } catch (error) {
      console.log(error);
      failed(res, "Internal Server Error");
    }
  }

  async register_member(req, res) {
    try {
      const fields = [
        "user_username",
        "user_password",
        "member_fname",
        "member_lname",
        "member_email",
        "member_address",
        "member_phone",
      ];
      let { object, missing } = await check_field(req, fields, {});

      if (missing.length > 0) {
        failed(res, `Column "${missing}" is missing!`);
      } else {
        // Encode the user's password using bcrypt
        const hashedPassword = await bcrypt.hash(
          object.user_password,
          saltRounds
        );

        // Create a new user object with 'user_username' instead of 'user_fname'
        const newUser = {
          user_username: object.user_username,
          user_password: hashedPassword, // Store the hashed password
          user_type: 2, // Set the default user_type (you can change this as needed)
        };

        // Add the new user to the "user" table and retrieve the generated user_id
        const userId = await model.register(newUser);

        // Create a new member object with default values
        const newMember = {
          user_id: userId, // Use the generated user_id
          member_fname: object.member_fname,
          member_lname: object.member_lname,
          member_email: object.member_email,
          point: object.point || 0, // Set the default value to 0 if not provided
          is_active: 1, // Set the default value to 1
          member_address: object.member_address || "", // Use a default value if not provided
          member_phone: object.member_phone || "", // Use a default value if not provided
        };

        // Add the new member to the "member" table
        await model.registerMember(newMember);

        success(res, { message: "User and member registered successfully" });
      }
    } catch (error) {
      console.log(error);
      failed(res, "Internal Server Error");
    }
  }

  async getMembers(req, res) {
    try {
      const members = await model.getMembers();
      success(res, { members }, "Members retrieved successfully");
    } catch (error) {
      console.log(error);
      failed(res, "Internal Server Error");
    }
  }

  async updateProfile(req, res) {
    try {
      const fields = [
        "member_id",
        "member_fname",
        "member_lname",
        "member_email",
        "member_address",
        "member_phone",
      ];
      const { object, missing } = await check_field(req, fields, {});

      if (missing.length > 0) {
        failed(res, `Column "${missing}" is missing!`);
      } else {
        const { member_id, user_password, ...memberData } = object;

        // if (user_password) {
        //     // อัปเดต user_password ในตาราง user
        //     const hashedPassword = await bcrypt.hash(user_password, saltRounds);
        //     await model.updateUserPasswordByID(member_id, hashedPassword);
        // }

        // ดึงข้อมูลสมาชิกจากตาราง member
        const memberInfo = await model.getMemberByMemberId(member_id);

        if (memberInfo) {
          const userData = {
            user_fname: memberData.member_fname,
            user_lname: memberData.member_lname,
            user_email: memberData.member_email,
          };

          // อัปเดตข้อมูลในตาราง user โดยอิงจาก id ในตาราง member
          await model.updateUserProfileByID(memberInfo.user_id, userData);
        }

        // อัปเดตข้อมูลสมาชิกในตาราง member
        await model.updateMemberProfileByID(member_id, memberData);

        success(res, { message: "Member profile updated successfully." });
      }
    } catch (error) {
      console.log(error);
      failed(res, "Internal Server Error");
    }
  }
}

module.exports = new authController();
