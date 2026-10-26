import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

// Pages only. /api/* routes check the session themselves and return 401 JSON.
// Paths with a file extension (manifest.json, icons) are public so the PWA can install.
export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
