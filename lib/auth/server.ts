import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

/**
 * Returns the signed-in user, or null. If ALLOWED_EMAIL is set, only that
 * email is accepted, so a stranger who registers directly against the auth
 * endpoint still cannot read or edit notes.
 */
export async function getCurrentUser() {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (allowed && user.email.toLowerCase() !== allowed) return null;
  return user;
}

export const unauthorized = () =>
  Response.json({ error: "Unauthorized" }, { status: 401 });
