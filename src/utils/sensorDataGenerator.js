export function generateHumidity(readingsCount = 5) {
  const readings = [];
  for (let i = 0; i < readingsCount; i++) {
    const humidityValue = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
    readings.push(humidityValue);
  }
  return readings.join(",");
}

export function generateChemicals(readingsCount = 3) {
  const readings = [];
  for (let i = 0; i < readingsCount; i++) {
    const chemicalValue = Math.floor(Math.random() * (200 - 10 + 1)) + 10;
    readings.push(chemicalValue);
  }
  return readings.join(",");
}
