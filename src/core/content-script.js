(function initRejectedDraftKoreanContentScript(globalScope) {
  const STORAGE_KEY = "rejectedDraftKoEnabled";
  const MISSING_KEY = "rejectedDraftKoMissing";
  const DEFAULT_ENABLED = true;
  const ENABLE_MISSING_TEXT_CAPTURE = true;
  const READABILITY_STYLE_ID = "rejected-draft-ko-readability-style";
  const dictionary = globalScope.REJECTED_DRAFT_KO_TRANSLATIONS || {};
  const patterns = globalScope.REJECTED_DRAFT_KO_PATTERNS || [];
  const core = globalScope.RejectedDraftTranslatorCore;
  const READABILITY_BATCH_SIZE = 250;
  const MISSING_FLUSH_DELAY_MS = 500;
  const pendingMissing = new Set();
  let missingFlushTimer = null;

  if (!core || globalScope.__rejectedDraftKoTranslatorLoaded) return;
  globalScope.__rejectedDraftKoTranslatorLoaded = true;

  function isSupportedPage() {
    return (
      globalScope.location.hostname === "kuzzigames.com" ||
      (globalScope.location.hostname === "galaxy.click" && globalScope.location.pathname.startsWith("/play/733"))
    );
  }

  function getChromeStorage() {
    return globalScope.chrome && globalScope.chrome.storage && globalScope.chrome.storage.local;
  }

  function readEnabled(callback) {
    const storage = getChromeStorage();
    if (!storage) return callback(DEFAULT_ENABLED);
    try {
      storage.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (result) => {
        callback(Boolean(result && result[STORAGE_KEY]));
      });
    } catch (_error) {
      callback(DEFAULT_ENABLED);
    }
  }

  function rememberMissing(text) {
    if (!ENABLE_MISSING_TEXT_CAPTURE) return;
    pendingMissing.add(text);
    if (missingFlushTimer) return;
    missingFlushTimer = globalScope.setTimeout(flushMissingTexts, MISSING_FLUSH_DELAY_MS);
  }

  function flushMissingTexts() {
    missingFlushTimer = null;
    const texts = Array.from(pendingMissing);
    pendingMissing.clear();
    if (!texts.length) return;

    const storage = getChromeStorage();
    if (!storage) {
      for (const text of texts) console.debug("[Rejected Draft KO] missing:", text);
      return;
    }
    try {
      storage.get({ [MISSING_KEY]: [] }, (result) => {
        const current = Array.isArray(result && result[MISSING_KEY]) ? result[MISSING_KEY] : [];
        const known = new Set(current);
        const additions = texts.filter((text) => !known.has(text));
        if (!additions.length) return;
        const next = [...current, ...additions].slice(-300);
        try {
          storage.set({ [MISSING_KEY]: next });
        } catch (_error) {
          return;
        }
        for (const text of additions) console.debug("[Rejected Draft KO] missing:", text);
      });
    } catch (_error) {
      for (const text of texts) console.debug("[Rejected Draft KO] missing:", text);
    }
  }

  function installReadabilityStyle() {
    if (globalScope.document.getElementById(READABILITY_STYLE_ID)) return;
    const style = globalScope.document.createElement("style");
    style.id = READABILITY_STYLE_ID;
    style.textContent = `
      [data-rd-ko-readable-muted="true"] {
        color: #666 !important;
        opacity: 1 !important;
      }

      [data-rd-ko-readable-muted="disabled"] {
        color: #777 !important;
        opacity: 1 !important;
      }
    `;
    globalScope.document.head.appendChild(style);
  }

  function parseRgb(value) {
    const match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4]),
    };
  }

  function isMutedGray(color) {
    if (!color || color.a < 0.35) return false;
    const average = (color.r + color.g + color.b) / 3;
    const spread = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    return average >= 135 && average <= 220 && spread <= 28;
  }

  function hasOwnText(element) {
    return Array.from(element.childNodes || []).some((node) => (
      node.nodeType === 3 && String(node.nodeValue || "").trim().length > 0
    ));
  }

  function collectReadableElements(root) {
    if (!root || root.nodeType !== 1) return [];
    const elements = [root];
    if (typeof root.querySelectorAll === "function") {
      elements.push(...Array.from(root.querySelectorAll("*")));
    }
    return elements;
  }

  function enhanceReadabilityElement(element) {
    if (!element || !hasOwnText(element) || element.closest("svg")) return;
    const color = parseRgb(globalScope.getComputedStyle(element).color);
    if (!isMutedGray(color)) return;
    const disabled = element.closest("[disabled], [aria-disabled='true']");
    element.setAttribute("data-rd-ko-readable-muted", disabled ? "disabled" : "true");
  }

  function createReadabilityScheduler() {
    const pending = new Set();
    let scheduled = false;

    function process() {
      scheduled = false;
      installReadabilityStyle();
      let processed = 0;
      for (const element of Array.from(pending)) {
        pending.delete(element);
        if (element && element.isConnected !== false) enhanceReadabilityElement(element);
        processed += 1;
        if (processed >= READABILITY_BATCH_SIZE) break;
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
        if (!root || !globalScope.getComputedStyle) return;
        for (const element of collectReadableElements(root)) pending.add(element);
        schedule();
      },
    };
  }

  function start() {
    if (!isSupportedPage() || !globalScope.document || !globalScope.document.body) return;
    readEnabled((enabled) => {
      if (!enabled) return;
      const readability = createReadabilityScheduler();
      readability.add(globalScope.document.body);
      const translator = core.createTranslator(dictionary, {
        onMissingText: ENABLE_MISSING_TEXT_CAPTURE ? rememberMissing : null,
        patterns,
      });
      const disconnect = translator.observe(globalScope.document.body, globalScope.MutationObserver);
      const readabilityObserver = new globalScope.MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            for (const node of mutation.addedNodes || []) readability.add(node);
          }
          if (mutation.type === "characterData") readability.add(mutation.target.parentElement);
          if (mutation.type === "attributes") readability.add(mutation.target);
        }
      });
      readabilityObserver.observe(globalScope.document.body, {
        attributes: true,
        attributeFilter: ["class", "style", "disabled", "aria-disabled"],
        characterData: true,
        childList: true,
        subtree: true,
      });
      globalScope.__rejectedDraftKoTranslatorDisconnect = disconnect;
      globalScope.__rejectedDraftKoReadabilityDisconnect = () => readabilityObserver.disconnect();
      console.debug("[Rejected Draft KO] translator enabled", {
        entries: Object.keys(dictionary).length,
        host: globalScope.location.hostname,
      });
    });
  }

  if (globalScope.document.readyState === "loading") {
    globalScope.document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
