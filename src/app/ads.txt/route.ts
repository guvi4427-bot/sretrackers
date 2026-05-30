import { NextResponse } from "next/server";

/**
 * ads.txt — Served via route handler for maximum reliability.
 *
 * Using a route handler instead of a static file in /public avoids
 * Vercel's automatic `Content-Disposition` header and guarantees the
 * correct Content-Type, caching, and CORS headers that Google AdSense
 * crawlers expect.
 *
 * Reference: https://iabtechlab.com/ads-txt/
 */

const ADS_TXT = `google.com, pub-7745236489664493, DIRECT, f08c47fec0942fa0
google.com, pub-7745236489664493, RESELLER, f08c47fec0942fa0
`;

export async function GET() {
  return new NextResponse(ADS_TXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
