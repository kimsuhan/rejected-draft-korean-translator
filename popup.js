const STORAGE_KEY = "rejectedDraftKoEnabled";
const MISSING_KEY = "rejectedDraftKoMissing";

const enabledInput = document.querySelector("#enabled");
const copyMissingButton = document.querySelector("#copyMissing");
const statusEl = document.querySelector("#status");

function setStatus(text) {
  statusEl.textContent = text;
}

chrome.storage.local.get({ [STORAGE_KEY]: true }, (result) => {
  enabledInput.checked = Boolean(result[STORAGE_KEY]);
});

enabledInput.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: enabledInput.checked }, () => {
    setStatus("설정을 저장했습니다. 게임 탭을 새로고침하세요.");
  });
});

copyMissingButton.addEventListener("click", async () => {
  chrome.storage.local.get({ [MISSING_KEY]: [] }, async (result) => {
    const missing = Array.isArray(result[MISSING_KEY]) ? result[MISSING_KEY] : [];
    if (!missing.length) {
      setStatus("수집된 미번역 문구가 없습니다.");
      return;
    }
    await navigator.clipboard.writeText(missing.join("\n"));
    setStatus(`${missing.length}개 문구를 복사했습니다.`);
  });
});
