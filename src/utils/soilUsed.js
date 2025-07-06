export function SoilUsed() {
  const soilType = [
    "Loamy Soil",
    "Sandy Soil",
    "Clay Soil",
    "Silty Soil",
    "Peaty Soil",
  ];
  const index = Math.floor(Math.random() * soilType * length);
  return soilType[index];
}
