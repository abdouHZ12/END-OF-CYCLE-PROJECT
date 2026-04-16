import * as React from "react";

type Employee = {
  id: string;
  name: string;
  username: string;
  role: string; 
};

export function useCurrentUser(): Employee | null {
  const [user, setUser] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    const raw = localStorage.getItem("naftal.employee");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  return user;
}