/**
 * HTTP client for making API requests
 */

import type { RequestOptions, ApiResponse, ApiError } from './types';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;

  constructor(
    baseUrl: string,
    apiPrefix: string,
    defaultHeaders: Record<string, string> = {},
    defaultTimeout = 30000,
    maxRetries = 3
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiPrefix = apiPrefix.replace(/\/$/, '');
    this.defaultHeaders = defaultHeaders;
    this.defaultTimeout = defaultTimeout;
    this.maxRetries = maxRetries;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit & { timeout?: number },
    retryCount = 0
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeout || this.defaultTimeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Retry on 5xx errors or network failures
      if (
        (response.status >= 500 || response.status === 0) &&
        retryCount < this.maxRetries
      ) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Request timeout after ${options.timeout || this.defaultTimeout}ms`
        );
      }

      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions & {
      method?: string;
      body?: BodyInit | null | undefined;
      query?: Record<string, string | number | boolean>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(this.apiPrefix + endpoint, this.baseUrl);

    // Add query parameters
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const response = await this.fetchWithRetry(url.toString(), {
      method: options.method || 'GET',
      headers,
      body: options.body || null,
      timeout: options.timeout || this.defaultTimeout,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData: unknown;

      try {
        const errorResponse = (await response.json()) as ApiError;
        errorMessage = String(errorResponse?.message || errorMessage);
        errorData = errorResponse as unknown;
      } catch {
        // If we can't parse the error response, use the default message
      }

      const error: ApiError = {
        name: 'ApiError',
        message: errorMessage,
        status: response.status,
        response: errorData,
      };

      throw error;
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: T;
    // if content-type is application/json, parse as json
    if (response.headers.get('content-type')?.includes('application/json')) {
      data = (await response.json()) as T;
    } else {
      const arrayBuffer = await response.arrayBuffer();
      data = arrayBuffer as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };
  }

  async get<T>(
    endpoint: string,
    options?: RequestOptions & {
      query?: Record<string, string | number | boolean>;
    }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: BodyInit,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body || null,
    });
  }

  async put<T>(
    endpoint: string,
    body?: BodyInit,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body || null,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
