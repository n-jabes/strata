"use client";

import { useState } from "react";
import Link from "next/link";
import { FiLoader, FiMail } from "react-icons/fi";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setDevResetUrl(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        resetUrl?: string;
        error?: string;
      };

      if (!res.ok) {
        toast(json.error ?? "Unable to process request.", "error");
        return;
      }

      toast(
        json.message ??
          "If an account exists, a reset link has been generated.",
        "success"
      );
      if (json.resetUrl) setDevResetUrl(json.resetUrl);
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-sand/50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your account email to reset your password.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <FiMail size={16} />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-forest text-white text-sm font-semibold rounded-lg hover:bg-forest/90 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <FiLoader size={15} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        {devResetUrl ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 break-all">
            Development reset link:{" "}
            <Link className="underline" href={devResetUrl}>
              {devResetUrl}
            </Link>
          </p>
        ) : null}

        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-medium text-forest hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
