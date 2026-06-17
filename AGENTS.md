# AGENTS.md

이 저장소는 Rejected Draft를 한국어로 번역하는 Chrome MV3 확장 프로그램이다. 외부 번역 API를 쓰지 않고, DOM 텍스트를 로컬 사전과 정규식 패턴으로 치환한다.

## 기본 원칙

- 게임 화면에서 실제로 보이는 영어 문구를 기준으로 번역을 추가한다.
- 기존 구조를 유지한다. 새 프레임워크, 빌드 도구, 번들러를 추가하지 않는다.
- 외부 API, 원격 번역 서비스, 네트워크 의존 번역을 넣지 않는다.
- 번역은 자연스러운 한국어 UI 문장으로 작성한다. 직역보다 게임 안에서 읽히는 톤을 우선한다.
- 기존 용어는 통일한다. 예: `Redraw`는 `다시 그리기`, `Quintessence`는 `정수`, `Feat Medal`은 `업적 메달`, `Glossary`는 `용어집`.
- 수치, 기호, 약어, 공식은 보존한다. 예: `SPD`, `Max HP`, `1.25×`, `100%`, `∞`.

## 파일별 역할

- `src/translations.js`: 일반 고정 문구 사전.
- `src/locale-core-translations.js`: locale 기반 공통 UI, 능력치, 상점, 설정, 스킬트리 사전.
- `src/sketch-name-translations.js`: 스케치 이름 번역.
- `src/sketch-flavor-translations.js`: 스케치 설명/플레이버 텍스트 번역.
- `src/skill-translations.js`: 스킬 이름, 설명, 플레이버 텍스트 번역.
- `src/medal-translations.js`: 업적 메달, 과제, 카테고리 문구 번역.
- `src/stat-translations.js`: 전투 능력치 툴팁과 상태 설명 번역.
- `src/ui-message-translations.js`: 설정, 알림, 공통 UI 메시지 번역.
- `src/tutorial-story-translations.js`: 튜토리얼, 스토리, 안내 모달 번역.
- `src/gameplay-ui-translations.js`: 도구, 용어집, 갤러리, 전투, 아카이브 등 플레이 UI 번역.
- `src/misc-translations.js`: 크레딧, 언어명, 오프라인 요약, Steam 안내 등 기타 문구 번역.
- `src/patterns.js`: 숫자, 이름, 단계, 보상처럼 값이 바뀌는 동적 문구 번역.
- `src/translator-core.js`: DOM 텍스트와 속성 번역 핵심 로직.
- `src/content-script.js`: DOM 감시, 실시간 번역, 미번역 문구 수집.
- `test/translator-core.test.js`: 사전/패턴 회귀 테스트.

## 번역 추가 절차

1. 스크린샷이나 미번역 로그에서 원문을 정확히 확인한다.
2. 고정 문구면 가장 알맞은 `*-translations.js` 파일에 추가한다.
3. 숫자, 이름, 재화, 단계, 보상 값이 바뀌는 문구면 `src/patterns.js`에 정규식 패턴으로 추가한다.
4. 제목과 본문이 한 DOM 텍스트 노드로 합쳐지는 툴팁은 합쳐진 정규화 문자열도 사전에 추가한다.
5. 새 번역마다 `test/translator-core.test.js`에 회귀 테스트를 추가한다.
6. 테스트가 먼저 실패하는지 확인한 뒤 구현하고, 최종적으로 통과시킨다.

## 한국어 윤문 규칙

- 번역을 추가하거나 수정한 뒤에는 `humanize-korean` 기준으로 윤문 점검을 한다.
- 윤문 기록은 확장 프로그램 폴더 안에 넣지 않는다.
- 작업 기록이 필요하면 repo 바깥의 작업용 `_workspace/YYYY-MM-DD-NNN/final.md`에 둔다.
- Chrome 확장 프로그램 폴더 안에는 `_workspace`, `_notes`처럼 `_`로 시작하는 파일이나 폴더를 만들지 않는다. Chrome이 예약 이름으로 취급해 확장 로드가 실패할 수 있다.

## 동적 패턴 작성 규칙

- `src/patterns.js`의 `t(value)`를 사용해 이름, 스케치, 재화, 능력치 용어가 기존 사전을 타게 한다.
- 구체적인 패턴은 일반 패턴보다 위에 둔다. 예를 들어 특정 팁 전문 패턴은 `TIP (#.+)` 같은 일반 패턴보다 먼저 와야 한다.
- 여러 화면에서 값만 바뀌는 문구는 특정 값에 고정하지 않는다.
- 줄바꿈은 `translator-core`에서 공백으로 정규화되므로, 패턴은 정규화된 한 줄 기준으로 작성한다.
- 알림 문구는 가능하면 전체 형태를 패턴으로 잡는다. 예: `Feat Achieved: (.+)!`, `New Glossary Entry: (.+)`.

## 검증

변경 후 최소한 아래를 실행한다.

```bash
node --test test/translator-core.test.js
```

문법과 매니페스트 검사는 아래 명령으로 확인한다.

```bash
node -e "JSON.parse(require('node:fs').readFileSync('manifest.json','utf8')); for (const f of ['src/translations.js','src/locale-core-translations.js','src/sketch-name-translations.js','src/sketch-flavor-translations.js','src/skill-translations.js','src/medal-translations.js','src/stat-translations.js','src/ui-message-translations.js','src/tutorial-story-translations.js','src/gameplay-ui-translations.js','src/misc-translations.js','src/patterns.js','src/translator-core.js','src/content-script.js','popup.js']) new Function(require('node:fs').readFileSync(f,'utf8')); console.log('syntax ok')"
```

Chrome 예약 파일 검사는 아래처럼 한다.

```bash
find . -maxdepth 2 -name '_*' -print
```

출력이 없어야 한다.

## 로컬 테스트

1. Chrome에서 `chrome://extensions`를 연다.
2. 개발자 모드를 켠다.
3. `Load unpacked`로 이 repo 폴더를 선택한다.
4. `https://galaxy.click/play/733`을 새로고침한다.
5. 미번역 문구가 보이면 확장 팝업의 `미번역 문구 복사`를 사용한다.

## 커밋 전 체크리스트

- `node --test test/translator-core.test.js` 통과.
- 문법 검사에서 `syntax ok` 확인.
- `find . -maxdepth 2 -name '_*' -print` 출력 없음.
- `git status --short`로 의도한 파일만 변경됐는지 확인.
- 번역문을 추가했다면 윤문 점검 기록을 repo 밖에 남겼는지 확인.

## 하지 말 것

- 확장 폴더 안에 `_workspace`를 만들지 않는다.
- 테스트 없이 사전만 추가하지 않는다.
- 값이 바뀌는 문구를 고정 문자열로만 처리하지 않는다.
- 관련 없는 리팩터링을 섞지 않는다.
- 게임 DOM이나 스타일을 과하게 바꾸지 않는다. 읽기 어려운 회색 글씨 보정처럼 필요한 최소 CSS만 허용한다.
