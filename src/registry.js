(function initRejectedDraftKoRegistry(globalScope) {
  const translations = globalScope.REJECTED_DRAFT_KO_TRANSLATIONS || {};
  const glossary = globalScope.REJECTED_DRAFT_KO_GLOSSARY || {};
  const patterns = globalScope.REJECTED_DRAFT_KO_PATTERNS || [];
  const sources = globalScope.REJECTED_DRAFT_KO_SOURCES || {};

  function rememberSource(kind, category, entries) {
    if (!category || !entries) return;
    const bucket = sources[kind] || {};
    bucket[category] = Object.keys(entries).length;
    sources[kind] = bucket;
  }

  function registerTranslations(entries, category) {
    Object.assign(translations, entries);
    rememberSource("translations", category, entries);
    globalScope.REJECTED_DRAFT_KO_TRANSLATIONS = translations;
    globalScope.REJECTED_DRAFT_KO_SOURCES = sources;
  }

  function registerGlossary(entries, category) {
    Object.assign(glossary, entries);
    Object.assign(translations, entries);
    rememberSource("glossary", category, entries);
    globalScope.REJECTED_DRAFT_KO_GLOSSARY = glossary;
    globalScope.REJECTED_DRAFT_KO_TRANSLATIONS = translations;
    globalScope.REJECTED_DRAFT_KO_SOURCES = sources;
  }

  function registerPatterns(entries, category) {
    patterns.push(...entries);
    if (category) {
      const bucket = sources.patterns || {};
      bucket[category] = entries.length;
      sources.patterns = bucket;
    }
    globalScope.REJECTED_DRAFT_KO_PATTERNS = patterns;
    globalScope.REJECTED_DRAFT_KO_SOURCES = sources;
  }

  function t(value) {
    return glossary[value] || translations[value] || value;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function trimCompactNumber(value) {
    return Number(value.toFixed(6)).toString();
  }

  function formatKoreanNumber(value) {
    if (value >= 1000000000000) return trimCompactNumber(value / 1000000000000) + "조";
    if (value >= 100000000) return trimCompactNumber(value / 100000000) + "억";
    if (value >= 10000) return trimCompactNumber(value / 10000) + "만";
    return trimCompactNumber(value);
  }

  function formatCompactNumber(amount, suffix) {
    const value = Number(String(amount).replace(/,/g, ""));
    if (!Number.isFinite(value)) return String(amount) + suffix;
    if (suffix === "K") return formatKoreanNumber(value * 1000);
    if (suffix === "M") return formatKoreanNumber(value * 1000000);
    if (suffix === "B") return formatKoreanNumber(value * 1000000000);
    if (suffix === "T") return formatKoreanNumber(value * 1000000000000);
    return String(amount) + suffix;
  }

  function scrollingTipContext() {
    const translations = globalScope.REJECTED_DRAFT_KO_SCROLLING_TIP_TRANSLATIONS || {};
    const labels = globalScope.REJECTED_DRAFT_KO_SCROLLING_TIP_LABELS || {};
    const bodies = Object.keys(translations).map(escapeRegExp);
    return {
      labels,
      translations,
      pattern: bodies.length
        ? new RegExp("^(TIP|팁|CRITIQUE|비평|FACT|사실|JOKE|농담|LPT|생활 팁) (#.+): (" + bodies.join("|") + ")$")
        : /^$/
    };
  }

  globalScope.RejectedDraftKoRegistry = {
    formatCompactNumber,
    registerGlossary,
    registerPatterns,
    registerTranslations,
    scrollingTipContext,
    t
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
