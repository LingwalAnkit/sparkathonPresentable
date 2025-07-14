const PYTHON_API_BASE_URL = "http://127.0.0.1:8000/api/v1";

class PythonApiService {
  async predictPriceAndFreshness(
    productName,
    temperature,
    ethylene,
    basePrice
  ) {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: productName,
          temp: parseInt(temperature),
          ethylene: parseInt(ethylene),
          base_price: parseInt(basePrice),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        predicted_price: data.predicted_price,
        freshness_score: data.freshness_score,
      };
    } catch (error) {
      console.error("Python API error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new PythonApiService();
