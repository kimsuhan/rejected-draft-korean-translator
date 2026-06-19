(function initRejectedDraftNumbersTimePatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^([\d,.]+)([KMBT])$/, (_text, amount, suffix) => formatCompactNumber(amount, suffix)],
    [/^[\d,.]+(?:e[+-]?\d+|Sp|Qa|Qi)$/i, (text) => text],
    [/^(\d+)d (\d+)h$/, (_text, days, hours) => `${days}일 ${hours}시간`],
    [/^(\d+)h (\d+)m$/, (_text, hours, minutes) => `${hours}시간 ${minutes}분`],
    [/^(\d+)m ([\d.]+)s$/, (_text, minutes, seconds) => `${minutes}분 ${seconds}초`],
    [/^(\d+)d$/, "$1일"],
    [/^(\d+)h$/, "$1시간"],
    [/^(\d+)m$/, "$1분"],
    [/^([\d.]+)s$/, "$1초"],
    [/^Control Panel$/, "컨트롤 패널"],
    [/^Zoom In$/, "확대"],
    [/^Zoom Out$/, "축소"],
    [/^Fit View$/, "화면에 맞춤"],
    [/^Press enter or space to select a node\. You can then use the arrow keys to move the node around\. Press delete to remove it and escape to cancel\.$/, "Enter 또는 Space로 노드를 선택하세요. 이후 방향키로 노드를 이동할 수 있습니다. Delete로 제거하고 Esc로 취소합니다."],
    [/^Press enter or space to select an edge\. You can then press delete to remove it or escape to cancel\.$/, "Enter 또는 Space로 연결선을 선택하세요. 이후 Delete로 제거하거나 Esc로 취소합니다."],
    [/^Edge from (.+) to (.+)$/, (_text, from, to) => `연결: ${from} -> ${to}`],
    [/^(\d+) MAXED$/, "$1 최대"],
    [/^Until Max \((.+)\):$/, "최대까지 ($1):"],
  ], "numbers-time");
})(typeof globalThis !== "undefined" ? globalThis : window);
