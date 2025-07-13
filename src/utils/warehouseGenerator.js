// Generate random temperature between 18 and 24 (inclusive), rounded to 2 decimal places
export function generateWarehouseTemperature() {
  const temperature = Math.random() * (24 - 18) + 18;
  return parseFloat(temperature.toFixed(2));
}

export function generateWarehouseEthylene(prevEthylene = 3) {
  if (prevEthylene >= 10) {
    return 10;
  }
  return prevEthylene + 1;
}
