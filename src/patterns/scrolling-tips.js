(function initRejectedDraftScrollingTipsPatterns(globalScope) {
  const registry = globalScope.RejectedDraftKoRegistry;
  const { formatCompactNumber, t } = registry;
  const scrollingTipContext = registry.scrollingTipContext();
  const scrollingTipLabels = scrollingTipContext.labels;
  const scrollingTipTranslations = scrollingTipContext.translations;
  const scrollingTipPattern = scrollingTipContext.pattern;
  registry.registerPatterns([
    [/^(TIP|팁) (#.+): Top right icon on each sketch on Gallery page can hide sketches that are of no use to you\.$/, (_text, _label, id) => `팁 ${id}: 갤러리 페이지에서 각 스케치 오른쪽 위 아이콘을 누르면 쓸모없는 스케치를 숨길 수 있습니다.`],
    [/^(TIP|팁) (#.+): You can review the Tutorial anytime in Settings\.$/, (_text, _label, id) => `팁 ${id}: 튜토리얼은 설정에서 언제든 다시 볼 수 있습니다.`],
    [/^(CRITIQUE|비평) (#.+): I hope you're not playing this at work\. Or do\. I'm not HR\.$/, (_text, _label, id) => `비평 ${id}: 직장에서 이 게임을 하고 있지 않길 바랍니다. 뭐, 해도 됩니다. 저는 HR이 아니니까요.`],
    [/^(JOKE|농담) (#.+): The painter was hospitalized\. Doctors say he had too many strokes\.$/, (_text, _label, id) => `농담 ${id}: 화가가 입원했습니다. 의사 말로는 붓질이 너무 많았다네요.`],
    [/^(JOKE|농담) (#.+): Shout out to people who don't know what the opposite of 'in' is\.$/, (_text, _label, id) => `농담 ${id}: 'in'의 반대말을 모르는 분들께 한마디. out!`],
    [/^(FACT|사실) (#.+): The average person spends 6 months of their life waiting for red lights to turn green\.$/, (_text, _label, id) => `사실 ${id}: 평균적인 사람은 평생 6개월을 빨간불이 초록불로 바뀌길 기다리며 보냅니다.`],
    [/^(FACT|사실) (#.+): John Steinbeck used up to 60 pencils a day\. He would have loved auto-battle\.$/, (_text, _label, id) => `사실 ${id}: John Steinbeck은 하루에 연필을 최대 60자루까지 썼습니다. 자동 전투를 꽤 좋아했을 겁니다.`],
    [/^(FACT|사실) (#.+): Archaeologists have found edible honey in ancient Egyptian tombs\. It never spoils\.$/, (_text, _label, id) => `사실 ${id}: 고고학자들은 고대 이집트 무덤에서 아직 먹을 수 있는 꿀을 발견했습니다. 꿀은 상하지 않습니다.`],
    [/^(LPT|생활 팁) (#.+): Fix your posture\. Your future back will thank you\.$/, (_text, _label, id) => `생활 팁 ${id}: 자세를 바로잡으세요. 미래의 허리가 고마워할 겁니다.`],
    [/^(TIP|팁) (#.+): After unlocking Portfolio Review tool, it may be worthwhile to unhide all sketches and squeeze them for more\.$/, (_text, _label, id) => `팁 ${id}: 스케치 순회 도구를 해금했다면 숨겨 둔 스케치를 모두 다시 표시해서 보상을 더 챙겨 볼 만합니다.`],
    [/^(TIP|팁) (#.+): The "locks" at top of sidebars make them retractable\.$/, (_text, _label, id) => `팁 ${id}: 사이드바 상단의 "잠금"을 누르면 접어 둘 수 있습니다.`],
    [/^(TIP|팁) (#.+): Fleeing isn't just for escaping; use it to quickly rotate through sketches searching for specific rewards\.$/, (_text, _label, id) => `팁 ${id}: 도망은 탈출용만이 아닙니다. 원하는 보상을 찾을 때 스케치를 빠르게 돌려 보는 데도 쓰세요.`],
    [/^(TIP|팁) (#.+): Statuses like Poison are effective against tanky sketches\.$/, (_text, _label, id) => `팁 ${id}: ${t("Poison")} 같은 상태 효과는 튼튼한 스케치에게 효과적입니다.`],
    [/^(LPT|생활 팁) (#.+): Floss your teeth\. You only need to floss the ones you want to keep\.$/, (_text, _label, id) => `생활 팁 ${id}: 치실을 쓰세요. 계속 쓰고 싶은 치아에만 쓰면 됩니다.`],
    [/^(FACT|사실) (#.+): The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion\.$/, (_text, _label, id) => `사실 ${id}: 에펠탑은 열팽창 때문에 여름에 최대 15cm 더 높아질 수 있습니다.`],
    [/^(CRITIQUE|비평) (#.+): A redraw is just a fancy word for professional procrastination\.$/, (_text, _label, id) => `비평 ${id}: 다시 그리기는 전문적인 미루기를 그럴듯하게 부르는 말일 뿐입니다.`],
    [/^(LPT|생활 팁) (#.+): Rotate your wrists\. Draw the alphabet with your nose to relax your neck\.$/, (_text, _label, id) => `생활 팁 ${id}: 손목을 돌려 주세요. 목을 풀려면 코로 알파벳을 그려 보세요.`],
    [/^(LPT|생활 팁) (#.+): Stretch your wrists\. Carpal tunnel is the real end-game boss\.$/, (_text, _label, id) => `생활 팁 ${id}: 손목을 스트레칭하세요. 손목터널증후군이 진짜 엔드게임 보스입니다.`],
    [/^(FACT|사실) (#.+): The first pencils were made of solid graphite wrapped in sheepskin\.$/, (_text, _label, id) => `사실 ${id}: 최초의 연필은 양가죽으로 감싼 고체 흑연으로 만들어졌습니다.`],
    [/^(JOKE|농담) (#.+): I tried to paint the sky, but I blue it\.$/, (_text, _label, id) => `농담 ${id}: 하늘을 칠하려 했는데, 파랗게 질려 버렸습니다.`],
    [/^(TIP|팁) (#.+): There are other flavors for this text \(see settings\): Snarky Comments \(Critiques\), Life Pro Tips \(LPT\), Jokes, and Facts\.$/, (_text, _label, id) => `팁 ${id}: 이 문구에는 다른 종류도 있습니다(설정에서 확인): 빈정거리는 코멘트(비평), 생활 팁(LPT), 농담, 사실.`],
    [scrollingTipPattern, (_text, label, id, body) => `${scrollingTipLabels[label] || label} ${id}: ${scrollingTipTranslations[body]}`],
    [/^TIP (#.+)$/, "팁 $1"],
    [/^FACT (#.+)$/, "사실 $1"],
    [/^CRITIQUE (#.+)$/, "비평 $1"],
    [/^JOKE (#.+)$/, "농담 $1"],
    [/^LPT (#.+)$/, "생활 팁 $1"],
    [/^(팁|사실|비평|농담|생활 팁) (#.+): (.+)$/, (text) => text],
  ], "scrolling-tips");
})(typeof globalThis !== "undefined" ? globalThis : window);
