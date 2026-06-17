const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createTranslator,
  normalizeText,
} = require("../src/translator-core.js");

class TextNode {
  constructor(value) {
    this.nodeType = 3;
    this.nodeValue = value;
    this.parentElement = null;
  }
}

class ElementNode {
  constructor(tagName, attrs = {}, children = []) {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.attrs = { ...attrs };
    this.childNodes = [];
    for (const child of children) this.append(child);
  }

  append(child) {
    child.parentElement = this;
    this.childNodes.push(child);
    this._observer?.([{ type: "childList", addedNodes: [child] }]);
  }

  get textContent() {
    return this.childNodes.map((child) => child.nodeValue ?? child.textContent).join("");
  }

  set textContent(value) {
    this.childNodes = [new TextNode(value)];
    this.childNodes[0].parentElement = this;
  }

  getAttribute(name) {
    return this.attrs[name] ?? null;
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  querySelector(tagName) {
    const wanted = tagName.toUpperCase();
    const stack = [...this.childNodes];
    while (stack.length) {
      const node = stack.shift();
      if (node.nodeType === 1 && node.tagName === wanted) return node;
      if (node.childNodes) stack.push(...node.childNodes);
    }
    return null;
  }
}

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(root) {
    root._observer = this.callback;
  }

  disconnect() {}
}

test("normalizeText collapses whitespace without changing single words", () => {
  assert.equal(normalizeText("  Current   Specs\n"), "Current Specs");
  assert.equal(normalizeText("Battle"), "Battle");
});

test("translateTree replaces exact text nodes and supported attributes", () => {
  const root = new ElementNode("main", {}, [
    new ElementNode("button", { "aria-label": "No battle in progress" }, [new TextNode("Battle")]),
    new ElementNode("img", { alt: "Stick Man" }),
    new ElementNode("p", {}, [new TextNode("Art is pain. Inflict it and reclaim your glory.")]),
    new ElementNode("span", {}, [new TextNode("123")]),
  ]);
  const translator = createTranslator({
    "Battle": "전투",
    "No battle in progress": "진행 중인 전투 없음",
    "Stick Man": "졸라맨",
    "Art is pain. Inflict it and reclaim your glory.": "예술은 고통이다. 고통을 주고 영광을 되찾아라.",
  });

  const result = translator.translateTree(root);

  assert.equal(root.querySelector("button").textContent, "전투");
  assert.equal(root.querySelector("button").getAttribute("aria-label"), "진행 중인 전투 없음");
  assert.equal(root.querySelector("img").getAttribute("alt"), "졸라맨");
  assert.equal(root.querySelector("p").textContent, "예술은 고통이다. 고통을 주고 영광을 되찾아라.");
  assert.equal(root.querySelector("span").textContent, "123");
  assert.equal(result.translated, 4);
});

test("observe translates newly added text nodes", async () => {
  const root = new ElementNode("main");
  const translator = createTranslator({ Challenge: "도전" });
  const disconnect = translator.observe(root, FakeMutationObserver);

  const button = new ElementNode("button", {}, [new TextNode("Challenge")]);
  root.append(button);
  await new Promise((resolve) => queueMicrotask(resolve));

  assert.equal(button.textContent, "도전");
  disconnect();
});

test("translateTree reports missing English phrases for dictionary growth", () => {
  const root = new ElementNode("main", {}, [
    new ElementNode("button", {}, [new TextNode("Gallery")]),
    new ElementNode("p", {}, [new TextNode("Unknown phrase")]),
  ]);
  const missing = [];
  const translator = createTranslator(
    { Gallery: "갤러리" },
    { onMissingText: (text) => missing.push(text) },
  );

  translator.translateTree(root);

  assert.deepEqual(missing, ["Unknown phrase"]);
});

