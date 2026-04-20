export const BASE_URL = "http://localhost:8080/";
const API_URL = "http://localhost:8080/api";

class ClientApi {
  async request(endPoint: string, config: RequestInit = {}) {
    try {
      //
      const resp = await fetch(`${API_URL}${endPoint}`, config);
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
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  postForm(endPoint: string, formData: FormData) {
    return this.request(endPoint, {
      method: "POST",
      body: formData,
    });
  }

  put(endPoint: string, data: {}) {
    return this.request(endPoint, {
      headers: { "Content-type": "application/json" },
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endPoint: string) {
    return this.request(endPoint, {
      headers: { "Content-type": "application/json" },
      method: "DELETE",
    });
  }
}

export default new ClientApi();
