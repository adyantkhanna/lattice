import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * In local mode this middleware is a no-op — all routes are public.
 * In multi mode, protected routes redirect to sign-in if the user is not
 * authenticated. Auth.js session validation is delegated to lib/auth/auth.ts.
 */
export async function middleware(request: NextRequest) {
  const authMode = process.env.AUTH_MODE ?? "local";

  if (authMode === "local") {
    return NextResponse.next();
  }

  // Multi-user: protect app routes, allow auth routes through.
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/api/auth");
  if (isAuthRoute) return NextResponse.next();

  const { auth } = await import("./lib/auth/auth");
  const session = await auth();
  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