test("translateTree supports pattern translations for changing numeric text", () => {
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Gallery Tutorial: 1 / 3")]),
    new ElementNode("p", {}, [new TextNode("1 Victory")]),
    new ElementNode("p", {}, [new TextNode("TIP #80,441: Stacking Freeze above 100% turns enemy healing into damage.")]),
  ]);
  const translator = createTranslator(
    {},
    {
      patterns: [
        [/^Gallery Tutorial: (.+)$/, "갤러리 튜토리얼: $1"],
        [/^(\d+) Victory$/, "$1승"],
        [/^TIP (#.+)$/, "팁 $1"],
      ],
    },
  );

  const result = translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "갤러리 튜토리얼: 1 / 3");
  assert.equal(root.childNodes[1].textContent, "1승");
  assert.equal(root.childNodes[2].textContent, "팁 #80,441: Stacking Freeze above 100% turns enemy healing into damage.");
  assert.equal(result.translated, 3);
});

test("translateTree supports function pattern replacements", () => {
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Chance to apply Bleed.")]),
    new ElementNode("p", {}, [new TextNode("+1% Bleed Chance per level")]),
  ]);
  const terms = { Bleed: "출혈", "Bleed Chance": "출혈 확률" };
  const translator = createTranslator(
    {},
    {
      patterns: [
        [/^Chance to apply (.+)\.$/, (_text, effect) => `${terms[effect] || effect} 적용 확률.`],
        [/^\+([\d.]+%) (.+) per level$/, (_text, amount, stat) => `레벨당 ${terms[stat] || stat} +${amount}`],
      ],
    },
  );

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "출혈 적용 확률.");
  assert.equal(root.childNodes[1].textContent, "레벨당 출혈 확률 +1%");
});

test("extension patterns cover common locale-derived progression text", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Bonus Armor percentage.")]),
    new ElementNode("p", {}, [new TextNode("Acrylic Reward")]),
    new ElementNode("p", {}, [new TextNode("Defeat every Rough rarity sketch.")]),
    new ElementNode("p", {}, [new TextNode("Reach 100 Redraws across your journey.")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "추가 방어력 비율.");
  assert.equal(root.childNodes[1].textContent, "아크릴 보상");
  assert.equal(root.childNodes[2].textContent, "모든 러프 희귀도 스케치를 격파하세요.");
  assert.equal(root.childNodes[3].textContent, "여정 전체에서 다시 그리기 100회에 도달하세요.");
});

