(function initRejectedDraftGameplayPatternsPatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^Requires defeating (.+)$/, (_text, name) => `${t(name)} 격파 필요`],
    [/^Unlock required defeating (.+)$/, (_text, name) => `해금하려면 ${t(name)} 격파 필요`],
    [/^(.+) appeared in (.+) redraws$/, (_text, name, count) => `${t(name)} 등장 횟수: 다시 그리기 ${count}회`],
    [/^Total (.+) used this playthrough\.$/, (_text, name) => `이번 플레이에서 사용한 ${t(name)} 총량.`],
    [/^Filter by sketches rewarding (.+)\.$/, (_text, currency) => `${t(currency)}를 보상하는 스케치로 필터링합니다.`],
    [/^Produces (.+) Concept$/, (_text, currency) => `${t(currency)} 착상 생산`],
    [/^Player stack cap: (.+)$/, "플레이어 중첩 상한: $1"],
    [/^(.+) Visibility$/, (_text, rarity) => `${t(rarity)} 표시 여부`],
    [/^(.+) rarity sketches\.$/, (_text, rarity) => `${t(rarity)} 등급 스케치.`],
    [/^\+([\d.]+%) (.+)$/, (_text, amount, stat) => `${t(stat)} +${amount}`],
    [/^\+([\d.]+) (.+)$/, (_text, amount, stat) => `${t(stat)} +${amount}`]
  ], "gameplay-patterns");
})(typeof globalThis !== "undefined" ? globalThis : window);
