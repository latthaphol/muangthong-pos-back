const knex = require('../../config/database')
const db = require('../../config/database');
class authModel {

    login(user_id) {
        return knex('user as u').where('u.user_id', user_id)
    }

    register(data) {
        return knex('user').insert(data)
    }
    register_member(user_id) {
        return knex('user as u').where('u.user_id', user_id)
    }
    login_member(member_id) {
        return knex('member as u').where('u.member_id', member_id)
    }

    registerMember(data) {
        return knex('member').insert(data);
    }
    loginByEmail(email) {
        return knex('user').where('user_email', email);
    }
    loginByUsername(username) {
        return knex('user').where('user_username', username);
      }
      
    async getMembers() {
        try {
            const members = await knex('member');
            return members;
        } catch (error) {
            throw error;
        }
    }
    // ในโมเดลของคุณ
    async getMemberByUserId(userId) {
        try {
            // ใช้ knex ในการดึงข้อมูลสมาชิกจากฐานข้อมูลด้วย userId
            const members = await knex('member').where('user_id', userId);
            return members[0];
        } catch (error) {
            throw error;
        }
    }

    // async getUserIDByMemberID(member_id) {
    //     try {
    //         const user = await knex('member').select('user_id').where('member_id', member_id).first();
    //         return user ? user.user_id : null;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async updateUserProfileByID(user_id, data) {
        try {
            await knex('user').where('user_id', user_id).update(data);
        } catch (error) {
            throw error;
        }
    }

    async updateUserPasswordByID(user_id, hashedPassword) {
        try {
            await knex('user').where('user_id', user_id).update({ user_password: hashedPassword });
        } catch (error) {
            throw error;
        }
    }

    async updateMemberProfileByID(member_id, data) {
        try {
            await knex('member').where('member_id', member_id).update(data);
        } catch (error) {
            throw error;
        }
    }
    async getMemberByMemberId(member_id) {
        try {
            const members = await knex('member').where('member_id', member_id);
            return members[0];
        } catch (error) {
            throw error;
        }
    }
    
}


module.exports = new authModel()