test("extension patterns cover recent tip bodies", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("TIP #18,255: Top right icon on each sketch on Gallery page can hide sketches that are of no use to you.")]),
    new ElementNode("p", {}, [new TextNode("CRITIQUE #17,801: I hope you're not playing this at work. Or do. I'm not HR.")]),
    new ElementNode("p", {}, [new TextNode("FACT #12,010: The average person spends 6 months of their life waiting for red lights to turn green.")]),
    new ElementNode("p", {}, [new TextNode("FACT #92,115: John Steinbeck used up to 60 pencils a day. He would have loved auto-battle.")]),
    new ElementNode("p", {}, [new TextNode("LPT #56,331: Fix your posture. Your future back will thank you.")]),
    new ElementNode("p", {}, [new TextNode("TIP #84,146: After unlocking Portfolio Review tool, it may be worthwhile to unhide all sketches and squeeze them for more.")]),
    new ElementNode("p", {}, [new TextNode("LPT #14,203: Floss your teeth. You only need to floss the ones you want to keep.")]),
    new ElementNode("p", {}, [new TextNode("FACT #15,102: The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.")]),
    new ElementNode("p", {}, [new TextNode("CRITIQUE #24,928: A redraw is just a fancy word for professional procrastination.")]),
    new ElementNode("p", {}, [new TextNode("LPT #74,103: Rotate your wrists. Draw the alphabet with your nose to relax your neck.")]),
    new ElementNode("p", {}, [new TextNode("LPT #94,113: Stretch your wrists. Carpal tunnel is the real end-game boss.")]),
    new ElementNode("p", {}, [new TextNode("FACT #29,103: The first pencils were made of solid graphite wrapped in sheepskin.")]),
    new ElementNode("p", {}, [new TextNode("JOKE #22,105: I tried to paint the sky, but I blue it.")]),
    new ElementNode("p", {}, [new TextNode("TIP #99,999: There are other flavors for this text (see settings): Snarky Comments (Critiques), Life Pro Tips (LPT), Jokes, and Facts.")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "팁 #18,255: 갤러리 페이지에서 각 스케치 오른쪽 위 아이콘을 누르면 쓸모없는 스케치를 숨길 수 있습니다.");
  assert.equal(root.childNodes[1].textContent, "비평 #17,801: 직장에서 이 게임을 하고 있지 않길 바랍니다. 뭐, 해도 됩니다. 저는 HR이 아니니까요.");
  assert.equal(root.childNodes[2].textContent, "사실 #12,010: 평균적인 사람은 평생 6개월을 빨간불이 초록불로 바뀌길 기다리며 보냅니다.");
  assert.equal(root.childNodes[3].textContent, "사실 #92,115: John Steinbeck은 하루에 연필을 최대 60자루까지 썼습니다. 자동 전투를 꽤 좋아했을 겁니다.");
  assert.equal(root.childNodes[4].textContent, "생활 팁 #56,331: 자세를 바로잡으세요. 미래의 허리가 고마워할 겁니다.");
  assert.equal(root.childNodes[5].textContent, "팁 #84,146: 포트폴리오 검토 도구를 해금했다면 숨겨 둔 스케치를 모두 다시 표시해서 보상을 더 챙겨 볼 만합니다.");
  assert.equal(root.childNodes[6].textContent, "생활 팁 #14,203: 치실을 쓰세요. 계속 쓰고 싶은 치아에만 쓰면 됩니다.");
  assert.equal(root.childNodes[7].textContent, "사실 #15,102: 에펠탑은 열팽창 때문에 여름에 최대 15cm 더 높아질 수 있습니다.");
  assert.equal(root.childNodes[8].textContent, "비평 #24,928: 다시 그리기는 전문적인 미루기를 그럴듯하게 부르는 말일 뿐입니다.");
  assert.equal(root.childNodes[9].textContent, "생활 팁 #74,103: 손목을 돌려 주세요. 목을 풀려면 코로 알파벳을 그려 보세요.");
  assert.equal(root.childNodes[10].textContent, "생활 팁 #94,113: 손목을 스트레칭하세요. 손목터널증후군이 진짜 엔드게임 보스입니다.");
  assert.equal(root.childNodes[11].textContent, "사실 #29,103: 최초의 연필은 양가죽으로 감싼 고체 흑연으로 만들어졌습니다.");
  assert.equal(root.childNodes[12].textContent, "농담 #22,105: 하늘을 칠하려 했는데, 파랗게 질려 버렸습니다.");
  assert.equal(root.childNodes[13].textContent, "팁 #99,999: 이 문구에는 다른 종류도 있습니다(설정에서 확인): 빈정거리는 코멘트(비평), 생활 팁(LPT), 농담, 사실.");
});

test("extension patterns cover common medal task text", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Roll 15 Masterpiece Sketches in a single Redraw.")]),
    new ElementNode("p", {}, [new TextNode("Flee 250 battles across all redraws.")]),
    new ElementNode("p", {}, [new TextNode("Reach 15% or greater Accuracy (ACC).")]),
    new ElementNode("p", {}, [new TextNode("Arrange Stick Man, Stick Knight, and Stick Ribs contiguously in the Gallery.")]),
    new ElementNode("p", {}, [new TextNode("MULTIPLICATIVELY INCREASED BY FEAT MEDAL BASE (X1.01) PER MEDAL. MULTIPLIES ALL CURRENCY REWARDS.")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "한 번의 다시 그리기에서 걸작 스케치 15개를 뽑으세요.");
  assert.equal(root.childNodes[1].textContent, "모든 다시 그리기에서 전투 250회 도망치세요.");
  assert.equal(root.childNodes[2].textContent, "명중 (ACC)을 15% 이상 달성하세요.");
  assert.equal(root.childNodes[3].textContent, "갤러리에서 Stick Man, Stick Knight, and Stick Ribs를 연속으로 배치하세요.");
  assert.equal(root.childNodes[4].textContent, "메달을 하나 살 때마다 업적 메달 기준값(x1.01)만큼 곱연산으로 증가합니다. 모든 재화 보상에 적용됩니다.");
});

