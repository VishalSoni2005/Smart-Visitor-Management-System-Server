import { ApiResponse } from "../shared/types";
import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

async function request<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  body?: any,
  customHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...customHeaders,
  };

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = body instanceof FormData ? body : (typeof body === "string" ? body : JSON.stringify(body));
  }

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: json.error || `HTTP error! status: ${response.status}`,
      };
    }

    return json as ApiResponse<T>;
  } catch (error: any) {
    console.error(`API Call failed on ${url}:`, error);
    return {
      success: false,
      error: error.message || "Network request failed. Please check your connection.",
    };
  }
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, "GET", undefined, headers),
  post: <T>(endpoint: string, body: any, headers?: Record<string, string>) =>
    request<T>(endpoint, "POST", body, headers),
  patch: <T>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, "PATCH", body, headers),
  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, "DELETE", undefined, headers),
};
