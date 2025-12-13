// Shared API utility functions for CRUD operations (2025 TypeScript standards)

import type { ApiError } from '../types/models';

export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
      throw new ApiException(errorMessage, response.status, errorData.details);
    } catch (err) {
      if (err instanceof ApiException) throw err;
      throw new ApiException(errorMessage, response.status);
    }
  }
  return response.json();
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(res);
}

export async function apiPost<T, B = unknown>(url: string, body: B): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T, B = unknown>(url: string, body: B): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(res);
}

// Reusable fetch with abort signal for cancellation
export async function apiFetch<T>(
  url: string,
  options?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return handleResponse<T>(res);
}
