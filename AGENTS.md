# AGENTS.md

이 저장소는 Rejected Draft를 한국어로 번역하는 Chrome MV3 확장 프로그램이다. 외부 번역 API 없이 DOM 텍스트를 로컬 사전과 정규식 패턴으로 치환한다.

## 최우선 원칙

- 가장 중요한 기준은 게임 UI 톤이다. 문서·수학·개발자 용어처럼 보이는 직역을 피하고, 게임 안의 스킬·효과·상태·보상 문구처럼 자연스럽게 읽히게 번역한다.
- 예: `divider`를 `나눗셈`처럼 직역하지 말고 화면 맥락에 맞춰 `속도 보정`처럼 게임 효과명에 가까운 표현을 고른다.
- 작업 속도가 중요하다. 이 프로젝트에서는 TDD가 불필요하며, 테스트를 먼저 작성하지 않는다. 미번역 문구가 확인되면 기존 구조에 맞춰 바로 번역을 시도한다.
- 새 프레임워크, 빌드 도구, 번들러, 외부 API, 원격 번역 서비스, 네트워크 의존 번역을 추가하지 않는다.
- 수치, 기호, 약어, 공식은 보존한다. 예: `SPD`, `Max HP`, `1.25×`, `100%`, `∞`.

## 용어 중복 방지

- 재화, 능력치, 상태 효과, 약어처럼 여러 화면에 반복되는 핵심 용어는 반드시 `src/glossary/*.js`에 먼저 둔다.
- 다른 사전 파일이나 `src/patterns/*.js` 안에 같은 용어표를 새로 만들지 않는다. 이미 glossary에 있는 용어는 재정의하지 말고 재사용한다.
- `Graphite`와 `GRA`처럼 같은 개념의 이름/약어는 glossary에서 같은 번역으로 묶는다. `Inspiration`처럼 별도 개념인 단어와 섞이지 않게 한다.
- `src/patterns/*.js`에서는 `t(value)`를 사용해 glossary와 기존 사전을 타게 한다.
- 기존 용어는 통일한다. 예: `Redraw`는 `다시 그리기`, `Quintessence`는 `정수`, `Feat Medal`은 `업적 메달`, `Glossary`는 `용어집`.

## 파일 선택 규칙

- `src/registry.js`: 사전, glossary, 패턴 등록 헬퍼. 번역 추가만으로 해결되는 작업에서는 건드리지 않는다.
- `src/glossary/currency.js`: 재화와 재화 약어.
- `src/glossary/combat-stats.js`: 전투 능력치와 능력치 약어.
- `src/glossary/status-effects.js`: 상태 효과, 버프, 디버프.
- `src/glossary/rarities.js`, `src/glossary/common.js`: 희귀도와 기타 공통 핵심 용어.
- `src/polish/official-ko-fixes.js`: 공식 한국어 UI의 어색한 문구를 게임 UI 톤으로 보정.
- `src/fallback/english-ui.js`, `src/fallback/locale-core.js`, `src/fallback/misc.js`: 아직 영어로 남는 고정 문구 fallback.
- `src/sketches/names.js`: 스케치/적 이름만.
- `src/sketches/flavor.js`: 스케치 설명/플레이버 텍스트.
- `src/skills/archive-tree.js`, `src/skills/combat.js`: 스킬 이름, 설명, 플레이버 텍스트.
- `src/medals/locale.js`, `src/medals/achievements.js`: 업적 메달, 과제, 카테고리 문구.
- `src/stats/tooltips.js`: 전투 능력치 툴팁과 상태 설명.
- `src/ui/messages.js`: 설정, 알림, 공통 UI 메시지.
- `src/ui/tutorial-story.js`: 튜토리얼, 스토리, 안내 모달.
- `src/ui/gameplay.js`: 도구, 용어집, 갤러리, 전투, 아카이브 등 플레이 UI.
- `src/ui/scrolling-tips.js`: 스크롤 팁, 비평, 농담, 사실, 생활 팁 문구.
- `src/patterns/*.js`: 숫자, 시간, 이름, 재화, 단계, 보상처럼 값이 바뀌는 동적 문구.
- `src/core/translator-core.js`, `src/core/content-script.js`: 번역 로직과 DOM 감시. 번역 추가만으로 해결되는 작업에서는 건드리지 않는다.

