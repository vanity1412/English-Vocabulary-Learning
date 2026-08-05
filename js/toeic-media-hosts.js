(function () {
  const MEDIA_BASES = {
    main: './',
    media1: 'https://vanity1412.github.io/English-Vocabulary-Learning1/',
    media2: 'https://vanity1412.github.io/English-Vocabulary-Learning2/',
    media3: 'https://vanity1412.github.io/English-Vocabulary-Learning3/'
  };

  const FALLBACK_MEDIA_BASES = {
    media1: 'https://raw.githubusercontent.com/vanity1412/English-Vocabulary-Learning1/main/',
    media2: 'https://raw.githubusercontent.com/vanity1412/English-Vocabulary-Learning2/main/',
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

  function stripRelativePrefix(path) {
    return String(path || '').replace(/^\.\//, '');
  }

  function joinBase(base, path) {
    const cleanBase = base.endsWith('/') ? base : base + '/';
    return encodeURI(cleanBase + stripRelativePrefix(path));
  }

  function getBucket(path) {
    const cleanPath = stripRelativePrefix(path);
    const matchingPrefix = Object.keys(MEDIA_BUCKETS)
      .sort((a, b) => b.length - a.length)
      .find(prefix => cleanPath === prefix || cleanPath.startsWith(prefix + '/'));

    return matchingPrefix ? MEDIA_BUCKETS[matchingPrefix] : 'main';
  }

  function resolveToeicAsset(path) {
    if (!path || /^(?:https?:|data:|#|\/)/i.test(path)) return path;

    const cleanPath = stripRelativePrefix(path);
    if (!/^(?:Media|SW Media|Sample)\//i.test(cleanPath)) return path;

    const bucket = getBucket(cleanPath);
    return joinBase(MEDIA_BASES[bucket] || MEDIA_BASES.main, cleanPath);
  }

  function getAlternateToeicAsset(pathOrUrl) {
    const value = String(pathOrUrl || '');
    if (!value) return '';

    const primaryBucket = Object.keys(MEDIA_BASES)
      .filter(bucket => bucket !== 'main')
      .find(bucket => value.startsWith(MEDIA_BASES[bucket]));

    if (primaryBucket && FALLBACK_MEDIA_BASES[primaryBucket]) {
      return FALLBACK_MEDIA_BASES[primaryBucket] + value.slice(MEDIA_BASES[primaryBucket].length);
    }

    const fallbackBucket = Object.keys(FALLBACK_MEDIA_BASES)
      .find(bucket => value.startsWith(FALLBACK_MEDIA_BASES[bucket]));

    if (fallbackBucket && MEDIA_BASES[fallbackBucket]) {
      return MEDIA_BASES[fallbackBucket] + value.slice(FALLBACK_MEDIA_BASES[fallbackBucket].length);
    }

    if (/^(?:https?:|data:|#|\/)/i.test(value)) return '';

    const cleanPath = stripRelativePrefix(value);
    if (!/^(?:Media|SW Media|Sample)\//i.test(cleanPath)) return '';

    const bucket = getBucket(cleanPath);
    return FALLBACK_MEDIA_BASES[bucket] ? joinBase(FALLBACK_MEDIA_BASES[bucket], cleanPath) : '';
  }

  function resolveToeicAssetInHtml(html) {
    if (!html) return html;

    return String(html).replace(
      /(src|href)\s*=\s*(["'])(\.\/(?:Media|SW Media|Sample)\/[^"']+|(?:Media|SW Media|Sample)\/[^"']+)\2/gi,
      (match, attribute, quote, path) => `${attribute}=${quote}${resolveToeicAsset(path)}${quote}`
    );
  }

  function retryWithAlternateMedia(element) {
    if (!element || element.dataset.toeicMediaFallbackTried === '1') return;

    const current = element.currentSrc || element.getAttribute('src') || element.src;
    const alternate = getAlternateToeicAsset(current);
    if (!alternate || alternate === current) return;

    element.dataset.toeicMediaFallbackTried = '1';
    element.setAttribute('src', alternate);

    const parentMedia = element.parentElement && /^(AUDIO|VIDEO)$/i.test(element.parentElement.tagName)
      ? element.parentElement
      : null;

    if (parentMedia) parentMedia.load();
    if (/^(AUDIO|VIDEO)$/i.test(element.tagName)) element.load();
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
        const sources = Array.from(element.querySelectorAll('source'));
        if (sources.length) {
          sources.forEach(retryWithAlternateMedia);
          element.load();
        } else {
          retryWithAlternateMedia(element);
        }
      }
    }, true);
  }

  window.TOEIC_MEDIA_BASES = MEDIA_BASES;
  window.TOEIC_MEDIA_FALLBACK_BASES = FALLBACK_MEDIA_BASES;
  window.TOEIC_MEDIA_BUCKETS = MEDIA_BUCKETS;
  window.resolveToeicAsset = resolveToeicAsset;
  window.resolveToeicAssetInHtml = resolveToeicAssetInHtml;
  window.getAlternateToeicAsset = getAlternateToeicAsset;

  installToeicMediaFallbacks();
})();
