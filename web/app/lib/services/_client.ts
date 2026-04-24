class ClientApi {
  private async request(endpoint: string, config: RequestInit = {}) {
    try {
      const resp = await fetch(`/api${endpoint}`, config);
      return resp.json();
    } catch (err) {
      throw { status: 0, message: "Request Failed", error: err };
    }
  }

  get(endpoint: string) {
    return this.request(endpoint);
  }

  post(endpoint: string, data: {}) {
    return this.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  postForm(endpoint: string, formData: FormData) {
    return this.request(endpoint, { method: "POST", body: formData });
  }

  put(endpoint: string, data: {}) {
    return this.request(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export default new ClientApi();
