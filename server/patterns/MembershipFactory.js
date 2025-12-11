'use strict';

class Membership {
  constructor(name, price, benefits) {
    this.name = name;
    this.price = price;
    this.benefits = benefits;
  }
}

class StandardMembership extends Membership {
  constructor(basePrice) {
    super('Standard', basePrice, ['Gym Access', 'Locker Room']);
  }
}

class PremiumMembership extends Membership {
  constructor(basePrice) {
    super('Premium', basePrice * 1.5, [
      'Gym Access',
      'Personal Trainer',
      'Swimming Pool',
    ]);
  }
}

class MembershipFactory {
  create(type, basePrice) {
    if (type === 'premium') {
      return new PremiumMembership(basePrice);
    }
    return new StandardMembership(basePrice);
  }
}

module.exports = new MembershipFactory();