## 번역 작업 절차

1. 스크린샷이나 미번역 로그에서 실제 화면에 보이는 영어 원문을 정확히 확인한다.
2. 반복 용어라면 알맞은 `src/glossary/*.js`에 먼저 추가하거나 기존 항목을 수정한다.
3. 공식 한국어 문구가 어색한 경우 `src/polish/official-ko-fixes.js`에 추가한다.
4. 영어 고정 문구는 가장 알맞은 도메인 파일에 추가한다. 예: 스케치 이름은 `src/sketches/names.js`, 스킬은 `src/skills/*.js`, 일반 fallback은 `src/fallback/*.js`.
5. 값이 바뀌는 문구는 알맞은 `src/patterns/*.js`에 정규식 패턴으로 추가한다.
6. 제목과 본문이 한 DOM 텍스트 노드로 합쳐지는 툴팁은 정규화된 한 줄 기준으로 결합 패턴을 잡는다.
7. 같은 문구가 일부만 먼저 번역되어 다시 결합될 수 있으면, 영어 원문 형태와 부분 번역 형태를 모두 처리한다.
8. 테스트는 추가하지 않는다. 변경 후 문법/매니페스트 검사와 Chrome 예약 파일 검사만 수행한다.

## 동적 패턴 규칙

- 구체적인 패턴을 일반 패턴보다 위에 둔다. 예: 특정 팁 전문 패턴은 `TIP (#.+)` 같은 일반 패턴보다 먼저 둔다.
- 여러 화면에서 값만 바뀌는 문구는 특정 값에 고정하지 않는다.
- 줄바꿈은 `translator-core`에서 공백으로 정규화되므로, 패턴은 정규화된 한 줄 기준으로 작성한다.
- 알림 문구는 가능하면 전체 형태를 패턴으로 잡는다. 예: `Feat Achieved: (.+)!`, `New Glossary Entry: (.+)`.
- 패턴 안에서 재화, 능력치, 상태 효과, 스케치 이름을 직접 번역하지 말고 `t(value)`를 사용한다.

## 윤문 규칙

- 번역을 추가하거나 수정한 뒤에는 `humanize-korean` 기준으로 의미 보존과 게임 UI 톤을 점검한다.
- 윤문 기록은 확장 프로그램 폴더 안에 넣지 않는다.
- 작업 기록이 필요하면 repo 바깥의 작업용 `_workspace/YYYY-MM-DD-NNN/final.md`에 둔다.
- Chrome 확장 프로그램 폴더 안에는 `_workspace`, `_notes`처럼 `_`로 시작하는 파일이나 폴더를 만들지 않는다. Chrome이 예약 이름으로 취급해 확장 로드가 실패할 수 있다.

## 검증

변경 후 최소한 아래 두 가지를 확인한다.

```bash
node -e "const fs=require('node:fs'); const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8')); for (const f of [...manifest.content_scripts[0].js, 'popup.js']) new Function(fs.readFileSync(f,'utf8')); console.log('syntax ok')"
```

```bash
find . -maxdepth 2 -name '_*' -print
```

두 번째 명령은 출력이 없어야 한다.

## 금지 사항

- 확장 폴더 안에 `_workspace`, `_notes` 등 `_`로 시작하는 파일이나 폴더를 만들지 않는다.
- 값이 바뀌는 문구를 고정 문자열로만 처리하지 않는다.
- glossary에 들어갈 반복 용어를 개별 사전이나 패턴 안에 중복 정의하지 않는다.
- 관련 없는 리팩터링을 섞지 않는다.
- 번역 추가 작업에서 `src/registry.js`, `src/core/translator-core.js`, `src/core/content-script.js`, 게임 DOM, 스타일을 과하게 바꾸지 않는다.
