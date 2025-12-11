'use strict';

class PriceStrategy {
  calculate(gym) {
    throw new Error('Method calculate() must be implemented');
  }
}

class StandardStrategy extends PriceStrategy {
  calculate(gym) {
    return gym.oneTimePrice;
  }
}

class SubscriptionStrategy extends PriceStrategy {
  calculate(gym) {
    return 0;
  }
}

class BonusStrategy extends PriceStrategy {
  calculate(gym) {
    return 0;
  }
}

class PriceContext {
  constructor() {
    this.strategy = null;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  executeStrategy(gym) {
    if (!this.strategy) {
      throw new Error('Price strategy is not set!');
    }
    return this.strategy.calculate(gym);
  }
}

module.exports = {
  StandardStrategy,
  SubscriptionStrategy,
  BonusStrategy,
  PriceContext,
};
