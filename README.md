# Rejected Draft Korean Polish Patch

Chrome MV3 extension that polishes the official Korean UI for Rejected Draft with local DOM replacements. It also fills in English text that is still missing from the official Korean build.

## Install

1. Open Chrome Extensions: `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this folder: `rejected-draft-korean-translator`.
5. Open or refresh `https://galaxy.click/play/733`.

The actual game runs inside an iframe from `https://kuzzigames.com/rejected_draft/`, so the extension injects into both the Galaxy wrapper and the original game URL.

## How It Works

- `src/registry.js`: shared registration helpers for glossary, fixed translations, and pattern groups.
- `src/glossary/`: common currencies, combat stats, status effects, rarities, and abbreviations.
- `src/polish/official-ko-fixes.js`: official Korean wording polish, such as awkward labels or tone fixes.
- `src/fallback/`: older English-to-Korean fallback coverage for text that still leaks through.
- `src/sketches/names.js`: sketch/enemy names only.
- `src/sketches/flavor.js`: sketch flavor and description text.
- `src/skills/`: archive and combat skill names, effects, descriptions, and flavor text.
- `src/medals/`: feat-medal names, categories, tasks, and descriptions.
- `src/stats/tooltips.js`: battle-stat tooltip and vulnerability descriptions.
- `src/ui/`: settings, notifications, tutorial/story, gameplay UI, and scrolling tips.
- `src/patterns/`: dynamic pattern groups for numbers, time, notifications, rewards, requirements, medals, gameplay, and tooltips.
- `src/core/translator-core.js`: DOM text and attribute replacement engine.
- `src/core/content-script.js`: turns on the polish patch, watches DOM changes, and logs remaining English phrases.
- `popup.html` / `popup.js`: polish-patch toggle and remaining-English export.

## Current Coverage

The game now has official Korean support. This extension is kept as a lightweight polish layer: it improves awkward official Korean wording, keeps game-UI terminology consistent, and covers English strings that still leak through the Korean build. The older English-to-Korean dictionary remains as fallback coverage.

## Expanding the Patch

1. Play the game in official Korean with the extension enabled.
2. Use the popup to copy remaining English phrases when needed.
3. Add repeated terms to the right `src/glossary/*.js` file.
4. Add official Korean wording fixes to `src/polish/official-ko-fixes.js`.
5. Add English fallback text to the best matching domain folder, such as `src/sketches/`, `src/skills/`, `src/ui/`, or `src/fallback/`.
6. Add dynamic phrases to the best matching `src/patterns/*.js` file.
7. Reload the extension from `chrome://extensions` and refresh the game.

## Validation

```bash
node -e "const fs=require('node:fs'); const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8')); for (const f of [...manifest.content_scripts[0].js, 'popup.js']) new Function(fs.readFileSync(f,'utf8')); console.log('syntax ok')"
```
