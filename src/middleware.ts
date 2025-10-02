import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token");

  // Protection des routes authentifiées
  if (
    (request.nextUrl.pathname.startsWith("/config") ||
      request.nextUrl.pathname.startsWith("/api/config")) &&
    !authToken
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/setup (setup API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/setup|_next/static|_next/image|favicon.ico).*)",
  ],
};
