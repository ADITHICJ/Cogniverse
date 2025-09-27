import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser(req.cookies.get("sb-access-token")?.value);

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Fetch profile (role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  const pathname = req.nextUrl.pathname;

  // Protect teacher routes
  if (pathname.startsWith("/dashboard/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect HOD routes
  if (pathname.startsWith("/dashboard/hod") && role !== "hod") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Paths to run middleware on
export const config = {
  matcher: ["/dashboard/:path*"],
};
