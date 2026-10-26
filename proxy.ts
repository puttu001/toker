import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

// Pages only. /api/* routes check the session themselves and return 401 JSON.
export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
