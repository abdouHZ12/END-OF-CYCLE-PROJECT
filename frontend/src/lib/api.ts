export type ApiError = {
  status: number;
  message: string;
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function getApiBaseUrl() {
  // Backend defaults to PORT=3001 (see backend/src/config/config.ts).
  // Keep env override, but make the default work out-of-the-box.
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
  
  if (typeof window !== "undefined") {
    return base.replace("localhost", window.location.hostname);
  }

  return base;
}

function toApiError(status: number, data: unknown): ApiError {
  const message =
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
      ? ((data as Record<string, unknown>).message as string)
      : status === 0
        ? "Network error: cannot reach the API (check backend is running, URL/port, and CORS)."
        : `Request failed with status ${status}`;

  return { status, message };
}

async function requestJson<TResponse>(input: {
  method: HttpMethod;
  path: string;
  body?: unknown;
  jwt?: string;
}): Promise<TResponse> {
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    const hasBody = input.body !== undefined;

    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }
    if (input.jwt) {
      headers["Authorization"] = `Bearer ${input.jwt}`;
    }

    res = await fetch(`${getApiBaseUrl()}${input.path}`, {
      method: input.method,
      headers,
      body: hasBody ? JSON.stringify(input.body) : undefined,
    });
  } catch {
    throw toApiError(0, undefined);
  }

  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    throw toApiError(res.status, data);
  }

  return (data ?? ({} as unknown)) as TResponse;
}

async function requestBinary(input: { path: string }): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${input.path}`, {
      method: "GET",
    });
  } catch {
    throw toApiError(0, undefined);
  }

  if (!res.ok) {
    throw toApiError(res.status, undefined);
  }

  return await res.blob();
}


export async function apiPost<TResponse>(
  path: string,
  body: unknown
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "POST", path, body });
}

export async function apiPut<TResponse>(
  path: string,
  body: unknown
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "PUT", path, body });
}


export async function apiGet<TResponse>(
  path: string,
  body?: unknown
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "GET", path, body });
}

export async function apiDelete<TResponse>(
  path: string,
  body?: unknown
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "DELETE", path, body });
}


export async function apiGetBinary(path: string): Promise<Blob> {
  return await requestBinary({ path });
}

export async function apiPatch<TResponse>(
  path: string,
  body?: unknown
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "PATCH", path, body });
}

export async function scanPost<TResponse>(
  path: string,
  body?: unknown,
  jwt?: string
): Promise<TResponse> {
  return await requestJson<TResponse>({ method: "POST", path, body, jwt });
}