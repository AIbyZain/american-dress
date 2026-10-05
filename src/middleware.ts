import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * With Supabase configured: refreshes the session and redirects signed-out visitors
 * away from account, checkout and admin routes. The admin role itself is verified
 * on the server in the admin layout and in every admin action.
 * In demo mode there is no server session, so client-side demo guards apply instead.
 */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const needsUser = pathname.startsWith("/account") || pathname.startsWith("/checkout");
  const isAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (!userId && (needsUser || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin/login" : "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  // Only protected routes pay for a session check; public store pages skip middleware entirely.
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*", "/auth/:path*"],
};
