"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";

const input =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-base outline-none focus:border-accent";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signUp = mode === "sign-up";
  const [state, action, pending] = useActionState(
    signUp ? signUpWithEmail : signInWithEmail,
    null,
  );

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">{signUp ? "Create account" : "Sign in"}</h1>
      <form action={action} className="mt-6 space-y-3">
        {signUp && (
          <input name="name" placeholder="Name" aria-label="Name" autoComplete="name" className={input} />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          className={input}
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          aria-label="Password"
          autoComplete={signUp ? "new-password" : "current-password"}
          className={input}
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Please wait..." : signUp ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {signUp ? (
          <Link href="/auth/sign-in" className="underline">Already have an account? Sign in</Link>
        ) : (
          <Link href="/auth/sign-up" className="underline">Need an account? Sign up</Link>
        )}
      </p>
    </div>
  );
}
