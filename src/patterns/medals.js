(function initRejectedDraftMedalTasksPatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^Defeat every (.+) rarity sketch\.$/, (_text, rarity) => `모든 ${t(rarity)} 등급 스케치를 격파하세요.`],
    [/^Defeat every standard (.+) rarity sketch\.$/, (_text, rarity) => `모든 표준 ${t(rarity)} 등급 스케치를 격파하세요.`],
    [/^Defeat half of the (.+) rarity sketches\.$/, (_text, rarity) => `${t(rarity)} 등급 스케치의 절반을 격파하세요.`],
    [/^Defeat a quarter of the (.+) rarity sketches\.$/, (_text, rarity) => `${t(rarity)} 등급 스케치의 4분의 1을 격파하세요.`],
    [/^Reach (.+) Redraws across your journey\.$/, (_text, count) => `여정 전체에서 다시 그리기 ${count}회에 도달하세요.`],
    [/^Reach (.+) victories against (.+) sketches.*$/, (_text, count, rarity) => `${t(rarity)} 스케치를 상대로 ${count}승에 도달하세요.`],
    [/^Roll (.+) (.+) Sketches in a single Redraw\.$/, (_text, count, rarity) => `한 번의 다시 그리기에서 ${t(rarity)} 스케치 ${count}개를 뽑으세요.`],
    [/^Flee (.+) battles across all redraws\.$/, (_text, count) => `모든 다시 그리기에서 전투 ${count}회 도망치세요.`],
    [/^Reach (.+) or greater (.+) \((.+)\)\.$/, (_text, amount, stat, code) => `${t(stat)} (${code})을 ${amount} 이상 달성하세요.`],
    [/^Arrange (.+) contiguously in the Gallery\.$/, (_text, names) => `갤러리에서 ${names}를 연속으로 배치하세요.`],
    [/^Open the (.+) modal for (.+) different sketches\.$/, (_text, modal, count) => `서로 다른 스케치 ${count}개의 ${t(modal)} 모달을 여세요.`],
    [/^Click any (.+) artist credit link\.$/, (_text, artist) => `${artist} 아티스트 크레딧 링크를 아무거나 클릭하세요.`],
    [/^Fully defeat the (.+) Dummy\.$/, (_text, name) => `${t(name)} 더미를 완전히 격파하세요.`],
    [/^Lose (.+) battles across all redraws\.$/, (_text, count) => `모든 다시 그리기에서 전투 ${count}회 패배하세요.`],
    [/^Trigger the pre-battle (.+) (.+) times\.$/, (_text, action, count) => `전투 전 ${t(action)}을 ${count}회 발동하세요.`],
    [/^Unlock the fourth (.+) alternate version\.$/, (_text, name) => `${name}의 네 번째 대체 버전을 해금하세요.`],
    [/^Have all (.+) Active Protocols unlocked but disabled simultaneously\.$/, (_text, count) => `활성 프로토콜 ${count}개를 모두 해금했지만 동시에 비활성화하세요.`],
    [/^Earn (.+) extra victories from a single overkill hit\.$/, (_text, count) => `단일 오버킬 타격으로 추가 승리 ${count}회를 얻으세요.`],
    [/^Stack (.+) (.+) on yourself\.$/, (_text, count, effect) => `자신에게 ${t(effect)}을 ${count}개 중첩하세요.`],
    [/^Perform a Redraw with (.+) total victories\.$/, (_text, count) => `총 승리 ${count}회 상태로 다시 그리기를 수행하세요.`],
    [/^Reach (.+) victories in a single redraw with zero deaths\.$/, (_text, count) => `한 번의 다시 그리기에서 사망 없이 ${count}승에 도달하세요.`],
    [/^Use the (.+) (.+) times\.$/, (_text, tool, count) => `${t(tool)}를 ${count}회 사용하세요.`],
    [/^Use (.+) (.+) times\.$/, (_text, tool, count) => `${t(tool)}를 ${count}회 사용하세요.`],
    [/^Unlock (.+) Tools in a single redraw\.$/, (_text, count) => `한 번의 다시 그리기에서 도구 ${count}개를 해금하세요.`],
    [/^Have at least (.+) (.+) stacks on yourself at one time\.$/, (_text, count, effect) => `한 번에 자신에게 ${t(effect)} 중첩을 최소 ${count}개 보유하세요.`],
    [/^Apply a total of (.+) (.+) stacks\.$/, (_text, count, effect) => `${t(effect)} 중첩을 총 ${count}개 적용하세요.`],
  ], "medal-tasks");
})(typeof globalThis !== "undefined" ? globalThis : window);
