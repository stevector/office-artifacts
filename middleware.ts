import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Log all headers (shows the external FQDN and other forwarding info)
  console.log('\n--- Request Headers ---');
  const headers: Record<string, string> = {};
  for (const [key, value] of Array.from(request.headers.entries())) {
    headers[key] = value;
  }
  // Use JSON.stringify for a clean, readable output of all headers
  console.log(JSON.stringify(headers, null, 2));


  const incomingProtocol = request.headers.get('x-forwarded-proto') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  console.log('incomingProtocol: ' + incomingProtocol + ' xForwardedHost: ' + xForwardedHost);
  if (incomingProtocol === 'http' && xForwardedHost) {
      url.protocol = "https:";
      url.hostname = xForwardedHost;
      url.port = "";
      // Use a 301 permanent redirect
      return NextResponse.redirect(url.toString(), 301);
  }

  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
