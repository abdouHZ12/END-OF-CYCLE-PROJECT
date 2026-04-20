import * as React from "react";

type Employee = {
  id: number;
  name: string;
  username: string;
  roles: string[];
};

function normalizeStoredEmployee(raw: unknown): Employee | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  const id =
    typeof obj.id === "number"
      ? obj.id
      : Number.parseInt(String(obj.id), 10);
  if (!Number.isFinite(id)) return null;

  const roles = Array.isArray(obj.roles)
    ? (obj.roles as string[])
    : typeof obj.role === "string" && obj.role.length
    ? [obj.role]
    : [];

  return {
    id,
    name: String(obj.name ?? ""),
    username: String(obj.username ?? ""),
    roles,
  };
}

export function useCurrentUser(): Employee | null {
  const [user, setUser] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    const raw = localStorage.getItem("naftal.employee");
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      setUser(normalizeStoredEmployee(parsed));
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}