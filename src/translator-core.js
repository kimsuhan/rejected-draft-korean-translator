(function initTranslatorCore(globalScope) {
  const TEXT_NODE = 3;
  const ELEMENT_NODE = 1;
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TEXTAREA", "INPUT"]);
  const ATTRIBUTES = ["aria-label", "title", "alt", "placeholder", "value"];

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isSkippableText(text) {
    if (!text) return true;
    return /^[\d\s.,:+\-x×%?✕☰|]+$/.test(text);
  }

  function looksEnglish(text) {
    return /[A-Za-z]/.test(text);
  }

  function createTranslator(dictionary, options = {}) {
    const translations = { ...dictionary };
    const patterns = Array.isArray(options.patterns) ? options.patterns : [];
    const onMissingText = typeof options.onMissingText === "function" ? options.onMissingText : null;
    const seenMissing = new Set();

    function translateString(value) {
      const normalized = normalizeText(value);
      if (isSkippableText(normalized)) return { changed: false, value };
      const translated = translations[normalized];
      if (translated) return { changed: true, value: translated };
      for (const [pattern, replacement] of patterns) {
        if (!pattern || !pattern.test(normalized)) continue;
        pattern.lastIndex = 0;
        return { changed: true, value: normalized.replace(pattern, replacement) };
      }
      if (onMissingText && looksEnglish(normalized) && !seenMissing.has(normalized)) {
        seenMissing.add(normalized);
        onMissingText(normalized);
      }
      return { changed: false, value };
    }

    function translateAttributes(element) {
      let translated = 0;
      if (!element || typeof element.getAttribute !== "function") return translated;
      for (const attr of ATTRIBUTES) {
        const current = element.getAttribute(attr);
        const result = translateString(current);
        if (result.changed) {
          element.setAttribute(attr, result.value);
          translated += 1;
        }
      }
      return translated;
    }

    function translateNode(node) {
      if (!node) return 0;
      if (node.nodeType === TEXT_NODE) {
        const result = translateString(node.nodeValue);
        if (result.changed) {
          node.nodeValue = result.value;
          return 1;
        }
        return 0;
      }
      if (node.nodeType !== ELEMENT_NODE || SKIP_TAGS.has(node.tagName)) return 0;
      let translated = translateAttributes(node);
      for (const child of Array.from(node.childNodes || [])) {
        translated += translateNode(child);
      }
      return translated;
    }

    function translateTree(root) {
      return { translated: translateNode(root) };
    }

    function observe(root, MutationObserverImpl) {
      translateTree(root);
      const Observer = MutationObserverImpl || globalScope.MutationObserver;
      if (!Observer) return () => {};
      const observer = new Observer((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            for (const node of mutation.addedNodes || []) translateNode(node);
          }
          if (mutation.type === "characterData") translateNode(mutation.target);
          if (mutation.type === "attributes") translateAttributes(mutation.target);
        }
      });
      observer.observe(root, {
        attributes: true,
        attributeFilter: ATTRIBUTES,
        characterData: true,
        childList: true,
        subtree: true,
      });
      return () => observer.disconnect();
    }

    return { observe, translateTree };
  }

  const api = { createTranslator, normalizeText };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.RejectedDraftTranslatorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
