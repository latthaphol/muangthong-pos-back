const knex = require('../../config/database');

class AprioriModel {
  constructor() {
    this.supportedProducts = null; // Placeholder for products with support > 25%
  }
  async getSoldProducts() {
    try {
      // Fetch sold products data grouped by order where status in order_products is 'success'
      const soldProductsByOrder = await knex('order_products')
        .select(
          'order.order_id as order_id',
          knex.raw('GROUP_CONCAT(order_products.product_id ORDER BY order_products.product_id ASC) as products_in_order')
        )
        .join('order', 'order.order_id', '=', 'order_products.order_id')
        .where('order_products.order_id', 'is not', null)
        // .andWhere('order_products.status', '=', 'success') // Filter only order_products with status 'success'
        .groupBy('order.order_id');

      // Convert the GROUP_CONCAT result into a more detailed structure
      const detailedSoldProducts = soldProductsByOrder.map(order => ({
        order: order.order_id,
        products: order.products_in_order.split(',').map(productId => ({
          'product id': parseInt(productId)
        }))
      }));

      // Count the number of orders
      const numberOfOrders = detailedSoldProducts.length;
      console.log("จำนวน order_id ที่ได้รับ:", numberOfOrders);

      return detailedSoldProducts;
    } catch (error) {
      console.error('Error fetching sold products:', error);
      throw error;
    }
  }


  //หาค่าsupportแต่ละชิ้น
  async calculateSupportForProducts() {
    try {
      const aprioriModel = new AprioriModel();
      const soldProducts = await aprioriModel.getSoldProducts();
      const productCounts = {};
      let totalOrders = 0;

      // Count the occurrence of each product across all orders
      soldProducts.forEach(order => {
        totalOrders += 1; // Count each order
        order.products.forEach(product => {
          if (!productCounts[product['product id']]) {
            productCounts[product['product id']] = 1;
          } else {
            productCounts[product['product id']] += 1;
          }
        });
      });

      // Calculate support for each product in both percentage and fraction format
      const productSupports = Object.keys(productCounts).map(productId => {
        const supportFraction = `${productCounts[productId]}/${totalOrders}`;
        const supportPercentage = (productCounts[productId] / totalOrders * 100).toFixed(2);
        return {
          'product id': parseInt(productId),
          'support fraction': supportFraction,
          'support percentage': supportPercentage,
          'totalOrders': totalOrders
        };
      });

      // Filter out products with support percentage greater than 25%
      const productsWithSupportGreaterThan25Percent = productSupports.filter(product => {
        return parseFloat(product['support percentage']) > 25;
      });
      this.supportedProducts = productsWithSupportGreaterThan25Percent;
      return productsWithSupportGreaterThan25Percent;
    } catch (error) {
      console.error('Error calculating support for products:', error);
      throw error;
    }
  }

  //หาชุด



  async calculateSupportForItemset() {
    try {
      const soldProducts = await this.getSoldProducts(); // Retrieve sold products data
      const productCounts = {};
      let totalOrders = 0;

      // Count the occurrence of each product across all orders and generate pairs
      soldProducts.forEach(order => {
        totalOrders += 1; // Count each order
        const productsInOrder = order.products.map(product => product['product id']);
        // Increment count for each individual product
        order.products.forEach(product => {
          const productId = product['product id'];
          if (!productCounts[productId]) {
            productCounts[productId] = 1;
          } else {
            productCounts[productId] += 1;
          }
          // Generate pairs with other products in the same order
          productsInOrder.forEach(otherProductId => {
            if (productId !== otherProductId) {
              const pairKey = `${productId}-${otherProductId}`;
              if (!productCounts[pairKey]) {
                productCounts[pairKey] = 1;
              } else {
                productCounts[pairKey] += 1;
              }
            }
          });
        });
      });

      // Calculate support for each product and pairs
      const productSupports = Object.keys(productCounts).map(key => {
        const count = productCounts[key];
        const [productId1, productId2] = key.split('-').map(Number);
        const supportFraction = `${count}/${totalOrders}`;
        const supportPercentage = ((count / totalOrders) * 100).toFixed(2);
        return {
          'item': productId2 ? [productId1, productId2] : productId1,
          'support fraction': supportFraction,
          'support percentage': supportPercentage,
          'totalOrders': totalOrders
        };
      });

      // Filter out items and pairs with support percentage greater than 25%
      const itemsWithSupportGreaterThan25Percent = productSupports.filter(item => {
        if (Array.isArray(item.item)) {
          // Calculate support percentage for pairs
          return parseFloat(item['support percentage']) > 25;
        } else {
          // Check individual items
          return parseFloat(item['support percentage']) > 25;
        }
      });

      // Generate combinations of supported items
      const itemsets = [];
      itemsWithSupportGreaterThan25Percent.forEach(item => {
        if (Array.isArray(item.item)) {
          itemsets.push(item.item);
        } else {
          itemsets.push([item.item]);
        }
      });

      // Combine supported items into pairs
      const combinedPairs = [];
      for (let i = 0; i < itemsets.length; i++) {
        for (let j = i + 1; j < itemsets.length; j++) {
          combinedPairs.push(itemsets[i].concat(itemsets[j]));
        }
      }

      return combinedPairs;
    } catch (error) {
      console.error('Error calculating support for products:', error);
      throw error;
    }
  }

  async calculateSupportForItemsetPairs(combinedPairs) {
    try {
      // Retrieve sold products data
      console.log('Value of combinedPairs:', combinedPairs);
      const soldProducts = await this.getSoldProducts();

      // Initialize pairCounts object to store counts of itemset pairs
      const pairCounts = {};

      // Count the occurrence of each itemset pair in sold products
      soldProducts.forEach(order => {
        combinedPairs.forEach(pair => {
          // Check if the itemset pair appears together in each order
          if (pair.every(productId => order.products.some(product => product['product id'] === productId))) {
            // Create a key for the itemset pair
            const pairKey = pair.join('-');
            // Increment count for this itemset pair
            if (!pairCounts[pairKey]) {
              pairCounts[pairKey] = 1;
            } else {
              pairCounts[pairKey] += 1;
            }
          } else {
            console.log(`Pair ${pair} not found in order ${order.order}`);
          }
        });
      });


      // Calculate support for each itemset pair and format it as a fraction
      const totalOrders = soldProducts.length;
      const pairSupports = Object.keys(pairCounts).map(pairKey => {
        const count = pairCounts[pairKey];
        const [productId1, productId2] = pairKey.split('-').map(Number);
        // Calculate support percentage
        const supportFraction = `${count}/${totalOrders}`;
        const supportPercentage = ((count / totalOrders) * 100).toFixed(2);
        return {
          'item': [productId1, productId2],
          'support fraction': supportFraction,
          'support percentage': `${supportPercentage} %`,
          'totalOrders': totalOrders
        };
      });

      return pairSupports;
    } catch (error) {
      console.error('Error calculating support for itemset pairs:', error);
      throw error;
    }
  }





}

module.exports = AprioriModel;
