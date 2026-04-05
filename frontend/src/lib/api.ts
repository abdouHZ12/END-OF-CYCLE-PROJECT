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
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const message =
      (data && (data.message as string)) ||
      `Request failed with status ${res.status}`;
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return (data ?? ({} as any)) as TResponse;
}
