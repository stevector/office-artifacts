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

  //x-fastly-orig-host
  // pcontext-site-env
  // x-proto
  // Is the site Machine name available as an env var?
  const siteMachineName = "office-artifacts";
  const siteEnv = request.headers.get('pcontext-site-env') || '';
  const incomingProtocol = request.headers.get('x-proto') || '';
  const policyDocSurrogateKey = request.headers.get('policy-doc-surrogate-key') || '';
  console.log('incomingProtocol: ' + incomingProtocol + ' policyDocSurrogateKey: ' + policyDocSurrogateKey);
  if (incomingProtocol === 'http://' && policyDocSurrogateKey && policyDocSurrogateKey.trim().endsWith(siteMachineName + '.pantheonsite.io')) {

    url.protocol = "https:";
    url.hostname = policyDocSurrogateKey;
    url.port = "";
    // Use a 301 permanent redirect
    return NextResponse.redirect(url.toString(), 301);
  }

  if (siteEnv === 'pr-17' || siteEnv === 'live') {
    console.log('inside siteEnv check');
    if (policyDocSurrogateKey === 'pr-17-office-artifacts.pantheonsite.io' || policyDocSurrogateKey === 'live-office-artifacts.pantheonsite.io') {
      url.protocol = "https:";
      url.hostname = "office-artifacts.stevector.com";
      url.port = "";
      // Use a 301 permanent redirect
      return NextResponse.redirect(url.toString(), 301);
    }
  }

  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
