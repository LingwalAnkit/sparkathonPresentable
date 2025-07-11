// utils/warehouseDataGenerator.js

let warehouseInstance = null;

class WarehouseStorage {
  constructor() {
    this.storageTime = 0;
    this.initialEthylene = 2.0; // Ethylene level when fruit arrives from transport
    this.baseTemperature = 4; // Optimal cold storage temperature
  }

  updateStorageTime() {
    this.storageTime++;
  }
}

export function generateWarehouseTemperature() {
  if (!warehouseInstance) warehouseInstance = new WarehouseStorage();

  // Simulate warehouse/cold chamber temperature (2-8°C) with slight variations
  const baseTemp = warehouseInstance.baseTemperature;
  const variation = (Math.random() - 0.5) * 2; // ±1°C variation
  const temp = baseTemp + variation;

  // Ensure temperature stays within cold storage range
  return Math.max(2, Math.min(8, temp)).toFixed(1);
}

export function generateWarehouseEthylene() {
  if (!warehouseInstance) warehouseInstance = new WarehouseStorage();

  warehouseInstance.updateStorageTime();

  // Ethylene continues to increase in storage but at slower rate
  const storageIncrease = warehouseInstance.storageTime * 0.1;
  const currentEthylene = warehouseInstance.initialEthylene + storageIncrease;

  // Warehouse ethylene typically ranges 2-15 ppm for stored apples
  const ethylene = Math.max(2, Math.min(15, currentEthylene));

  return ethylene.toFixed(3);
}

export function resetWarehouseStorage() {
  warehouseInstance = null;
}

export function getWarehouseStorageInfo() {
  if (!warehouseInstance) {
    return {
      storageTime: 0,
      storageCondition: "Optimal",
      ethyleneLevel: "Low",
    };
  }

  const ethylene = parseFloat(generateWarehouseEthylene());
  let condition = "Optimal";
  let ethyleneLevel = "Low";

  if (ethylene > 10) {
    condition = "Deteriorating";
    ethyleneLevel = "High";
  } else if (ethylene > 5) {
    condition = "Acceptable";
    ethyleneLevel = "Medium";
  }

  return {
    storageTime: warehouseInstance.storageTime,
    storageCondition: condition,
    ethyleneLevel: ethyleneLevel,
  };
}
