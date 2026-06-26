import Script from 'next/script'
import React from 'react'

/**
 * Outseta auth / membership SDK. Ported from the Webflow site's end-of-<head>
 * snippet, with `tokenStorage: 'cookie'` added so the JWT access token is written
 * to a cookie the server can read — that cookie is what the /members gate
 * (`src/middleware.ts`) verifies. The SDK still powers the login / profile /
 * signup widgets and the join-page plan modals.
 *
 * One script, not two: it sets `window.o_options` and THEN injects outseta.min.js
 * itself, so the config is guaranteed to exist before the SDK initializes. (Two
 * separate next/script tags raced — `beforeInteractive` is only reliable in the
 * root layout, not this route-group layout, so the SDK could load first and throw
 * "[domain] is a required option".)
 */
export const OutsetaScript: React.FC = () => {
  return (
    <Script
      id="outseta"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
  var isProd = window.location.origin === "https://mapsnational.org";
  window.o_options = {
    domain: 'mapsnational.outseta.com',
    load: 'auth,customForm,emailList,leadCapture,nocode,profile,support',
    monitorDom: true,
    tokenStorage: 'cookie',
    auth: {
      authenticationCallbackUrl: isProd ? null : window.location.origin + "/members/portal"
    }
  };
  (function () {
    if (document.getElementById('outseta-sdk')) return;
    var s = document.createElement('script');
    s.id = 'outseta-sdk';
    s.src = 'https://cdn.outseta.com/outseta.min.js';
    s.async = true;
    document.head.appendChild(s);
  })();
  `,
      }}
    />
  )
}
