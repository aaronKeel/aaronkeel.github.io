const normalizeWeight = (weight: number): number => Math.max(0, weight);

const buildWeights = <T>(
  items: readonly T[],
  weightOf: (item: T) => number,
): [number[], number] => {
  const weights: number[] = [];
  let totalWeight = 0;

  for (const item of items) {
    const weight = normalizeWeight(weightOf(item));
    weights.push(weight);
    totalWeight += weight;
  }

  return [weights, totalWeight];
};

export const pickWeighted = <T>(
  items: readonly T[],
  weightOf: (item: T) => number,
): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  const [weights, totalWeight] = buildWeights(items, weightOf);

  if (totalWeight <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let threshold = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
};
