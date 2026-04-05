export type ApiError = {
  status: number;
  message: string;
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    const err: ApiError = {
      status: 0,
      message:
        "Network error: cannot reach the API (check backend is running, URL/port, and CORS).",
    };
    throw err;
  }

  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
// ✅ After
   const message =
     (data && typeof data === 'object' && 'message' in data && typeof (data as Record<string, unknown>).message === 'string'
      ? (data as Record<string, unknown>).message as string
      : `Request failed with status ${res.status}`);
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return (data ?? ({} as unknown)) as TResponse;
}
