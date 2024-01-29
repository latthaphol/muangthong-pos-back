const knex = require('../../config/database');

class AprioriModel {
  static async generateAssociationRules(frequentItemsets, minConfidence) {
    // Implement Apriori algorithm logic for generating association rules
    const associationRules = [];

    // Iterate over frequent itemsets
    for (const frequentItemset of frequentItemsets) {
      if (frequentItemset.length > 1) {
        // Generate all possible non-empty subsets of the frequent itemset
        const subsets = this.generateSubsets(frequentItemset);

        // Calculate confidence for each rule
        for (const subset of subsets) {
          const antecedentSupport = await this.getItemsetSupportCount(subset, basket);
          const ruleSupport = await this.getItemsetSupportCount(frequentItemset, basket);
          const confidence = ruleSupport / antecedentSupport;

          // Check if confidence meets the minimum threshold
          if (confidence >= minConfidence) {
            // Create association rule and add to the result
            const rule = {
              antecedent: subset,
              consequent: frequentItemset.filter(item => !subset.includes(item)),
              confidence: confidence * 100, // Convert to percentage
            };
            associationRules.push(rule);
          }
        }
      }
    }

    // Return the generated association rules
    return associationRules;
  }


  static async generateAssociationRules(frequentItemsets, minConfidence) {
    const associationRules = [];

    for (const itemset of frequentItemsets) {
      const subsets = this.getSubsets(itemset);

      for (const subset of subsets) {
        const remaining = itemset.filter(item => !subset.includes(item));

        const confidence = await this.calculateConfidence(subset, remaining, frequentItemsets);

        if (confidence >= minConfidence) {
          associationRules.push({
            antecedent: subset,
            consequent: remaining,
            confidence: confidence,
          });
        }
      }
    }

    return associationRules;
  }

  static async getItemsetSupportCount(itemset, basket) {
    let supportCount = 0;

    for (const transaction of basket) {
      if (this.isSubset(itemset, transaction)) {
        supportCount++;
      }
    }

    return supportCount;
  }

  // Helper function to generate candidate 1-itemsets (C1)
  static async generateC1(transactions) {
    const candidateItemsets = {};

    transactions.forEach(transaction => {
      transaction.forEach(item => {
        const itemset = [item];
        candidateItemsets[itemset.toString()] = (candidateItemsets[itemset.toString()] || 0) + 1;
      });
    });

    return Object.keys(candidateItemsets).map(itemset => itemset.split(',').map(Number));
  }

  // Helper function to generate candidate k-itemsets (Ck) based on frequent (k-1)-itemsets
  static async generateCk(frequentItemsets, k) {
    const candidateItemsets = [];

    for (let i = 0; i < frequentItemsets.length; i++) {
      for (let j = i + 1; j < frequentItemsets.length; j++) {
        const itemset1 = frequentItemsets[i];
        const itemset2 = frequentItemsets[j];

        // Check if the first (k-2) elements are the same
        if (itemset1.slice(0, k - 2).every((value, index) => value === itemset2[index])) {
          // Join the two itemsets to create a candidate k-itemset
          const candidateItemset = itemset1.concat(itemset2[k - 2]);

          // Add to candidateItemsets if it doesn't contain any subsets that are not in frequentItemsets
          if (await this.hasFrequentSubsets(candidateItemset, frequentItemsets, k - 1)) {
            candidateItemsets.push(candidateItemset);
          }
        }
      }
    }

    return candidateItemsets;
  }

  // Helper function to check if all (k-1)-subsets of a candidate itemset are frequent
  static async hasFrequentSubsets(candidateItemset, frequentItemsets, k) {
    const subsets = this.getSubsets(candidateItemset, k);

    for (const subset of subsets) {
      if (!(await this.isSubset(subset, frequentItemsets))) {
        return false;
      }
    }

    return true;
  }

  // Helper function to generate all (k-1)-subsets of an itemset
  static getSubsets(itemset, k) {
    const subsets = [];

    function generateSubsets(start, current) {
      if (current.length === k - 1) {
        subsets.push(current.slice());
        return;
      }

      for (let i = start; i < itemset.length; i++) {
        current.push(itemset[i]);
        generateSubsets(i + 1, current);
        current.pop();
      }
    }

    generateSubsets(0, []);

    return subsets;
  }

  // Helper function to filter candidate itemsets based on min support
  // Helper function to filter candidate itemsets based on min support
  static async filterCandidatesBySupport(candidateItemsets, transactions, minSupport) {
    const supportCounts = {};

    for (const transaction of transactions) {
      for (const candidateItemset of candidateItemsets) {
        if (await this.isSubset(candidateItemset, transaction)) {
          const candidateStr = candidateItemset.toString();
          supportCounts[candidateStr] = (supportCounts[candidateStr] || 0) + 1;
        }
      }
    }

    return candidateItemsets.filter(candidateItemset => {
      const support = supportCounts[candidateItemset.toString()] || 0;
      return support >= minSupport;
    });
  }


  // Helper function to check if an array is a subset of another array
  static async isSubset(subset, array) {
    return subset.every(value => array.includes(value));
  }

  // Helper function to calculate confidence of an association rule
  static async calculateConfidence(antecedent, consequent, frequentItemsets) {
    const combined = antecedent.concat(consequent);

    const antecedentSupport = await this.getItemsetSupportCount(antecedent, frequentItemsets);
    const combinedSupport = await this.getItemsetSupportCount(combined, frequentItemsets);

    return combinedSupport / antecedentSupport;
  }
  static async calculateFrequentItemsets(basket, minSupport) {
    const transactions = Object.values(basket);

    // Generate candidate 1-itemsets (C1)
    let candidateItemsets = await this.generateC1(transactions);

    // Filter candidate 1-itemsets based on min support
    candidateItemsets = await this.filterCandidatesBySupport(candidateItemsets, transactions, minSupport);

    let frequentItemsets = candidateItemsets;
    let k = 2;

    while (candidateItemsets.length !== 0) {
      // Generate candidate k-itemsets (Ck)
      candidateItemsets = await this.generateCk(frequentItemsets, k);

      // Filter candidate k-itemsets based on min support
      candidateItemsets = await this.filterCandidatesBySupport(candidateItemsets, transactions, minSupport);

      // If there are any frequent k-itemsets, add them to the result
      if (candidateItemsets.length !== 0) {
        frequentItemsets = frequentItemsets.concat(candidateItemsets);
      }

      k++;
    }

    return frequentItemsets;
  }
}

module.exports = AprioriModel;
