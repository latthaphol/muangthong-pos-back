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
        .where('order_products.status', '=', 'success') // Ensure only successful order_products are selected
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

  async getProductNames() {
    try {
      const products = await knex('product').select('product_id', 'product_name');
      const productNames = {};
      products.forEach(product => {
        productNames[product.product_id] = product.product_name;
      });
      return productNames;
    } catch (error) {
      console.error('Error fetching product names:', error);
      throw error;
    }
  }


  async calculateSupportForItemset() {
    try {
        const soldProducts = await this.getSoldProducts(); // ดึงข้อมูลสินค้าที่ขายได้
        let uniqueProducts = new Set();

        // นับจำนวนสินค้าในแต่ละออร์เดอร์
        soldProducts.forEach(order => {
            const productsInOrder = new Set(order.products.map(product => product['product id']));
            productsInOrder.forEach(productId => {
                uniqueProducts.add(productId);
            });
        });

        // แปลง Set เป็น Array เพื่อให้สามารถจัดการได้ง่ายขึ้น
        uniqueProducts = [...uniqueProducts];

        // สร้างคู่ที่เป็นไปได้ทั้งหมดจากสินค้าที่ไม่ซ้ำกัน
        const allPossiblePairs = [];
        for (let i = 0; i < uniqueProducts.length; i++) {
            for (let j = i + 1; j < uniqueProducts.length; j++) {
                allPossiblePairs.push([uniqueProducts[i], uniqueProducts[j]]);
                allPossiblePairs.push([uniqueProducts[j], uniqueProducts[i]]); // เพิ่มคู่ [7, 6] ด้วย
            }
        }

        // คืนค่าคู่ที่เป็นไปได้ทั้งหมด
        return allPossiblePairs;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่ขายได้:', error);
        throw error;
    }
}






  //หาชุด

   //stepท

  // async calculateSupportForItemset() {
  //   try {
  //     const soldProducts = await this.getSoldProducts(); // Retrieve sold products data
  //     const productCounts = {};
  //     let totalOrders = 0;

  //     // Count the occurrence of each product across all orders and generate pairs
  //     soldProducts.forEach(order => {
  //       totalOrders += 1; // Count each order
  //       const productsInOrder = order.products.map(product => product['product id']);
  //       // Increment count for each individual product
  //       order.products.forEach(product => {
  //         const productId = product['product id'];
  //         if (!productCounts[productId]) {
  //           productCounts[productId] = 1;
  //         } else {
  //           productCounts[productId] += 1;
  //         }
  //         // Generate pairs with other products in the same order
  //         productsInOrder.forEach(otherProductId => {
  //           if (productId !== otherProductId) {
  //             const pairKey = `${productId}-${otherProductId}`;
  //             if (!productCounts[pairKey]) {
  //               productCounts[pairKey] = 1;
  //             } else {
  //               productCounts[pairKey] += 1;
  //             }
  //           }
  //         });
  //       });
  //     });

  //     // Calculate support for each product and pairs
  //     const productSupports = Object.keys(productCounts).map(key => {
  //       const count = productCounts[key];
  //       const [productId1, productId2] = key.split('-').map(Number);
  //       const supportFraction = `${count}/${totalOrders}`;
  //       const supportPercentage = ((count / totalOrders) * 100).toFixed(2);
  //       return {
  //         'item': productId2 ? [productId1, productId2] : productId1,
  //         'support fraction': supportFraction,
  //         'support percentage': supportPercentage,
  //         'totalOrders': totalOrders
  //       };
  //     });

  //     // Filter out pairs with support percentage greater than 25%
  //     const pairsWithSupportGreaterThan25Percent = productSupports.filter(item => {
  //       return Array.isArray(item.item) && parseFloat(item['support percentage']) > 25;
  //     });

  //     // Extract supported pairs and return in array format
  //     const supportedPairs = pairsWithSupportGreaterThan25Percent.map(item => item.item);

  //     return supportedPairs;
  //   } catch (error) {
  //     console.error('Error calculating support for products:', error);
  //     throw error;
  //   }
  // }


  //step2
  async calculateSupportForItemsetPairs(combinedPairs) {
    try {
        // ดึงข้อมูลสินค้าที่ขายได้
        console.log('ค่าของ combinedPairs:', combinedPairs);
        const soldProducts = await this.getSoldProducts();

        // สร้างอ็อบเจ็กต์เพื่อเก็บจำนวนของสินค้าแต่ละรายการและคู่รายการสินค้า
        const itemCounts = {};
        const pairCounts = {};

        // นับจำนวนที่รายการสินค้าและคู่รายการสินค้าปรากฏในการขายสินค้าแต่ละรายการ
        soldProducts.forEach(order => {
            const productsInOrder = order.products.map(product => product['product id']);
            productsInOrder.forEach(productId => {
                // เพิ่มจำนวนสำหรับรายการสินค้าแต่ละรายการ
                itemCounts[productId] = (itemCounts[productId] || 0) + 1;
            });
            //ตรวจคู่สินค้าโดยใช้every
            combinedPairs.forEach(pair => {
                // ตรวจสอบว่าคู่รายการสินค้าปรากฏพร้อมกันในแต่ละรายการหรือไม่
                if (pair.every(productId => productsInOrder.includes(productId))) {
                    // สร้างคีย์สำหรับคู่รายการสินค้า
                    const pairKey = pair.join('-');
                    // เพิ่มจำนวนสำหรับคู่รายการสินค้านี้
                    pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
                } else {
                    console.log(`คู่ ${pair} ไม่พบในออร์เดอร์ ${order.order}`);
                }
            });
        });

        const totalOrders = soldProducts.length;
        const supports = [];

        // เพิ่มการสนับสนุนสำหรับรายการสินค้าแต่ละรายการเข้าไปในอาร์เรย์ supports
        Object.entries(itemCounts).forEach(([itemId, count]) => {
            const supportPercentage = ((count / totalOrders) * 100).toFixed(2);
            if (supportPercentage > 50) {
                const supportFraction = `${count}/${totalOrders}`;
                supports.push({
                    'item': [parseInt(itemId)],
                    'support fraction': supportFraction,
                    'support percentage': `${supportPercentage} %`,
                    'totalOrders': totalOrders
                });
            }
        });

        // เพิ่มการสนับสนุนคู่รายการสินค้าเข้าไปในอาร์เรย์ supports
        Object.keys(pairCounts).forEach(pairKey => {
            const count = pairCounts[pairKey]; //ดึงจำนวนคู่จากpairkey
            const items = pairKey.split('-').map(Number);
            const supportPercentage = ((count / totalOrders) * 100).toFixed(2);
            if (supportPercentage >= 50) {
                const supportFraction = `${count}/${totalOrders}`;
                supports.push({
                    'item': items,
                    'support fraction': supportFraction,
                    'support percentage': `${supportPercentage} %`,
                    'totalOrders': totalOrders
                });
            }
        });

        return supports;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการคำนวณการสนับสนุนสำหรับคู่รายการสินค้า:', error);
        throw error;
    }
}



 

  // async calculateConfidenceAndLift(combinedPairs) {
  //   try {
  //     // Retrieve the supports for itemset pairs and product names
  //     const pairSupports = await this.calculateSupportForItemsetPairs(combinedPairs);
  //     const productNames = await this.getProductNames(); // Fetch product names
  //     const itemSupports = {};

  //     // Retrieve sold products and calculate total orders
  //     const soldProducts = await this.getSoldProducts();
  //     const totalOrders = soldProducts.length;

  //     // Count occurrences for each individual product
  //     soldProducts.forEach(order => {
  //       order.products.forEach(product => {
  //         const productId = product['product id'];
  //         if (!itemSupports[productId]) {
  //           itemSupports[productId] = 1;
  //         } else {
  //           itemSupports[productId] += 1;
  //         }
  //       });
  //     });

  //     // Calculate confidence and lift for each combined pair
  //     const results = pairSupports.map(pairSupport => {
  //       const [productId1, productId2] = pairSupport.item;
  //       const supportPair = parseInt(pairSupport['support fraction'].split('/')[0]);
  //       const supportItem1 = itemSupports[productId1];
  //       const supportItem2 = itemSupports[productId2];

  //       const confidence = ((supportPair / supportItem1) * 100).toFixed(2);
  //       const lift = ((supportPair / totalOrders) / ((supportItem1 / totalOrders) * (supportItem2 / totalOrders))).toFixed(2);

  //       return {
  //         'rule': `${productNames[productId1]} => ${productNames[productId2]}`,
  //         'confidence': `${confidence}%`,
  //         'lift': lift,
  //         'support pair': pairSupport['support fraction'],
  //         'support item1': `${supportItem1}/${totalOrders}`,
  //         'support item2': `${supportItem2}/${totalOrders}`,
  //         'product_id_1': productId1,
  //         'product_name1': productNames[productId1],
  //         'product_id_2': productId2,
  //         'product_name2': productNames[productId2]
  //       };
  //     });

  //     return results;
  //   } catch (error) {
  //     console.error('Error calculating confidence and lift for itemset pairs:', error);
  //     throw error;
  //   }
  // }

  async calculateConfidenceAndLiftPairs(combinedPairs) {
    try {
      // ดึงข้อมูลการสนับสนุนสำหรับคู่ชุดรายการและชื่อProductname
      const pairSupports = await this.calculateSupportForItemsetPairs(combinedPairs);
      const productNames = await this.getProductNames(); // Fetch product names
      const itemSupports = {};

      //ดึงสินค้าที่ขายแล้วและคำนวณคำสั่งซื้อทั้งหมด
      const soldProducts = await this.getSoldProducts();
      const totalOrders = soldProducts.length;

      // นับจำนวนครั้งของผลิตภัณฑ์แต่ละรายการ
      soldProducts.forEach(order => {
        order.products.forEach(product => {
          const productId = product['product id'];
          if (!itemSupports[productId]) {
            itemSupports[productId] = 1;
          } else {
            itemSupports[productId] += 1;
          }
        });
      });

      // คำนวณconfidence และlift แต่ละคู่ที่รวมกัน
      let results = pairSupports.map(pairSupport => {
        const [productId1, productId2] = pairSupport.item;
        const supportPair = parseInt(pairSupport['support fraction'].split('/')[0]);
        console.log('Support Pair:', supportPair);

        const supportItem1 = itemSupports[productId1];
        const supportItem2 = itemSupports[productId2];
        const product1Name = productNames[productId1];
        const product2Name = productNames[productId2];
        console.log('Support Pair:', supportItem1);

        // Proceed only if both product names are defined
        if (product1Name && product2Name) {
          const confidence = (((supportPair / totalOrders) / (supportItem1 / totalOrders)) * 100).toFixed(2);
          const lift = (((supportPair / totalOrders) )/ ((supportItem1 / totalOrders) * (supportItem2 / totalOrders))).toFixed(2);

          return {
            'rule': `${product1Name} => ${product2Name}`,
            'confidence': `${confidence}%`,
            'lift': lift,
            'support pair': pairSupport['support fraction'],
            'support item1': `${supportItem1}/${totalOrders}`,
            'support item2': `${supportItem2}/${totalOrders}`,
            'product_id_1': productId1,
            'product_name1': product1Name,
            'product_id_2': productId2,
            'product_name2': product2Name
           
          };
        } else {
          // Return null for entries with undefined product names to filter out later
          return null;
        }
      });

      // Filter out null entries (where product names were undefined)
      results = results.filter(result => result !== null);

      return results;
    } catch (error) {
      console.error('Error calculating confidence and lift for itemset pairs:', error);
      throw error;
    }
  }


}

module.exports = AprioriModel;
