import Script from 'next/script'
import React from 'react'

/**
 * Outseta auth / membership SDK. Ported from the Webflow site's end-of-<head>
 * snippet, with `tokenStorage: 'cookie'` added so the JWT access token is written
 * to a cookie the server can read — that cookie is what the /members gate
 * (`src/middleware.ts`) verifies. The SDK still powers the login / profile /
 * signup widgets and the join-page plan modals.
 *
 * Loaded site-wide (frontend layout) like the original, so the header login /
 * profile widgets work on every page.
 */
export const OutsetaScript: React.FC = () => {
  return (
    <>
      {/* o_options must exist before outseta.min.js runs. */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script
        id="outseta-options"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
  var isProd = window.location.origin === "https://mapsnational.org";
  var o_options = {
    domain: 'mapsnational.outseta.com',
    load: 'auth,customForm,emailList,leadCapture,nocode,profile,support',
    monitorDom: true,
    tokenStorage: 'cookie',
    auth: {
      authenticationCallbackUrl: isProd ? null : window.location.origin + "/members/portal"
    }
  };
  `,
        }}
      />
      <Script id="outseta-sdk" src="https://cdn.outseta.com/outseta.min.js" strategy="afterInteractive" />
    </>
  )
}
