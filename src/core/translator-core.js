(function initTranslatorCore(globalScope) {
  const TEXT_NODE = 3;
  const ELEMENT_NODE = 1;
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TEXTAREA", "INPUT"]);
  const ATTRIBUTES = ["aria-label", "title", "alt", "placeholder", "value"];
  const TRANSLATION_BATCH_SIZE = 350;

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

    function collectTranslationNodes(root) {
      if (!root) return [];
      if (root.nodeType === TEXT_NODE) return [root];
      if (root.nodeType !== ELEMENT_NODE || SKIP_TAGS.has(root.tagName)) return [];

      const nodes = [root];
      const walker = globalScope.document && globalScope.document.createTreeWalker
        ? globalScope.document.createTreeWalker(root, 5)
        : null;
      if (!walker) return nodes;

      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === ELEMENT_NODE && SKIP_TAGS.has(node.tagName)) {
          node = walker.nextSibling();
          continue;
        }
        nodes.push(node);
        node = walker.nextNode();
      }
      return nodes;
    }

    function translateSingleNode(node) {
      if (!node) return 0;
      if (node.nodeType === TEXT_NODE) {
        const result = translateString(node.nodeValue);
        if (result.changed) {
          node.nodeValue = result.value;
          return 1;
        }
        return 0;
      }
      if (node.nodeType === ELEMENT_NODE && !SKIP_TAGS.has(node.tagName)) {
        return translateAttributes(node);
      }
      return 0;
    }

    function createTranslationScheduler() {
      const pending = new Set();
      let scheduled = false;

      function process() {
        scheduled = false;
        let processed = 0;
        for (const node of Array.from(pending)) {
          pending.delete(node);
          if (node && node.isConnected !== false) translateSingleNode(node);
          processed += 1;
          if (processed >= TRANSLATION_BATCH_SIZE) break;
        }
        if (pending.size) schedule();
      }

      function schedule() {
        if (scheduled) return;
        scheduled = true;
        const requestFrame = globalScope.requestAnimationFrame || ((callback) => globalScope.setTimeout(callback, 16));
        requestFrame(process);
      }

      return {
        add(root) {
          for (const node of collectTranslationNodes(root)) pending.add(node);
          schedule();
        },
      };
    }

    function observe(root, MutationObserverImpl) {
      const Observer = MutationObserverImpl || globalScope.MutationObserver;
      if (!Observer) return () => {};
      const scheduler = createTranslationScheduler();
      scheduler.add(root);
      const observer = new Observer((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            for (const node of mutation.addedNodes || []) scheduler.add(node);
          }
          if (mutation.type === "characterData") scheduler.add(mutation.target);
          if (mutation.type === "attributes") scheduler.add(mutation.target);
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
