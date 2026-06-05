'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'sre_cookie_consent';

/**
 * CookieConsent — Manages user consent for cookies and personalized ads.
 *
 * When the user accepts, it signals Google AdSense to serve personalized ads.
 * When dismissed or not yet consented, AdSense falls back to non-personalized ads.
 * Consent state is persisted in localStorage so the banner doesn't reappear.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show banner after a short delay so it doesn't flash on every page load
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      } else {
        // User already consented — signal AdSense for personalized ads
        applyConsentToAdsense(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  function applyConsentToAdsense(personalized: boolean) {
    try {
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        if (!personalized) {
          // Request non-personalized ads until user consents
          adsbygoogle.requestNonPersonalizedAds = 1;
        } else {
          // Allow personalized ads after consent
          adsbygoogle.requestNonPersonalizedAds = 0;
        }
        // Push consent update to AdSense
        adsbygoogle.pauseAdRequests = 0;
      }
    } catch {
      // AdSense not loaded yet
    }
  }

  function accept() {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
    } catch {}
    applyConsentToAdsense(true);
    setVisible(false);
  }

  function dismiss() {
    // User dismissed without accepting — keep non-personalized ads
    applyConsentToAdsense(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-background/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">We use cookies</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              We use cookies and similar technologies for essential site functionality, analytics, and to serve
              personalized ads through Google AdSense. You can opt out of personalized advertising at{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google Ads Settings
              </a>
              . Read our{' '}
              <a href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </a>{' '}
              for more details.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={accept}
                className="px-4 py-1.5 text-xs font-medium rounded-lg gradient-blue text-white hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismiss} className="text-muted-foreground/50 hover:text-foreground shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
