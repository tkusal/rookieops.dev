type AnalyticsConsent = 'granted' | 'denied';

interface StoredConsent {
  version: 1;
  analytics: AnalyticsConsent;
  updatedAt: string;
}

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
}

const STORAGE_KEY = 'rookieops.analytics-consent';
const STORAGE_VERSION = 1;
const banner = document.querySelector<HTMLElement>('[data-analytics-consent]');

if (banner) {
  const measurementId = banner.dataset.measurementId?.trim() || '';
  const cookieDomain = banner.dataset.cookieDomain?.trim() || window.location.hostname;
  const acceptButton = banner.querySelector<HTMLButtonElement>('[data-consent-accept]');
  const rejectButton = banner.querySelector<HTMLButtonElement>('[data-consent-reject]');
  const preferenceButtons = document.querySelectorAll<HTMLButtonElement>('[data-consent-open]');
  const analyticsWindow = window as AnalyticsWindow;
  const disableKey = `ga-disable-${measurementId}` as const;
  let returnFocus: HTMLElement | null = null;

  const readConsent = (): AnalyticsConsent | null => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (!rawValue) return null;

      const stored = JSON.parse(rawValue) as Partial<StoredConsent>;
      if (
        stored.version !== STORAGE_VERSION ||
        (stored.analytics !== 'granted' && stored.analytics !== 'denied')
      ) {
        return null;
      }

      return stored.analytics;
    } catch {
      return null;
    }
  };

  const saveConsent = (analytics: AnalyticsConsent) => {
    const stored: StoredConsent = {
      version: STORAGE_VERSION,
      analytics,
      updatedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // A escolha ainda vale para esta página quando o armazenamento está indisponível.
    }
  };

  const hideBanner = (restoreFocus = false) => {
    banner.hidden = true;
    document.body.removeAttribute('data-consent-visible');

    if (restoreFocus && returnFocus?.isConnected) {
      returnFocus.focus();
    }
    returnFocus = null;
  };

  const showBanner = (opener?: HTMLElement) => {
    returnFocus = opener || null;
    banner.hidden = false;
    document.body.setAttribute('data-consent-visible', '');

    if (opener) {
      window.requestAnimationFrame(() => rejectButton?.focus());
    }
  };

  const ensureGtag = () => {
    analyticsWindow.dataLayer ||= [];
    analyticsWindow.gtag ||= (...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    };
    return analyticsWindow.gtag;
  };

  const loadGoogleAnalytics = () => {
    if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    Reflect.set(analyticsWindow, disableKey, false);
    const gtag = ensureGtag();

    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    if (!document.querySelector<HTMLScriptElement>('script[data-google-analytics]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.googleAnalytics = measurementId;
      document.head.append(script);

      gtag('js', new Date());
      gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    } else {
      gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    }
  };

  const removeAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(';')
      .map((cookie) => cookie.trim().split('=')[0])
      .filter((name) => name === '_ga' || name.startsWith('_ga_'));
    const domains = new Set([
      window.location.hostname,
      `.${window.location.hostname}`,
      cookieDomain,
      `.${cookieDomain}`
    ]);

    for (const name of cookieNames) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
      }
    }
  };

  const disableGoogleAnalytics = () => {
    if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    Reflect.set(analyticsWindow, disableKey, true);
    analyticsWindow.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    removeAnalyticsCookies();
  };

  acceptButton?.addEventListener('click', () => {
    saveConsent('granted');
    loadGoogleAnalytics();
    hideBanner(true);
  });

  rejectButton?.addEventListener('click', () => {
    saveConsent('denied');
    disableGoogleAnalytics();
    hideBanner(true);
  });

  for (const button of preferenceButtons) {
    button.addEventListener('click', () => showBanner(button));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || banner.hidden || !readConsent()) return;
    hideBanner(true);
  });

  const storedConsent = readConsent();
  if (storedConsent === 'granted') {
    loadGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
    if (!storedConsent) showBanner();
  }
}
