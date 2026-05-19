"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [checkingConfig, setCheckingConfig] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/session");
        const data = (await res.json()) as { configured: boolean };
        setConfigured(data.configured);
      } catch {
        setConfigured(false);
      } finally {
        setCheckingConfig(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (errorParam === "not_configured") {
      setConfigured(false);
    }
  }, [errorParam]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      const destination =
        callbackUrl.startsWith("/admin") && callbackUrl !== "/admin/login"
          ? callbackUrl
          : "/admin";

      router.push(destination);
      router.refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  if (checkingConfig) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }

  if (!configured) {
    return (
      <>
        <h1 className="text-center text-xl font-semibold text-[#2d4084]">
          Admin not configured
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          Set{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">ADMIN_PASSWORD</code>{" "}
          in your environment variables to enable admin access.
        </p>
      </>
    );
  }

  return (
    <>
      
      
      <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#f01923]" />
      <h1 className="text-center text-xl font-semibold text-[#2d4084]">
        Admin sign in
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Sign in to view registered student submissions
      </p>
      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-[#2d4084]/30 focus:border-[#2d4084] focus:ring-2"
            required
          />
        </div>
        {loginError && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {loginError}
          </p>
        )}
        <button
          type="submit"
          disabled={loggingIn}
          className="w-full rounded-lg bg-[#2d4084] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#243366] disabled:opacity-60"
        >
          {loggingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </>
  );
}
