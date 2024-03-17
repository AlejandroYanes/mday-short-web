export function formatCurrency(number: number, currency: string): string {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  const value = currencyFormatter.format(parseFloat(number as any) || 0);

  if (value.endsWith('.00')) {
    return value.slice(0, -3);
  }
  return value;
}

export function formatCurrencyWithoutSymbol(number: number, hideDecimals = true): string {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const parts = currencyFormatter.formatToParts(number);
  const value = parts.filter(part => part.type !== 'currency').map(part => part.value).join('');
  if (hideDecimals && value.endsWith('.00')) {
    return value.slice(0, -3);
  }
  return value;
}

const numberFormatter = new Intl.NumberFormat('default', {
  notation: 'compact',
  unitDisplay: 'short',
});

export function formatAmount(amount: number | string) {
  const parseAmount = Math.round(parseFloat((amount as any) || 0));
  return numberFormatter.format(parseAmount);
}

export function getCurrencySymbol(currencyCode: string) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });

  const parts = formatter.formatToParts(0);
  return parts.find(part => part.type === 'currency')!.value;
}

export function pickRandomIndexWithDistribution(distributions: number[]) {
  // Calculate total weight
  const totalWeight = distributions.reduce((acc, weight) => acc + weight, 0);

  // Generate a random number between 0 and totalWeight
  const random = Math.random() * totalWeight;

  // Iterate through distributions to find where the random value falls
  let cumulativeWeight = 0;
  for (let i = 0; i < distributions.length; i++) {
    cumulativeWeight += distributions[i]!;

    // If the random value is less than the cumulative weight,
    // return the index
    if (random < cumulativeWeight) {
      return i;
    }
  }

  // In case of unexpected circumstances, return 0
  return 0;
}
