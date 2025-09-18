type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

interface RequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: any;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}


// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = " https://abi-backend-zgtw.onrender.com/api"
class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getToken(): string | null {
  const saved = localStorage.getItem("auth");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    return parsed.token || null;
  } catch {
    return null;
  }
}

  private getHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    const token = this.getToken();

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...additionalHeaders,
    };
  }

  private async request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', headers, body, signal } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: this.getHeaders(headers),
    signal,
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    if (body instanceof FormData) {
      // ✅ Let fetch set Content-Type + boundary automatically
      fetchOptions.body = body;
      delete (fetchOptions.headers as any)["Content-Type"];
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  const contentType = response.headers.get('Content-Type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data as any)?.message || response.statusText || 'API request failed';
    throw new Error(errorMessage);
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

  public get<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public post<T>(url: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  public put<T>(url: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  public delete<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  public patch<T>(url: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

   
}



export default ApiClient.getInstance();