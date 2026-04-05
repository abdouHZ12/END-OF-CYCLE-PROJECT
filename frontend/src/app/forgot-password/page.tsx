"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ArrowLeftIcon, MailIcon } from "@/components/auth/Icons";
import { apiPost, type ApiError } from "@/lib/api";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Veuillez entrer une adresse e-mail valide");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost<{ message: string }>("/api/auth/forgot-password", { email });
      setSentTo(email);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.status === 404
          ? "Aucun compte associé à cette adresse e-mail"
          : apiErr?.message || "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-950 px-6 py-14 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-md items-center">
        <AnimatePresence mode="wait">
          {sentTo ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur"
            >
              <EnvelopeAnimation />
              <div className="mt-4 text-2xl font-semibold tracking-tight">
                Vérifiez votre boîte mail
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                Un lien de réinitialisation a été envoyé à votre adresse e-mail.
                Le lien expire dans 30 minutes.
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-3 font-semibold text-slate-950"
              >
                Retour à la connexion
              </button>
              <div className="mt-8 text-center text-xs text-slate-500">
                © 2025 Naftal — Tous droits réservés
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour
              </Link>

              <div className="mt-4 text-2xl font-semibold tracking-tight">
                Réinitialiser le mot de passe
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                Entrez l&apos;adresse e-mail associée à votre compte. Un lien de
                réinitialisation vous sera envoyé.
              </div>

              {error ? (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <label className="block">
                  <div className="text-sm font-medium text-slate-200">
                    Adresse e-mail
                  </div>
                  <div className="relative mt-2">
                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400/70"
                      placeholder="exemple@naftal.dz"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-900" />
                      Envoi...
                    </span>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-xs text-slate-500">
                © 2025 Naftal — Tous droits réservés
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EnvelopeAnimation() {
  return (
    <div className="mx-auto flex w-full justify-center">
      <div className="relative h-20 w-24">
        <motion.div
          className="absolute inset-0 rounded-lg border border-slate-700 bg-slate-950/40"
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className="absolute left-0 top-0 h-0 w-0 border-b-slate-800/70 border-l-transparent border-r-transparent"
          initial={{ rotateX: 0, transformOrigin: "top" }}
          animate={{ rotateX: [0, 70, 0] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
          style={{
            borderBottomWidth: 40,
            borderLeftWidth: 48,
            borderRightWidth: 48,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.35))",
          }}
        />
        <motion.div
          className="absolute bottom-2 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-amber-400/70"
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
