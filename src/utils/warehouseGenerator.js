// utils/warehouseDataGenerator.js

export function generateWarehouseTemperature() {
  // Simulate warehouse/cold chamber temperature (2-8°C)
  return Math.round(2 + Math.random() * 6);
}

export function generateWarehouseEthylene() {
  // Simulate ethylene (1-25 ppm)
  return Math.round(10 + Math.random() * 15);
}
