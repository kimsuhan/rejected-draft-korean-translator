(function initRejectedDraftNotificationsPatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^Gallery Tutorial: (.+)$/, "갤러리 튜토리얼: $1"],
    [/^Shop Tutorial: (.+)$/, "상점 튜토리얼: $1"],
    [/^Archive Tutorial: (.+)$/, "아카이브 튜토리얼: $1"],
    [/^Battle Tutorial: (.+)$/, "전투 튜토리얼: $1"],
    [/^(\d+) Victory$/, "$1승"],
    [/^(\d+) Victories$/, "$1승"],
    [/^(.+) defeated!$/, (_text, name) => `${t(name)} 격파!`],
    [/^Defeated by (.+)! (.+) second cooldown\.$/, (_text, name, cooldown) => `${t(name)}에게 패배했습니다! ${cooldown}초 쿨다운.`],
    [/^\+(.+) Max Victories$/, (_text, count) => `최대 승리 +${count}`],
    [/^승리 \+(.+) Max$/, (_text, count) => `최대 승리 +${count}`],
    [/^\+(.+) Victories$/, (_text, count) => `승리 +${count}`],
    [/^\+(.+) Victories \((.+)\)$/, (_text, count, kind) => `승리 +${count} (${t(kind)})`],
    [/^Encountered: (.+)$/, (_text, name) => `조우: ${t(name)}`],
    [/^새로운 스케치 조우: (.+)$/, (_text, name) => `새 스케치 조우: ${t(name)}`],
    [/^새 스케치 조우: (.+)$/, (_text, name) => `새 스케치 조우: ${t(name)}`],
    [/^Unscrambled: (.+)$/, (_text, name) => `해독됨: ${t(name)}`],
    [/^New version unlocked: (.+)!$/, (_text, name) => `새 버전 해금: ${t(name)}!`],
    [/^새로운 버전 해금: (.+)!$/, (_text, name) => `새 버전 해금: ${t(name)}!`],
    [/^새 버전 해금: (.+)!$/, (_text, name) => `새 버전 해금: ${t(name)}!`],
    [/^New Glossary Entry: (.+) Glossary Multiplier \+(.+) \(New: (.+)x\)$/, (_text, name, amount, value) => `새 용어집 항목: ${t(name)}\n용어집 배율 +${amount} (새 값: ${value}배)`],
    [/^New Glossary Entry: (.+)$/, (_text, name) => `새 용어집 항목: ${t(name)}`],
    [/^Glossary Multiplier \+(.+) \(New: (.+)x\)$/, (_text, amount, value) => `용어집 배율 +${amount} (새 값: ${value}배)`],
    [/^Feat Medal Purchased! Feat Mult \+(.+) \(Now: (.+)x\)$/, (_text, amount, value) => `업적 메달 구매 완료!\n업적 배율 +${amount} (현재: ${value}배)`],
    [/^Feat Medal Purchased!$/, "업적 메달 구매 완료!"],
    [/^Feat Mult \+(.+) \(Now: (.+)x\)$/, (_text, amount, value) => `업적 배율 +${amount} (현재: ${value}배)`],
    [/^Feat Achieved: (.+)!$/, (_text, name) => `업적 달성: ${t(name)}!`],
    [/^New skill unlocked: (.+)$/, (_text, name) => `새 스킬 해금: ${t(name)}`],
    [/^New skills unlocked: (.+)$/, (_text, list) => `새 스킬 해금: ${list.split(", ").map(t).join(", ")}`],
    [/^(.+) upgraded \+(.+) levels!$/, (_text, name, levels) => `${t(name)} +${levels}레벨 강화!`],
    [/^(.+) upgraded \+(.+) level!$/, (_text, name, levels) => `${t(name)} +${levels}레벨 강화!`],
    [/^Conceptual Milestone for (.+) ready\. Congrats on reaching a new one!$/, (_text, currency) => `${t(currency)} 착상 마일스톤이 준비되었습니다. 새 마일스톤 도달을 축하합니다!`],
    [/^(.+) 개념 마일스톤이 준비되었습니다\. 새로운 단계 달성을 축하합니다!$/, (_text, currency) => `${t(currency)} 착상 마일스톤이 준비되었습니다. 새 마일스톤 도달을 축하합니다!`],
    [/^Autosynthesized Milestone for (.+)\.$/, (_text, currency) => `${t(currency)} 마일스톤을 자동 합성했습니다.`],
    [/^(.+) is affordable!$/, (_text, name) => `${t(name)} 구매 가능!`],
    [/^지금 (.+)을\(를\) 구매할 수 있습니다!$/, (_text, name) => `${t(name)} 구매 가능!`],
    [/^(.+) toggled (ON|OFF)\. (.+) guaranteed: (.+)$/, (_text, name, state, rarity, count) => `${t(name)} ${state === "ON" ? "켜짐" : "꺼짐"}. ${t(rarity)} 확정: ${count}`],
    [/^ADD CUSTOM SKETCH Adds a configurable Custom Challenge sketch to the Gallery\.$/, "커스텀 스케치 추가\n갤러리에 설정 가능한 커스텀 도전 스케치를 추가합니다."],
    [/^ADD DEV TOOLS Enables the developer dashboard in the header\. \(Requires Password\)$/, "개발 도구 추가\n헤더에 개발자 대시보드를 활성화합니다. (비밀번호 필요)"],
  ], "notifications");
})(typeof globalThis !== "undefined" ? globalThis : window);