test("extension patterns cover common skill-tree numeric descriptions", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("+0.333% Framed chance")]),
    new ElementNode("p", {}, [new TextNode("+1 Guaranteed Rough Sketch")]),
    new ElementNode("p", {}, [new TextNode("Unscrambled Opus sketches can be Guaranteed for 2 slots")]),
    new ElementNode("p", {}, [new TextNode("-5% Graphite cost")]),
    new ElementNode("p", {}, [new TextNode("+10% Ink rewards")]),
    new ElementNode("p", {}, [new TextNode("+0.01 Ink rewards exp.")]),
    new ElementNode("p", {}, [new TextNode("-2% Attack Delay")]),
    new ElementNode("p", {}, [new TextNode("+25 Inspiration Stack Cap")]),
    new ElementNode("p", {}, [new TextNode("100% multiplier")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "프레임 확률 +0.333%");
  assert.equal(root.childNodes[1].textContent, "확정 러프 스케치 +1");
  assert.equal(root.childNodes[2].textContent, "해독된 오푸스 스케치는 슬롯 2개로 확정할 수 있습니다.");
  assert.equal(root.childNodes[3].textContent, "흑연 비용 -5%");
  assert.equal(root.childNodes[4].textContent, "잉크 보상 +10%");
  assert.equal(root.childNodes[5].textContent, "잉크 보상 지수 +0.01");
  assert.equal(root.childNodes[6].textContent, "공격 지연 -2%");
  assert.equal(root.childNodes[7].textContent, "영감 중첩 상한 +25");
  assert.equal(root.childNodes[8].textContent, "100% 배율");
});

test("extension patterns cover redraw and concept synthesizer dynamic text", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/misc-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("First Ever Softcap in: ∞")]),
    new ElementNode("p", {}, [new TextNode("REQUIRES 100 PENDING QUINTESSENCE")]),
    new ElementNode("p", {}, [new TextNode("Concepts are the physical manifestation of your artistic progress. They are gained by reaching milestones with total earned Wax throughout this run.")]),
    new ElementNode("p", {}, [new TextNode("Milestones: 1 start production | 2,3,4 = 1000x | 5,6,7 = 1Mx | 8,9,10 = 1Bx | 11 = 1Tx")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "첫 소프트캡까지: ∞");
  assert.equal(root.childNodes[1].textContent, "대기 중인 정수 100 필요");
  assert.equal(root.childNodes[2].textContent, "개념은 예술적 진행이 물리적으로 드러난 결과입니다. 이번 실행 동안 총 왁스 획득량 마일스톤에 도달하면 얻습니다.");
  assert.equal(root.childNodes[3].textContent, "마일스톤: 1 생산 시작 | 2,3,4 = 1000배 | 5,6,7 = 1M배 | 8,9,10 = 1B배 | 11 = 1T배");
});

