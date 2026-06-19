(function initRejectedDraftRewardsRequirementsPatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^(.+) victories boost (.+) Concept$/, (_text, rarity, currency) => `${t(rarity)} 승리가 ${t(currency)} 착상을 강화합니다.`],
    [/^(\d+)x (.+) generator$/, (_text, amount, currency) => `${t(currency)} 생성기 ${amount}배`],
    [/^(.+) Generator$/, (_text, currency) => `${t(currency)} 생성기`],
    [/^(.+) Discount$/, (_text, currency) => `${t(currency)} 할인`],
    [/^(.+) Refinement$/, (_text, currency) => `${t(currency)} 정제`],
    [/^Bonus (.+) percentage\.$/, (_text, stat) => `추가 ${t(stat)} 비율.`],
    [/^(.+) Increase$/, (_text, stat) => `${t(stat)} 증가`],
    [/^(.+) Concept$/, (_text, currency) => `${t(currency)} 착상`],
    [/^(.+) Overclock$/, (_text, currency) => `${t(currency)} 오버클럭`],
    [/^(.+) Exponent$/, (_text, currency) => `${t(currency)} 지수`],
    [/^(.+) Reward$/, (_text, currency) => `${t(currency)} 보상`],
    [/^(.+) Cost$/, (_text, currency) => `${t(currency)} 비용`],
    [/^(.+) Rarity$/, (_text, rarity) => `${t(rarity)} 희귀도`],
    [/^(.+) Expansion$/, (_text, rarity) => `${t(rarity)} 확장`],
    [/^Multiplier for passive (.+) generation\.$/, (_text, currency) => `패시브 ${t(currency)} 생성 배율.`],
    [/^(.+) reward multiplier from defeating sketches\.$/, (_text, currency) => `스케치 격파로 얻는 ${t(currency)} 보상 배율.`],
    [/^(.+) cost reduction\. Applies to both Tools and Stat Upgrades\.$/, (_text, currency) => `${t(currency)} 비용 감소. 도구와 능력치 업그레이드 모두에 적용됩니다.`],
    [/^Multiplier for (.+) Concept production in the Conceptual Synthesizer\.$/, (_text, currency) => `착상 합성기의 ${t(currency)} 착상 생산 배율.`],
    [/^Concepts are the physical manifestation of your artistic progress\. They are gained by reaching milestones with total earned (.+) throughout this run\.$/, (_text, currency) => `착상은 예술적 진행이 형태를 얻은 결과입니다. 이번 실행 동안 총 ${t(currency)} 획득량 마일스톤에 도달하면 얻습니다.`],
    [/^Milestones: 1 start production \| 2,3,4 = (.+)x \| 5,6,7 = (.+)x \| 8,9,10 = (.+)x \| 11 = (.+)x$/, (_text, m2, m5, m8, m11) => `마일스톤: 1 생산 시작 | 2,3,4 = ${m2}배 | 5,6,7 = ${m5}배 | 8,9,10 = ${m8}배 | 11 = ${m11}배`],
    [/^Multiplicatively increased by Feat Medal Base \(x(.+)\) per medal\. Multiplies all currency rewards\.$/i, (_text, value) => `메달을 하나 살 때마다 업적 메달 기준값(x${value})만큼 곱연산으로 증가합니다. 모든 재화 보상에 적용됩니다.`],
    [/^(.+) rewards exp\. Raises (.+) rewards to an exponential power\. Applies after (.+) Reward multiplier\. Formula: Reward \^ \(1 \+ \(Level\/100\)\) \+(.+)$/, (_text, titleCurrency, bodyCurrency, multiplierCurrency, bonus) => `${t(titleCurrency)} 보상 지수\n${t(bodyCurrency)} 보상에 지수 보정을 적용합니다. ${t(multiplierCurrency)} 보상 배율 이후 적용됩니다. 공식: 보상 ^ (1 + (레벨/100)) +${bonus}`],
    [/^Raises (.+) rewards to an exponential power\. Applies after (.+) Reward multiplier\. Formula: Reward \^ \(1 \+ \(Level\/100\)\)$/, (_text, currency) => `${t(currency)} 보상을 지수로 증가시킵니다. ${t(currency)} 보상 배율 이후 적용됩니다. 공식: 보상 ^ (1 + (레벨/100))`],
    [/^Chance for (.+) rarity sketches to appear on Redraw\.$/, (_text, rarity) => `다시 그리기에서 ${t(rarity)} 등급 스케치가 등장할 확률.`],
    [/^Sets the maximum capacity of specific (.+) sketches you can explicitly guarantee in the Glossary\.$/, (_text, rarity) => `용어집에서 명시적으로 확정할 수 있는 특정 ${t(rarity)} 스케치의 최대 수를 설정합니다.`],
  ], "rewards-requirements");
})(typeof globalThis !== "undefined" ? globalThis : window);
