(function () {
  const MEDIA_BASES = {
    main: './',
    media1: 'https://vanity1412.github.io/English-Vocabulary-Learning1/',
    // ETS 2024/2026 live in media2. Raw is less prone to GitHub Pages cold-load hiccups here.
    media2: 'https://raw.githubusercontent.com/vanity1412/English-Vocabulary-Learning2/main/',
    media3: 'https://vanity1412.github.io/English-Vocabulary-Learning3/'
  };

  const FALLBACK_MEDIA_BASES = {
    media1: 'https://raw.githubusercontent.com/vanity1412/English-Vocabulary-Learning1/main/',
    media2: 'https://vanity1412.github.io/English-Vocabulary-Learning2/',
    media3: 'https://raw.githubusercontent.com/vanity1412/English-Vocabulary-Learning3/main/'
  };

  const MEDIA_BUCKETS = {
    'Media/ets 2018 test 1': 'main',
    'Media/ets 2018 test 2': 'main',
    'Media/ets 2018 test 3': 'main',
    'Media/ets 2018 test 4': 'main',
    'Media/ets 2018 test 5': 'main',
    'Media/ets 2019 test 1': 'main',
    'Media/ets 2019 test 2': 'main',
    'Media/ets 2019 test 3': 'main',
    'Media/ets 2019 test 4': 'media1',
    'Media/ets 2019 test 5': 'media2',
    'Media/ets 2020 test 3': 'main',
    'Media/ets 2020 test 4': 'main',
    'Media/ets 2020 test 5': 'main',
    'Media/ets 2020 test 6': 'main',
    'Media/ets 2020 test 7': 'main',
    'Media/ets 2020 test 8': 'main',
    'Media/ets 2020 test 9': 'main',
    'Media/ets 2020 test 10': 'main',
    'Media/hacker 2 test 1': 'media3',

    'Media/ets 2022 test 1': 'media1',
    'Media/ets 2022 test 2': 'media1',
    'Media/ets 2022 test 3': 'media1',
    'Media/ets 2022 test 4': 'media1',
    'Media/ets 2022 test 5': 'media1',
    'Media/ets 2022 test 6': 'media1',
    'Media/ets 2023 test 1': 'media1',
    'Media/ets 2023 test 2': 'media1',
    'Media/ets 2023 test 3': 'media1',
    'Media/ets 2023 test 4': 'media1',
    'Media/ets 2023 test 5': 'media1',
    'Media/ets 2023 test 6': 'media1',
    'Media/ets 2023 test 7': 'media1',
    'Media/ets 2023 test 8': 'media1',
    'Media/ets 2023 test 9': 'media1',
    'Media/ets 2023 test 10': 'media1',
    'Media/hacker 2 test 2': 'media1',
    'Media/hacker 2 test 3': 'media1',

    'Media/ets 2024 test 1': 'media2',
    'Media/ets 2024 test 2': 'media2',
    'Media/ets 2024 test 3': 'media2',
    'Media/ets 2024 test 4': 'media2',
    'Media/ets 2024 test 5': 'media2',
    'Media/ets 2024 test 6': 'media2',
    'Media/ets 2024 test 7': 'media2',
    'Media/ets 2024 test 8': 'media2',
    'Media/ets 2024 test 9': 'media2',
    'Media/ets 2024 test 10': 'media2',
    'Media/ets 2026 test 1': 'media2',
    'Media/ets 2026 test 2': 'media2',
    'Media/ets 2026 test 3': 'media2',
    'Media/ets 2026 test 4': 'media2',
    'Media/ets 2026 test 5': 'media2',
    'Media/ets 2026 test 6': 'media2',
    'Media/ets 2026 test 7': 'media2',
    'Media/ets 2026 test 8': 'media2',
    'Media/ets 2026 test 9': 'media2',
    'Media/ets 2026 test 10': 'media2',

    'Media/hacker 2 test 4': 'media3',
    'Media/hacker 2 test 5': 'media3',
    'Media/hacker 2 test 6': 'media3',
    'Media/hacker 2 test 7': 'media3',
    'Media/hacker 2 test 8': 'media3',
    'Media/hacker 2 test 9': 'media3',
    'Media/hacker 2 test 10': 'media3',
    'Media/hacker 3 test 1': 'media3',
    'Media/hacker 3 test 2': 'media3',
    'Media/hacker 3 test 3': 'media3',
    'Media/hacker 3 test 4': 'media3',
    'Media/hacker 3 test 5': 'media3',
    'Media/hacker 3 test 6': 'media3',
    'Media/hacker 3 test 7': 'media3',
    'Media/hacker 3 test 8': 'media3',
    'Media/hacker 3 test 9': 'media3',
    'Media/hacker 3 test 10': 'media3',
    'SW Media': 'media3',
    'Sample': 'media3'
  };

  const MEDIA_SELECTOR = 'img[src], source[src], audio[src], video[src]';

  function stripRelativePrefix(path) {
    return String(path || '').replace(/^\.\//, '');
  }

  function safeDecodeUri(value) {
    try {
      return decodeURI(value);
    } catch (error) {
      return value;
    }
  }

  function getPageBase() {
    try {
      return new URL('./', window.location.href).href;
    } catch (error) {
      return '';
    }
  }

  function joinBase(base, path) {
    const cleanBase = base.endsWith('/') ? base : base + '/';
    return encodeURI(cleanBase + stripRelativePrefix(path));
  }

  function extractToeicAssetPath(value) {
    const rawValue = stripRelativePrefix(String(value || '').trim());
    if (!rawValue) return '';

    const decodedValue = stripRelativePrefix(safeDecodeUri(rawValue));
    if (/^(?:Media|SW Media|Sample)\//i.test(decodedValue)) return decodedValue;

    const knownBases = [
      ...Object.values(MEDIA_BASES),
      ...Object.values(FALLBACK_MEDIA_BASES),
      getPageBase()
    ].filter(Boolean).sort((a, b) => b.length - a.length);

    for (const base of knownBases) {
      const decodedBase = safeDecodeUri(base);

      if (rawValue.startsWith(base)) {
        const relativePath = stripRelativePrefix(safeDecodeUri(rawValue.slice(base.length)));
        if (/^(?:Media|SW Media|Sample)\//i.test(relativePath)) return relativePath;
      }

      if (decodedValue.startsWith(decodedBase)) {
        const relativePath = stripRelativePrefix(decodedValue.slice(decodedBase.length));
        if (/^(?:Media|SW Media|Sample)\//i.test(relativePath)) return relativePath;
      }
    }

    // Saved localStorage snapshots may contain old absolute main-site URLs:
    // https://.../English-Vocabulary-Learning/Media/ets 2026...
    const repoUrlMatch = decodedValue.match(/\/(?:English-Vocabulary-Learning|English-Vocabulary-Learning[123])\/((?:Media|SW Media|Sample)\/.+)$/i);
    if (repoUrlMatch) return stripRelativePrefix(repoUrlMatch[1]);

    const assetTailMatch = decodedValue.match(/((?:Media|SW Media|Sample)\/.+)$/i);
    return assetTailMatch ? stripRelativePrefix(assetTailMatch[1]) : '';
  }

  function getBucket(path) {
    const cleanPath = stripRelativePrefix(path);
    const matchingPrefix = Object.keys(MEDIA_BUCKETS)
      .sort((a, b) => b.length - a.length)
      .find(prefix => cleanPath === prefix || cleanPath.startsWith(prefix + '/'));

    return matchingPrefix ? MEDIA_BUCKETS[matchingPrefix] : 'main';
  }

  function resolveToeicAsset(path) {
    if (!path || /^(?:data:|#|\/)/i.test(path)) return path;

    const cleanPath = extractToeicAssetPath(path);
    if (!cleanPath) return path;

    const bucket = getBucket(cleanPath);
    return joinBase(MEDIA_BASES[bucket] || MEDIA_BASES.main, cleanPath);
  }

  function sameUrl(a, b) {
    return safeDecodeUri(String(a || '')) === safeDecodeUri(String(b || ''));
  }

  function getAlternateToeicAsset(pathOrUrl) {
    const cleanPath = extractToeicAssetPath(pathOrUrl);
    if (!cleanPath) return '';

    const bucket = getBucket(cleanPath);
    if (bucket === 'main' || !FALLBACK_MEDIA_BASES[bucket]) return '';

    const primary = joinBase(MEDIA_BASES[bucket] || MEDIA_BASES.main, cleanPath);
    const fallback = joinBase(FALLBACK_MEDIA_BASES[bucket], cleanPath);
    return sameUrl(pathOrUrl, fallback) ? primary : fallback;
  }

  function resolveToeicAssetInHtml(html) {
    if (!html) return html;

    return String(html).replace(
      /(src|href)\s*=\s*(["'])([^"']*(?:Media|SW Media|Sample)\/[^"']+)\2/gi,
      (match, attribute, quote, path) => `${attribute}=${quote}${resolveToeicAsset(path)}${quote}`
    );
  }

  function getMediaElements(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const elements = [];

    if (scope.matches && scope.matches(MEDIA_SELECTOR)) elements.push(scope);
    if (scope.querySelectorAll) elements.push(...scope.querySelectorAll(MEDIA_SELECTOR));

    return elements;
  }

  function reloadOwningMedia(element) {
    const parentMedia = element.parentElement && /^(AUDIO|VIDEO)$/i.test(element.parentElement.tagName)
      ? element.parentElement
      : null;

    if (parentMedia) parentMedia.load();
    if (/^(AUDIO|VIDEO)$/i.test(element.tagName)) element.load();
  }

  function setMediaSrc(element, nextSrc) {
    if (!element || !nextSrc) return false;

    const current = element.getAttribute('src') || element.currentSrc || element.src || '';
    if (sameUrl(current, nextSrc)) return false;

    element.removeAttribute('data-toeic-media-fallback-tried');
    element.setAttribute('src', nextSrc);
    reloadOwningMedia(element);
    return true;
  }

  function normalizeToeicMediaElement(element) {
    if (!element || !element.getAttribute) return;

    element.removeAttribute('data-toeic-media-fallback-tried');

    const currentSrc = element.getAttribute('src');
    if (!currentSrc) return;

    const primary = resolveToeicAsset(currentSrc);
    if (primary && primary !== currentSrc) {
      element.__toeicMediaFallbackTried = false;
      setMediaSrc(element, primary);
    }
  }

  function retryWithAlternateMedia(element) {
    if (!element || element.__toeicMediaFallbackTried) return false;

    const current = element.getAttribute('src') || element.currentSrc || element.src;
    const alternate = getAlternateToeicAsset(current);
    if (!alternate || sameUrl(current, alternate)) return false;

    element.__toeicMediaFallbackTried = true;
    return setMediaSrc(element, alternate);
  }

  function retryAudioSources(mediaElement) {
    if (!mediaElement) return false;

    const sources = Array.from(mediaElement.querySelectorAll('source[src]'));
    if (sources.length) {
      const changed = sources.some(source => retryWithAlternateMedia(source));
      if (changed) mediaElement.load();
      return changed;
    }

    return retryWithAlternateMedia(mediaElement);
  }

  function checkMediaElement(element, allowSlowFallback) {
    if (!element || !element.tagName) return;

    normalizeToeicMediaElement(element);

    const tagName = element.tagName.toUpperCase();

    if (tagName === 'IMG') {
      if ((element.complete && element.naturalWidth === 0) || (allowSlowFallback && !element.complete)) {
        retryWithAlternateMedia(element);
      }
      return;
    }

    if (tagName === 'SOURCE') {
      const parentMedia = element.parentElement && /^(AUDIO|VIDEO)$/i.test(element.parentElement.tagName)
        ? element.parentElement
        : null;

      if (parentMedia && (parentMedia.error || parentMedia.networkState === 3 || (allowSlowFallback && parentMedia.readyState === 0))) {
        retryWithAlternateMedia(element);
        parentMedia.load();
      }
      return;
    }

    if (tagName === 'AUDIO' || tagName === 'VIDEO') {
      if (element.error || element.networkState === 3 || (allowSlowFallback && element.readyState === 0)) {
        retryAudioSources(element);
      }
    }
  }

  function refreshToeicMedia(root) {
    const elements = getMediaElements(root);
    elements.forEach(normalizeToeicMediaElement);

    [800, 3000, 6500].forEach(delay => {
      window.setTimeout(() => {
        getMediaElements(root).forEach(element => checkMediaElement(element, delay >= 3000));
      }, delay);
    });
  }

  function installToeicMediaFallbacks() {
    document.addEventListener('error', event => {
      const element = event.target;
      if (!element || !element.tagName) return;

      const tagName = element.tagName.toUpperCase();
      if (tagName === 'IMG' || tagName === 'SOURCE') {
        retryWithAlternateMedia(element);
        return;
      }

      if (tagName === 'AUDIO' || tagName === 'VIDEO') {
        retryAudioSources(element);
      }
    }, true);

    const runInitialRefresh = () => refreshToeicMedia(document);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInitialRefresh, { once: true });
    } else {
      runInitialRefresh();
    }

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node && node.nodeType === 1) refreshToeicMedia(node);
          });
        });
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  window.TOEIC_MEDIA_BASES = MEDIA_BASES;
  window.TOEIC_MEDIA_FALLBACK_BASES = FALLBACK_MEDIA_BASES;
  window.TOEIC_MEDIA_BUCKETS = MEDIA_BUCKETS;
  window.resolveToeicAsset = resolveToeicAsset;
  window.resolveToeicAssetInHtml = resolveToeicAssetInHtml;
  window.getAlternateToeicAsset = getAlternateToeicAsset;
  window.refreshToeicMedia = refreshToeicMedia;

  installToeicMediaFallbacks();
})();
