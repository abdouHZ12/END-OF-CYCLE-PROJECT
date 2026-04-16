export type ApiError = {
  status: number;
  message: string;
};

function getApiBaseUrl() {
  // Default matches backend/.env PORT=5000 for local dev.
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/$/,
    ""
  );
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
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as Record<string, unknown>).message === "string"
        ? ((data as Record<string, unknown>).message as string)
        : `Request failed with status ${res.status}`;
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return (data ?? ({} as unknown)) as TResponse;
}


export async function apiGet<TResponse>(
  path: string,
  body?: unknown
): Promise<TResponse> {
  let res: Response;
  try {
      res = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "GET",
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
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as Record<string, unknown>).message === "string"
        ? ((data as Record<string, unknown>).message as string)
        : `Request failed with status ${res.status}`;
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return (data ?? ({} as unknown)) as TResponse;
}