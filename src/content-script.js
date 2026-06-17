(function initRejectedDraftKoreanContentScript(globalScope) {
  const STORAGE_KEY = "rejectedDraftKoEnabled";
  const MISSING_KEY = "rejectedDraftKoMissing";
  const DEFAULT_ENABLED = true;
  const READABILITY_STYLE_ID = "rejected-draft-ko-readability-style";
  const dictionary = globalScope.REJECTED_DRAFT_KO_TRANSLATIONS || {};
  const patterns = globalScope.REJECTED_DRAFT_KO_PATTERNS || [];
  const core = globalScope.RejectedDraftTranslatorCore;

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
    storage.get({ [STORAGE_KEY]: DEFAULT_ENABLED }, (result) => {
      callback(Boolean(result[STORAGE_KEY]));
    });
  }

  function rememberMissing(text) {
    const storage = getChromeStorage();
    if (!storage) {
      console.debug("[Rejected Draft KO] missing:", text);
      return;
    }
    storage.get({ [MISSING_KEY]: [] }, (result) => {
      const current = Array.isArray(result[MISSING_KEY]) ? result[MISSING_KEY] : [];
      if (current.includes(text)) return;
      const next = [...current, text].slice(-300);
      storage.set({ [MISSING_KEY]: next });
      console.debug("[Rejected Draft KO] missing:", text);
    });
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

  function enhanceReadability(root) {
    if (!root || !globalScope.getComputedStyle) return;
    installReadabilityStyle();
    const elements = root.nodeType === 1 ? [root, ...Array.from(root.querySelectorAll("*"))] : [];
    for (const element of elements) {
      if (!hasOwnText(element) || element.closest("svg")) continue;
      const color = parseRgb(globalScope.getComputedStyle(element).color);
      if (!isMutedGray(color)) continue;
      const disabled = element.closest("[disabled], [aria-disabled='true']");
      element.setAttribute("data-rd-ko-readable-muted", disabled ? "disabled" : "true");
    }
  }

  function start() {
    if (!isSupportedPage() || !globalScope.document || !globalScope.document.body) return;
    readEnabled((enabled) => {
      if (!enabled) return;
      enhanceReadability(globalScope.document.body);
      const translator = core.createTranslator(dictionary, { onMissingText: rememberMissing, patterns });
      const disconnect = translator.observe(globalScope.document.body, globalScope.MutationObserver);
      const readabilityObserver = new globalScope.MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            for (const node of mutation.addedNodes || []) enhanceReadability(node);
          }
          if (mutation.type === "characterData") enhanceReadability(mutation.target.parentElement);
          if (mutation.type === "attributes") enhanceReadability(mutation.target);
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