test("extension dictionary covers tutorial and story text", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("h2", {}, [new TextNode("The Archive")]),
    new ElementNode("p", {}, [new TextNode("Archive is where you reflect on your progress and unlock global improvements.")]),
    new ElementNode("h2", {}, [new TextNode("Digital Canvas")]),
    new ElementNode("p", {}, [new TextNode("Progress further to reveal this part of your journey.")]),
    new ElementNode("p", {}, [new TextNode("You've hit your first softcap! Pending Quintessence starts slowing down once it passes your Lifetime Quintessence, or 1000 before you have any Lifetime Quintessence. Each time your pending amount doubles past that threshold, Quintessence production is halved again.\n\nThat sounds worse than it is. It is a soft cap, not a wall: you can still push through it, and Redrawing raises your Lifetime Quintessence so the next slowdown starts later.")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "아카이브");
  assert.equal(root.childNodes[1].textContent, "아카이브는 진행 상황을 되돌아보고 전역 개선을 해금하는 곳입니다.");
  assert.equal(root.childNodes[2].textContent, "디지털 캔버스");
  assert.equal(root.childNodes[3].textContent, "더 진행하면 여정의 이 부분이 드러납니다.");
  assert.equal(root.childNodes[4].textContent, "첫 소프트캡에 도달했습니다! 대기 중인 정수는 평생 정수, 아직 평생 정수가 없다면 1000을 넘는 순간부터 느려지기 시작합니다. 대기 중인 양이 그 기준을 넘어 두 배가 될 때마다 정수 생산은 다시 절반으로 줄어듭니다. 생각보다 나쁘지는 않습니다. 벽이 아니라 소프트캡이니까요. 여전히 밀고 나갈 수 있고, 다시 그리기를 하면 평생 정수가 올라가 다음 감속이 더 늦게 시작됩니다.");
});

test("extension dictionary covers gameplay UI panels", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/gameplay-ui-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Automatically fight the same enemy for as long as you can survive.")]),
    new ElementNode("button", {}, [new TextNode("Unscramble")]),
    new ElementNode("p", {}, [new TextNode("Something waits beyond the edge of this universe. Not available in demo.")]),
    new ElementNode("p", {}, [new TextNode("Go to Archive tab")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "살아남는 동안 같은 적과 자동으로 전투합니다.");
  assert.equal(root.childNodes[1].textContent, "해독");
  assert.equal(root.childNodes[2].textContent, "이 우주의 가장자리 너머에서 무언가가 기다립니다. 데모에서는 사용할 수 없습니다.");
  assert.equal(root.childNodes[3].textContent, "아카이브 탭으로 이동");
});

