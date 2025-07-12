// Generate random temperature between 18 and 24 (inclusive), rounded to 2 decimal places
export function generateWarehouseTemperature() {
  const temperature = Math.random() * (24 - 18) + 18;
  return parseFloat(temperature.toFixed(2));
}

export function generateWarehouseEthylene(prevEthylene = 3) {
  // Cap at 10 ppm (spoiled)
  if (prevEthylene >= 10) return 10.0;

  // Increase by at least 0.8 up to 1.2 (optional variation)
  const increase = Math.random() * (1.2 - 0.8) + 0.8;
  const nextEthylene = prevEthylene + increase;

  // Clamp to max 10 and round
  return parseFloat(Math.min(nextEthylene, 10).toFixed(2));
}
