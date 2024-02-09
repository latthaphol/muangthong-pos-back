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

    async updateUserProfileByID(userId, userData) {
        // ให้ใช้ตาราง 'member' แทน 'user'
        return await knex('member').where({ user_id: userId }).update({
            member_fname: userData.member_fname,
            member_lname: userData.member_lname,
            member_email: userData.member_email,
        });
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
            const updatedRows = await knex('member')
                .where('member_id', member_id)
                .update(data);
    
            if (updatedRows > 0) {
                console.log('Update Successful! Rows Updated:', updatedRows);
                return updatedRows;
            } else {
                console.error('No rows were updated.');
                throw new Error('No rows were updated.');
            }
        } catch (error) {
            console.error('Update Member Profile Error:', error);
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

    //change password
    async getMemberById(memberId) {
        try {
          const members = await knex('member').where('member_id', memberId);
          return members[0];
        } catch (error) {
          throw error;
        }
      }
    
      async getUserById(userId) {
        try {
          const users = await knex('user').where('user_id', userId);
          return users[0];
        } catch (error) {
          throw error;
        }
      }
      async updateUserPasswordById(user_id, hashedPassword) {
        try {
            await knex('user').where('user_id', user_id).update({ user_password: hashedPassword });
        } catch (error) {
            throw error;
        }
    }
    async getUserByUsername(username) {
        try {
          const user = await db('user').where('user_username', username).first();
          return user;
        } catch (error) {
          throw error;
        }
      }
      
      async getUserByEmail(memberEmail) {
        try {
            const user = await db('member').where('member_email', memberEmail).first();
            return user;
        } catch (error) {
            throw error;
        }
    }
    
    
}


module.exports = new authModel()