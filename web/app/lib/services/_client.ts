import { showToast } from "@/app/ui/layout/toast-store";

class ClientApi {
  private async request(endpoint: string, config: RequestInit = {}) {
    try {
      const resp = await fetch(`/api${endpoint}`, config);
      const data = await resp.json().catch(() => ({}));

      switch (resp.status) {
        case 200:
        case 201:
          return data || true;
        case 204:
          return true;
        case 400:
        case 422:
          if (data.fields) return data;
          showToast(data.error ?? "Bad request");
          return null;
        case 401:
          showToast(data.error ?? "Unauthorized");
          window.location.href = "/login";
          return null;
        case 403:
          showToast(data.error ?? "Forbidden");
          return null;
        case 404:
          showToast(data.error ?? "Not found");
          return null;
        case 429:
          showToast(data.error ?? "Too many requests");
          return null;
        case 500:
        case 502:
        case 503:
        case 504:
          showToast("Server error");
          return null;
        default:
          showToast("Unexpected error");
          return null;
        }
      } catch (err) {
      throw new Error("Network Error");
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