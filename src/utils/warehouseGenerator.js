// Generate random temperature between 18 and 24 (inclusive), rounded to 2 decimal places
export function generateWarehouseTemperature() {
  const temperature = Math.random() * (24 - 18) + 18;
  return parseFloat(temperature.toFixed(2));
}

export function generateIncreasingEthylene(
  readingNumber,
  startValue = 3,
  maxValue = 10
) {
  // Simple approach: start + reading number, capped at max
  const ethylene = Math.min(startValue + readingNumber, maxValue);
  return ethylene;
}
