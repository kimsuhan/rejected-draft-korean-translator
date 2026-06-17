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

- `src/translations.js`: Korean dictionary.
- `src/locale-core-translations.js`: locale-derived common UI, stat, shop, setting, and skill-tree dictionary.
- `src/skill-translations.js`: later skill-tree names, descriptions, and flavor text.
- `src/medal-translations.js`: feat-medal categories, tasks, and remaining glossary/fundamental labels.
- `src/stat-translations.js`: battle-stat tooltip and vulnerability descriptions.
- `src/ui-message-translations.js`: settings, notification, and common UI messages.
- `src/tutorial-story-translations.js`: tutorial modals and story entries.
- `src/gameplay-ui-translations.js`: tools, glossary, multiverse, shortcuts, gallery, battle, archive, and meditation UI.
- `src/misc-translations.js`: credits, language names, offline summary, prestige, Steam copy, and remaining locale strings.
- `src/patterns.js`: pattern translations for dynamic labels such as tutorial steps, victory counts, facts, and tips.
- `src/translator-core.js`: DOM text and attribute translator.
- `src/content-script.js`: turns on translation, watches DOM changes, and logs untranslated English phrases.
- `popup.html` / `popup.js`: translation toggle and missing-text export.

## Current Coverage

Verified against the visible entry flow, including the opening gallery, premise text, theme selection, gallery tutorial, first battle, and the first post-victory unlock state. The extension also includes locale-derived translations for later-game tabs, stats, shop labels, settings, notifications, skill-tree labels, feat medals, story, tutorial, credits, Steam copy, and repeated dynamic descriptions. Current downloaded English locale coverage is 3130 / 3130 English-bearing strings (100.0%). Future game updates can still be expanded through the missing-text export flow.

## Expanding the Translation

1. Play the game with the extension enabled.
2. Open the extension popup.
3. Click "미번역 문구 복사".
4. Add copied English phrases to `src/translations.js`.
5. Reload the extension from `chrome://extensions` and refresh the game.

## Test

```bash
node --test test/translator-core.test.js
```
