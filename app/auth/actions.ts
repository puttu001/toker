"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

type FormState = { error: string } | null;

export async function signInWithEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message || "Failed to sign in. Try again." };
  redirect("/");
}

export async function signUpWithEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  const email = String(formData.get("email") ?? "");
  if (allowed && email.toLowerCase() !== allowed) {
    return { error: "Sign-up is not available for this email." };
  }
  const { error } = await auth.signUp.email({
    email,
    name: String(formData.get("name") ?? "") || email,
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message || "Failed to create account." };
  redirect("/");
}

export async function signOut() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
