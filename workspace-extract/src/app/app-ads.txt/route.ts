import { NextResponse } from "next/server";

/**
 * app-ads.txt — For mobile app monetization.
 *
 * Some ad networks and Google AdMob look for app-ads.txt in addition
 * to ads.txt. This mirrors the same publisher declarations for app
 * inventory.
 *
 * Reference: https://iabtechlab.com/ads-txt/
 */

const APP_ADS_TXT = `google.com, pub-7745236489664493, DIRECT, f08c47fec0942fa0
google.com, pub-7745236489664493, RESELLER, f08c47fec0942fa0
`;

export async function GET() {
  return new NextResponse(APP_ADS_TXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
