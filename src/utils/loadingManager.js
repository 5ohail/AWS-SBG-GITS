/**
 * AWS COMMUNITY DAY UDAIPUR — ASSET LOADING MANAGER & PERFORMANCE PIPELINE
 * 
 * Separates critical assets (Hero background, Geist fonts, Three.js)
 * from non-critical deferred assets (speakers, team, volunteers, sponsors).
 */

const SESSION_STORAGE_KEY = 'aws-community-loaded';

/**
 * Preloads an image safely. Always resolves (even on error) so no image failure
 * can ever trap the user on the loading screen.
 */
export function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src || typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Resolve safely on error: do not block the pipeline
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Checks if the visitor has already completed the initial loading sequence in this session.
 */
export function isReturningVisitor() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the session as loaded once the loader sequence finishes.
 */
export function markAsLoaded() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage errors in private browsing
  }
}

/**
 * Loads CRITICAL assets that are strictly required for the Hero to render cleanly.
 * Protected by a hard ceiling timeout (4200ms) so users are never trapped.
 */
export function loadCriticalAssets() {
  const fontPromise = (async () => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 1800))
        ]);
      } catch {
        // Fallback
      }
    }
  })();

  // Critical Hero Background Image
  const heroImagePromise = preloadImage('/assets/udaipur_palace.jpg');

  // Hard safety timeout of 4200ms (Section 57)
  const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 4200));

  return Promise.race([
    Promise.all([fontPromise, heroImagePromise]),
    safetyTimeout
  ]);
}

/**
 * Defers loading of lower-page assets (speakers, team, sponsors) using requestIdleCallback
 * so they never compete with Hero initialization or the initial frame rate.
 */
export function startDeferredAssets() {
  const loadAssets = () => {
    // Top 3 priority speaker portraits
    const deferredList = [
      '/assets/speakers/speaker-01.jpg',
      '/assets/speakers/speaker-02.jpg',
      '/assets/speakers/speaker-03.jpg'
    ];

    deferredList.forEach((src) => {
      preloadImage(src);
    });
  };

  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAssets, { timeout: 2500 });
    } else {
      setTimeout(loadAssets, 300);
    }
  }
}
