import { NextResponse, type NextRequest } from "next/server";

const publicApiPaths = ["/api/auth", "/api/contact", "/api/views"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isOnProtectedApi = pathname.startsWith("/api") && !publicApiPaths.some((p) => pathname.startsWith(p));

  const token =
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value;
  const isLoggedIn = !!token;

  if (!isLoggedIn && (isOnDashboard || isOnProtectedApi)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isOnAuth) {
    return NextResponse.redirect(new URL("/dashboard/edit", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
