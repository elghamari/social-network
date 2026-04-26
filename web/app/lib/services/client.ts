const API_BASE = "http://localhost:8080/api";

class ClientApi {
  async request(endPoint: string, options: RequestInit = {}) {

    const isFormData = options.body instanceof FormData;

    const headers: any = {
      ...options.headers,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };

    try {
      const resp = await fetch(`${API_BASE}${endPoint}`, config);

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw {
          status: resp.status,
          message: errorData.error || "Request Failed",
        };
      }

      return resp.json();

    } catch (err: any) {
      console.log("ClientApi Error:", err);
      
      if (err.status) throw err;
      throw {
        status: 0,
        message: "Network Error or Server Down",
        error: err,
      };
    }
  }

  get(endPoint: string) {
    return this.request(endPoint);
  }

  post(endPoint: string, data: any) {
    return this.request(endPoint, {
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

  put(endPoint: string, data: any) {
    return this.request(endPoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endPoint: string) {
    return this.request(endPoint, {
      method: "DELETE",
    });
  }
}

export default new ClientApi();