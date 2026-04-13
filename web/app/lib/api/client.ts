class ClientAPI {
  async request(endPoint: string, options = {}) {
    const config = {
      ...options,
      headers: { "Content-type": "application/json" },
    };

    try {
      //
      const resp = await fetch(`/api${endPoint}`, config);
      return await resp.json();
      //
    } catch (err) {
      throw {
        message: "Request Failed",
        error: err,
      };
    }
  }

  get(endPoint: string) {
    return this.request(endPoint);
  }

  post(endPoint: string, data: object) {
    return this.request(endPoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endPoint: string, data: object) {
    return this.request(endPoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export default new ClientAPI();
