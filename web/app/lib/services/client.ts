const API_BASE = "http://localhost:8080/api";

class ClientApi {
  async request(endPoint: string, options = {}) {
    const config = {
      ...options,
      headers: { "Content-type": "application/json" },
    };

    try {
      //
      const resp = await fetch(`${API_BASE}${endPoint}`, config);
      return resp.json();

      //
    } catch (err) {
      throw {
        status: 0,
        message: "Request Failed",
        error: err,
      };
    }
  }

  get(endPoint: string) {
    return this.request(endPoint);
  }

  post(endPoint: string, data: {}) {
    return this.request(endPoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endPoint: string, data: {}) {
    return this.request(endPoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export default new ClientApi();
