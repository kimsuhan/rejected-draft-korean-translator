# Rejected Draft Korean Translator

Chrome MV3 extension that translates the DOM text of Rejected Draft into Korean with a local dictionary and `MutationObserver`.

## Install

1. Open Chrome Extensions: `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this folder: `galaxy-korean-translator`.
5. Open or refresh `https://galaxy.click/play/733`.

The actual game runs inside an iframe from `https://kuzzigames.com/rejected_draft/`, so the extension injects into both the Galaxy wrapper and the original game URL.

## How It Works

- `src/glossary-translations.js`: shared glossary for currencies, stats, status effects, and abbreviations.
- `src/translations.js`: Korean dictionary.
- `src/locale-core-translations.js`: locale-derived common UI, stat, shop, setting, and skill-tree dictionary.
- `src/skill-translations.js`: later skill-tree names, descriptions, and flavor text.
- `src/medal-translations.js`: feat-medal categories, tasks, and remaining glossary/fundamental labels.
- `src/stat-translations.js`: battle-stat tooltip and vulnerability descriptions.
- `src/ui-message-translations.js`: settings, notification, and common UI messages.
- `src/tutorial-story-translations.js`: tutorial modals and story entries.
- `src/gameplay-ui-translations.js`: tools, glossary, multiverse, shortcuts, gallery, battle, archive, and meditation UI.
- `src/misc-translations.js`: credits, language names, offline summary, prestige, Steam copy, and remaining locale strings.
- `src/scrolling-tip-translations.js`: scrolling tip, critique, joke, fact, and life-pro-tip text.
- `src/patterns.js`: pattern translations for dynamic labels such as tutorial steps, victory counts, rewards, requirements, and tooltips.
- `src/translator-core.js`: DOM text and attribute translator.
- `src/content-script.js`: turns on translation, watches DOM changes, and logs untranslated English phrases.
- `popup.html` / `popup.js`: translation toggle and missing-text export.

## Current Coverage

Verified against the visible entry flow, including the opening gallery, premise text, theme selection, gallery tutorial, first battle, and the first post-victory unlock state. The extension also includes locale-derived translations for later-game tabs, stats, shop labels, settings, notifications, skill-tree labels, feat medals, story, tutorial, credits, Steam copy, scrolling tips, and repeated dynamic descriptions. Current downloaded English locale coverage is 3064 / 3064 unique English-bearing strings (100.0%). Future game updates can still be expanded through the missing-text export flow.

## Expanding the Translation

1. Play the game with the extension enabled.
2. Open the extension popup.
3. Click "미번역 문구 복사".
4. Add repeated terms to `src/glossary-translations.js`; add fixed phrases to the best matching `src/*-translations.js` file; add dynamic phrases to `src/patterns.js`.
5. Reload the extension from `chrome://extensions` and refresh the game.

## Validation

```bash
node -e "JSON.parse(require('node:fs').readFileSync('manifest.json','utf8')); for (const f of ['src/glossary-translations.js','src/translations.js','src/locale-core-translations.js','src/sketch-name-translations.js','src/sketch-flavor-translations.js','src/skill-translations.js','src/medal-translations.js','src/stat-translations.js','src/ui-message-translations.js','src/tutorial-story-translations.js','src/gameplay-ui-translations.js','src/misc-translations.js','src/scrolling-tip-translations.js','src/patterns.js','src/translator-core.js','src/content-script.js','popup.js']) new Function(require('node:fs').readFileSync(f,'utf8')); console.log('syntax ok')"
```
