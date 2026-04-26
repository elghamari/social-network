// client.ts
const API_BASE = "http://localhost:8080/api";

class ClientApi {
  async request(endPoint: string, options: RequestInit = {}, extraHeaders: Record<string, string> = {}) {
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-type": "application/json",
        ...extraHeaders,
        ...options.headers,
      },
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
        message: "Search error",
        error: err,
      };
    }
  }

  get(endPoint: string, extraHeaders?: Record<string, string>) {
    return this.request(endPoint, {}, extraHeaders);
  }

  post(endPoint: string, data: any, extraHeaders?: Record<string, string>) {
    return this.request(endPoint, {
      method: "POST",
      body: JSON.stringify(data),
    }, extraHeaders);
  }

  put(endPoint: string, data: any, extraHeaders?: Record<string, string>) {
    return this.request(endPoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }, extraHeaders);
  }

  delete(endPoint: string, extraHeaders?: Record<string, string>) {
    return this.request(endPoint, {
      method: "DELETE",
    }, extraHeaders);
  }
}

export default new ClientApi();