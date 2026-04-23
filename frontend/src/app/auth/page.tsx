"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { motion } from "framer-motion";

import { GeometricPattern } from "@/components/auth/GeometricPattern";
import {
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	UserIcon,
} from "@/components/auth/Icons";
import { apiPost, type ApiError } from "@/lib/api";

type SignInResponse = {
	accessToken: string;
	refreshToken: string;
	employee: {
		id: number;
		name: string;
		username: string;
		roles: string[];

		role?: string;
	};
	message?: string;
};

export default function LoginPage() {
	return (
		<React.Suspense fallback={null}>
			<LoginPageInner />
		</React.Suspense>
	);
}

function LoginPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [shakeKey, setShakeKey] = React.useState(0);

	const [toast, setToast] = React.useState<string | null>(null);
	const toastTimerRef = React.useRef<number | null>(null);

	function showToast(message: string, durationMs: number) {
		if (toastTimerRef.current) {
			window.clearTimeout(toastTimerRef.current);
			toastTimerRef.current = null;
		}
		setToast(message);
		toastTimerRef.current = window.setTimeout(() => {
			setToast(null);
			toastTimerRef.current = null;
		}, durationMs);
	}

	React.useEffect(() => {
		if (searchParams.get("reset") === "success") {
			showToast("Mot de passe mis à jour avec succès ✓", 3500);
		}
		return;
	}, [searchParams]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const res = await apiPost<SignInResponse>("/api/auth/signin", {
				username,
				password,
			});

			// Minimal storage for later app screens
			localStorage.setItem("naftal.accessToken", res.accessToken);
			localStorage.setItem("naftal.refreshToken", res.refreshToken);
			localStorage.setItem("naftal.employee", JSON.stringify(res.employee));

			const roles = Array.isArray(res.employee.roles)
				? res.employee.roles
				: res.employee.role
					? [res.employee.role]
					: [];

			const normalizedRoles = roles
				.filter((r): r is string => typeof r === "string")
				.map((r) => r.trim().toUpperCase())
				.filter(Boolean);

			const redirectTo = searchParams.get("redirect");

			if (redirectTo) {
				router.push(decodeURIComponent(redirectTo));
			} else if (normalizedRoles.includes("ADMIN")) {
				router.push("/admin");
			} else if (normalizedRoles.includes("MANAGER")) {
				router.push("/manager");
			} else if (normalizedRoles.includes("AGENT")) {
				router.push("/agent");
			} else {
				router.push("/worker");
			}
		} catch (err: unknown) {
			const apiErr = err as ApiError;
			setError(
				apiErr?.status === 401
					? "Identifiants incorrects"
					: apiErr?.message || "Une erreur est survenue"
			);
			setShakeKey((k) => k + 1);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-slate-950 text-slate-100">
			<div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
				{/* Left branding panel */}
				<div className="relative hidden lg:flex bg-linear-to-br from-slate-950 via-slate-950 to-slate-900">
					<GeometricPattern />
					<div className="relative z-10 flex w-full flex-col items-center justify-center px-10">
						<div className="text-center">
							<div className="text-5xl font-extrabold tracking-widest text-amber-400">
								NAFTAL
							</div>
							<div className="mx-auto mt-2 h-1 w-20 bg-amber-400" />
							<div className="mt-6 text-2xl font-semibold tracking-tight">
								Système de Gestion
							</div>
							<div className="mt-1 text-lg text-slate-300">des Sorties</div>
						</div>
					</div>
				</div>

				{/* Right form panel */}
				<div className="relative flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900/70 to-slate-950 px-6 py-14">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_55%)]" />

					<motion.div
						key={shakeKey}
						className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur"
						animate={
							error
								? { x: [0, -10, 10, -8, 8, -6, 6, 0] }
								: { x: 0 }
						}
						transition={{ duration: 0.45 }}
					>
						<div className="text-2xl font-semibold tracking-tight">Connexion</div>

						{toast ? (
							<div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
								{toast}
							</div>
						) : null}

						{error ? (
							<div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{error}
							</div>
						) : null}

						<form className="mt-6 space-y-4" onSubmit={onSubmit}>
							<label className="block">
								<div className="text-sm font-medium text-slate-200">
									Nom d&apos;utilisateur
								</div>
								<div className="relative mt-2">
									<UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
									<input
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400/70"
										placeholder="Entrez votre nom d'utilisateur"
										autoComplete="username"
										required
									/>
								</div>
							</label>

							<label className="block">
								<div className="text-sm font-medium text-slate-200">
									Mot de passe
								</div>
								<div className="relative mt-2">
									<LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
									<input
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-10 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400/70"
										placeholder="Entrez votre mot de passe"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-200"
										aria-label={
											showPassword
												? "Masquer le mot de passe"
												: "Afficher le mot de passe"
										}
									>
										{showPassword ? (
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
								className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-80"
							>
								{isLoading ? (
									<span className="inline-flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-900" />
										Chargement...
									</span>
								) : (
									"Se connecter"
								)}
							</button>

							<div className="text-center">
								<Link
									href="/forgot-password"
									className="text-sm text-slate-300 underline decoration-amber-400/0 underline-offset-4 transition hover:text-slate-100 hover:decoration-amber-400"
								>
									Mot de passe oublié ?
								</Link>
							</div>
						</form>

						<div className="mt-8 text-center text-xs text-slate-500">
							© 2025 Naftal — Tous droits réservés
						</div>
					</motion.div>

					<button
						type="button"
						onClick={() => router.refresh()}
						className="sr-only"
					>
						refresh
					</button>
				</div>
			</div>
		</div>
	);
}
