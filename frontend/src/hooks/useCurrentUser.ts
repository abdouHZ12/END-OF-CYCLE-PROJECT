import * as React from "react";
import { getStoredEmployee, type StoredEmployee } from "@/lib/authStorage";

type Employee = {
  id: number;
  name: string;
  username: string;
  roles: string[];
};

function toEmployee(stored: StoredEmployee | null): Employee | null {
  if (!stored) return null;
  return {
    id: stored.id,
    name: stored.name,
    username: stored.username,
    roles: stored.roles,
  };
}

export function useCurrentUser(): Employee | null {
  const [user, setUser] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    setUser(toEmployee(getStoredEmployee()));
  }, []);

  return user;
}