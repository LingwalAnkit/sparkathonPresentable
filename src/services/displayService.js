import axios from "axios";

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL; // Update if needed

export async function fetchApples() {
  const res = await axios.get(`${API_BASE_URL}/api/apples`);
  console.log(res.data);
  return res.data;
}
