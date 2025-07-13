// utils/formatters.js
export const formatTimestamp = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const formatArray = (arr) => {
  if (!arr || arr.length === 0) return "No data";
  return arr.map((item) => Number(item)).join(", ");
};
