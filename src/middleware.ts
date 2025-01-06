import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    const url = req.nextUrl.clone();
    url.pathname = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/settings", "/data/:path*", "/planner/:path*"],
};
