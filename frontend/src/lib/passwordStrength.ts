export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Faible" | "Moyen" | "Bon" | "Fort";
};

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;
  const label: PasswordStrength["label"] =
    clamped <= 1
      ? "Faible"
      : clamped === 2
        ? "Moyen"
        : clamped === 3
          ? "Bon"
          : "Fort";

  return { score: clamped, label };
}
