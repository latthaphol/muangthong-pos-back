const knex = require('../../config/database');

class PromotionModel {
  async addPromotion(promotionData) {
    try {
      const [promotionId] = await knex('promotion').insert(promotionData);
      return promotionId;
    } catch (error) {
      throw error;
    }
  }

  get_promotion() {
    try {
      return knex('promotion');
    } catch (error) {
      throw error;
    }
  }
  
  async softDeletePromotion(promotionId) {
    try {
      await knex('promotion')
        .where('promotion_id', promotionId)
        .update({ is_active: 0 });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PromotionModel();