test("extension dictionary covers combined stat tooltip bodies", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/gameplay-ui-translations.js");
  require("../src/misc-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Attack Speed\nDelay between attacks in milliseconds.\nLower is faster. Improved by SPD rewards\n(negative values).")]),
    new ElementNode("p", {}, [new TextNode("Hit Points\nMaximum health. Combat ends immediately\nwhen current health reaches zero.")]),
    new ElementNode("p", {}, [new TextNode("Attack Damage\nBaseline damage dealt per attack before\nmultipliers, variance, and damage reduction.")]),
    new ElementNode("p", {}, [new TextNode("Critical Chance\nPercent chance to land a Critical Hit,\nmultiplying damage by Critical Damage.\nCountered by the target's Glancing Blow\nchance.")]),
    new ElementNode("p", {}, [new TextNode("Critical Damage\nDamage multiplier applied on Critical Hits.\nBase is 1.5×.")]),
    new ElementNode("p", {}, [new TextNode("Minimum Damage\nThe lower floor of damage variance. Base\nvalue is 75%. Higher values increase\ndamage consistency.")]),
    new ElementNode("p", {}, [new TextNode("Maximum Damage\nThe upper ceiling of damage variance. Base\nvalue is 1.25×. Higher values increase peak\ndamage potential.")]),
    new ElementNode("p", {}, [new TextNode("Attack Speed (Unaffected by Decay Factor)\nDelay between attacks in milliseconds.\nLower is faster. Improved by SPD rewards\n(negative values).")]),
    new ElementNode("p", {}, [new TextNode("Health Regeneration\nHealth recovered per second during combat.\nApplied continuously. Cannot exceed Max\nHP.")]),
    new ElementNode("p", {}, [new TextNode("Dodge Chance (Unaffected by Decay Factor)\nPercent chance to completely avoid an\nincoming attack, avoiding damage and\nstatus effects. Countered by the attacker's\nAccuracy stat.")]),
    new ElementNode("p", {}, [new TextNode("Critical Chance (Unaffected by Decay\nFactor)\nPercent chance to land a Critical Hit,\nmultiplying damage by Critical Damage.\nCountered by the target's Glancing Blow\nchance.")]),
    new ElementNode("p", {}, [new TextNode("Armor\nFlat damage subtracted from every incoming\nhit after all other calculations. Reduced by\nthe attacker's Armor Penetration.")]),
    new ElementNode("p", {}, [new TextNode("Armor Penetration\nFlat amount of the target's Armor ignored\nwhen calculating damage reduction.\nEffectively increases damage against\narmored targets.")]),
    new ElementNode("p", {}, [new TextNode("Frailty Chance\nChance to apply Frailty. Each stack\nincreases final damage taken by 1%. Values\nover 100% allow for multiple applications per\nhit.")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "공격 속도\n공격 사이의 지연 시간(밀리초)입니다. 낮을수록 빠릅니다. SPD 보상(음수 값)으로 개선됩니다.");
  assert.equal(root.childNodes[1].textContent, "체력\n최대 체력입니다. 현재 체력이 0이 되면 전투가 즉시 종료됩니다.");
  assert.equal(root.childNodes[2].textContent, "공격 피해\n배율, 편차, 피해 감소가 적용되기 전 공격 1회당 기본 피해입니다.");
  assert.equal(root.childNodes[3].textContent, "치명타 확률\n치명타를 적중시켜 피해에 치명타 피해 배율을 적용할 확률입니다. 대상의 스침 방어 확률로 대응됩니다.");
  assert.equal(root.childNodes[4].textContent, "치명타 피해\n치명타에 적용되는 피해 배율입니다. 기본값은 1.5배입니다.");
  assert.equal(root.childNodes[5].textContent, "최소 피해\n피해 편차의 하한입니다. 기본값은 75%입니다. 값이 높을수록 피해가 더 안정적입니다.");
  assert.equal(root.childNodes[6].textContent, "최대 피해\n피해 편차의 상한입니다. 기본값은 1.25배입니다. 값이 높을수록 최대 피해 잠재력이 증가합니다.");
  assert.equal(root.childNodes[7].textContent, "공격 속도 (감쇠 계수의 영향을 받지 않음)\n공격 사이의 지연 시간(밀리초)입니다. 낮을수록 빠릅니다. SPD 보상(음수 값)으로 개선됩니다.");
  assert.equal(root.childNodes[8].textContent, "체력 재생\n전투 중 초당 회복되는 체력입니다. 지속적으로 적용됩니다. 최대 체력을 넘을 수 없습니다.");
  assert.equal(root.childNodes[9].textContent, "회피 확률 (감쇠 계수의 영향을 받지 않음)\n받는 공격을 완전히 피해서 피해와 상태 효과를 회피할 확률입니다. 공격자의 명중 능력치로 대응됩니다.");
  assert.equal(root.childNodes[10].textContent, "치명타 확률 (감쇠 계수의 영향을 받지 않음)\n치명타를 적중시켜 피해에 치명타 피해 배율을 적용할 확률입니다. 대상의 스침 방어 확률로 대응됩니다.");
  assert.equal(root.childNodes[11].textContent, "방어력\n다른 모든 계산 이후 받는 모든 타격에서 차감되는 고정 피해량입니다. 공격자의 방어 관통으로 감소합니다.");
  assert.equal(root.childNodes[12].textContent, "방어 관통\n피해 감소 계산 시 대상의 방어력 중 무시하는 고정 수치입니다. 방어력이 있는 대상에게 주는 피해를 실질적으로 높입니다.");
  assert.equal(root.childNodes[13].textContent, "취약 확률\n취약을 적용할 확률입니다. 각 중첩은 받는 최종 피해를 1% 증가시킵니다. 100%를 넘는 값은 한 타격에 여러 번 적용될 수 있습니다.");
});

