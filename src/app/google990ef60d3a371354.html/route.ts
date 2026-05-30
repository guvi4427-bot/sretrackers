import { NextResponse } from "next/server";

/**
 * Google Search Console verification file.
 *
 * Served via route handler to guarantee correct Content-Type and
 * avoid Vercel's automatic Content-Disposition header on static files.
 *
 * URL: /google990ef60d3a371354.html
 */

const VERIFICATION_CONTENT = "google-site-verification: google990ef60d3a371354.html";

export async function GET() {
  return new NextResponse(VERIFICATION_CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=604800, s-maxage=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
