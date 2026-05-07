"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockIcon } from "@/components/auth/Icons";
import { apiPost, type ApiError } from "@/lib/api";
import { getPasswordStrength } from "@/lib/passwordStrength";

function meetsRules(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordPageInner />
    </React.Suspense>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [inlineError, setInlineError] = React.useState<string | null>(null);
  const [expired, setExpired] = React.useState(false);

  const strength = getPasswordStrength(newPassword);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);

    if (!token) {
      setExpired(true);
      return;
    }

    if (!meetsRules(newPassword)) {
      setInlineError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setInlineError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost<{ message: string }>("/api/auth/reset-password", {
        token,
        newPassword,
      });
		router.push("/auth?reset=success");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 400) {
        const msg = apiErr.message || "";
        if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("token")) {
          setExpired(true);
          return;
        }
      }
      setInlineError(apiErr?.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--naftal-bg)] px-6 py-14 text-[var(--naftal-text-primary)]">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-[var(--naftal-border)] bg-[var(--naftal-surface-1)] p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <Link
			href="/auth"
            className="inline-flex items-center gap-2 text-sm text-[var(--naftal-text-secondary)] hover:text-[var(--naftal-text-primary)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour
          </Link>

          {expired ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="text-lg font-semibold">Ce lien a expiré.</div>
              <div className="mt-1 text-sm text-[var(--naftal-text-secondary)]">
                Veuillez recommencer.
              </div>
              <Link
                href="/forgot-password"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--naftal-brand)] px-4 py-3 font-semibold text-[var(--naftal-on-brand)]"
              >
                Recommencer
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4 text-2xl font-semibold tracking-tight">
                Nouveau mot de passe
              </div>

              {inlineError ? (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {inlineError}
                </div>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <label className="block">
                  <div className="text-sm font-medium text-[var(--naftal-text-secondary)]">
                    Nouveau mot de passe
                  </div>
                  <div className="relative mt-2">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--naftal-text-muted)]" />
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--naftal-border)] bg-[var(--naftal-surface-2)] py-3 pl-10 pr-10 text-[var(--naftal-text-primary)] outline-none placeholder:text-[var(--naftal-text-muted)] focus:border-[var(--naftal-brand)]"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--naftal-text-muted)] hover:text-[var(--naftal-text-primary)]"
                      aria-label={showNew ? "Masquer" : "Afficher"}
                    >
                      {showNew ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>

                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--naftal-text-muted)]">
                    <span>Force</span>
                    <span className="text-[var(--naftal-text-secondary)]">{strength.label}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--naftal-surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--naftal-brand)] transition-[width]"
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[var(--naftal-text-muted)]">
                    min 8 caractères, une majuscule, un chiffre
                  </div>
                </div>

                <label className="block">
                  <div className="text-sm font-medium text-[var(--naftal-text-secondary)]">
                    Confirmer le mot de passe
                  </div>
                  <div className="relative mt-2">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--naftal-text-muted)]" />
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--naftal-border)] bg-[var(--naftal-surface-2)] py-3 pl-10 pr-10 text-[var(--naftal-text-primary)] outline-none placeholder:text-[var(--naftal-text-muted)] focus:border-[var(--naftal-brand)]"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--naftal-text-muted)] hover:text-[var(--naftal-text-primary)]"
                      aria-label={showConfirm ? "Masquer" : "Afficher"}
                    >
                      {showConfirm ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--naftal-brand)] px-4 py-3 font-semibold text-[var(--naftal-on-brand)] transition disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--naftal-on-brand)]/40 border-t-[var(--naftal-on-brand)]" />
                      Mise à jour...
                    </span>
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-xs text-[var(--naftal-text-muted)]">
                © 2025 Naftal — Tous droits réservés
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
