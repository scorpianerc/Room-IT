// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect admin dari home ke admin dashboard
    if (pathname === "/" && token && (token?.role === "ADMIN" || token?.role === "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    // Redirect non-admin dari admin routes
    if (pathname.startsWith("/admin") && token && token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Always allow access to auth pages
        if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
          return true
        }

        // Check if user is trying to access admin routes
        if (pathname.startsWith("/admin")) {
          return !!token && (token?.role === "ADMIN" || token?.role === "SUPER_ADMIN")
        }
        
        // For other protected routes, check if user is logged in
        if (pathname.startsWith("/booking") || 
            pathname.startsWith("/status") ||
            pathname.startsWith("/notifications") ||
            pathname.startsWith("/rooms") ||
            pathname.startsWith("/cara-pesan") ||
            pathname === "/") {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|images).*)',
  ]
}