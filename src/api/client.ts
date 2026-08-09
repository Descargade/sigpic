const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await response.json() as { success: boolean; data?: T; error?: string }

  if (!data.success) {
    throw new Error(data.error ?? 'Error desconocido')
  }

  return data.data as T
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => request<null>(url, { method: 'DELETE' }),
}