test("extension patterns cover dynamic battle notifications", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/gameplay-ui-translations.js");
  require("../src/misc-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("Stick Man defeated!")]),
    new ElementNode("p", {}, [new TextNode("+0.505 Attack")]),
    new ElementNode("p", {}, [new TextNode("+1 Inspiration")]),
    new ElementNode("p", {}, [new TextNode("Defeated by Stick Man! 5 second cooldown.")]),
    new ElementNode("p", {}, [new TextNode("Encountered: Stick Man")]),
    new ElementNode("p", {}, [new TextNode("New version unlocked: Stick Man!")]),
    new ElementNode("p", {}, [new TextNode("Feat Medal Purchased!")]),
    new ElementNode("p", {}, [new TextNode("Feat Mult +0.0101 (Now: 1.02x)")]),
    new ElementNode("p", {}, [new TextNode("Feat Medal Purchased!\nFeat Mult +0.0101 (Now: 1.02x)")]),
    new ElementNode("p", {}, [new TextNode("Feat Achieved: Spider Squasher!")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "졸라맨 격파!");
  assert.equal(root.childNodes[1].textContent, "공격 +0.505");
  assert.equal(root.childNodes[2].textContent, "영감 +1");
  assert.equal(root.childNodes[3].textContent, "졸라맨에게 패배했습니다! 5초 쿨다운.");
  assert.equal(root.childNodes[4].textContent, "조우: 졸라맨");
  assert.equal(root.childNodes[5].textContent, "새 버전 해금: 졸라맨!");
  assert.equal(root.childNodes[6].textContent, "업적 메달 구매 완료!");
  assert.equal(root.childNodes[7].textContent, "업적 배율 +0.0101 (현재: 1.02배)");
  assert.equal(root.childNodes[8].textContent, "업적 메달 구매 완료!\n업적 배율 +0.0101 (현재: 1.02배)");
  assert.equal(root.childNodes[9].textContent, "업적 달성: 거미 압살자!");
});

test("extension patterns cover dynamic glossary notifications", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/gameplay-ui-translations.js");
  require("../src/misc-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("New Glossary Entry: V-Wing Bat")]),
    new ElementNode("p", {}, [new TextNode("Glossary Multiplier +0.01 (New: 1.04x)")]),
    new ElementNode("p", {}, [new TextNode("New Glossary Entry: V-Wing Bat\nGlossary Multiplier +0.01 (New: 1.04x)")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "새 용어집 항목: V-윙 박쥐");
  assert.equal(root.childNodes[1].textContent, "용어집 배율 +0.01 (새 값: 1.04배)");
  assert.equal(root.childNodes[2].textContent, "새 용어집 항목: V-윙 박쥐\n용어집 배율 +0.01 (새 값: 1.04배)");
});

test("extension dictionary covers remaining common UI copy", () => {
  require("../src/translations.js");
  require("../src/locale-core-translations.js");
  require("../src/sketch-name-translations.js");
  require("../src/sketch-flavor-translations.js");
  require("../src/skill-translations.js");
  require("../src/medal-translations.js");
  require("../src/stat-translations.js");
  require("../src/ui-message-translations.js");
  require("../src/tutorial-story-translations.js");
  require("../src/gameplay-ui-translations.js");
  require("../src/misc-translations.js");
  require("../src/patterns.js");
  const root = new ElementNode("main", {}, [
    new ElementNode("p", {}, [new TextNode("You Died")]),
    new ElementNode("p", {}, [new TextNode("Dark Mode Only - Can be toggled in Settings")]),
    new ElementNode("p", {}, [new TextNode("Every 30s (Default)")]),
    new ElementNode("p", {}, [new TextNode("Current Balance")]),
  ]);
  const translator = createTranslator(global.REJECTED_DRAFT_KO_TRANSLATIONS, {
    patterns: global.REJECTED_DRAFT_KO_PATTERNS,
  });

  translator.translateTree(root);

  assert.equal(root.childNodes[0].textContent, "사망");
  assert.equal(root.childNodes[1].textContent, "다크 모드 전용 - 설정에서 전환 가능");
  assert.equal(root.childNodes[2].textContent, "30초마다 (기본)");
  assert.equal(root.childNodes[3].textContent, "현재 잔액");
});
