import { showToast } from "@/app/ui/layout/toast-store";

class ClientApi {
  private async request(endpoint: string, config: RequestInit = {}) {
    try {
      const resp = await fetch(`/api${endpoint}`, config);
      const data = await resp.json().catch(() => ({}));
console.log(resp);

      switch (resp.status) {
        case 200:
        case 201:
        case 404:
          return data || true;

        case 400:
          if (data.fields) return data;

          showToast(data.error ?? "Bad request");
          return null;

        case 500:
          showToast("Somthing went wrong. try again later");
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