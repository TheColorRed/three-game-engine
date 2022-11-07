import { Rand, Random } from './random';

export interface RandomWeight<T> {
  weight: number;
  value: T;
}

/**
 * Creates a list of weighted items.
 * * Lower weights are selected less often.
 * * Higher weights are selected more often.
 */
export class WeightedRandom<T> implements Rand<T> {
  /** The list of weighted values. */
  private weights: RandomWeight<T>[] = [];
  /**
   * Adds an item to the list of weights.
   * @param weight The weight of the item (must be a positive integer larger than zero). Lower numbers are selected less often than higher numbers.
   * @param value The value for the item.
   */
  add(weight: number, value: T) {
    if (Random.isFloat(weight) || weight < 1) throw new Error(`A weight of "${weight}" must be an integer and be greater than or equal to 1.`);
    this.weights.push({ weight, value });
    return this;
  }

  /**
   * Selects a random item from the weighted list.
   */
  random() {
    const cumulativeWeights: number[] = [];
    for (let i = 0; i < this.weights.length; i++) {
      cumulativeWeights[i] = this.weights[i].weight + (cumulativeWeights[i - 1] || 0);
    }

    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();

    for (let idx = 0; idx < this.weights.length; idx++) {
      if (cumulativeWeights[idx] >= randomNumber) {
        return this.weights[idx].value;
      }
    }

    return this.weights[Random.range(0, this.weights.length)].value;
  }

}