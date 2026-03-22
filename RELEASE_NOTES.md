# North Forge AI Studio — Release Notes
## Version 1.4.0 — 2026-03-22

---

### What Changed in This Release

This is a bug-fix release. No new features were added. Five bugs were found and fixed — two of them would cause silent crashes that prevented core features from working.

---

### Bugs Fixed

**The Chemistry Scene and Sora Character Sheet buttons were broken.**
Clicking "Build Sora Character Sheet" or "Chemistry Scene" on any character card in the Cast room would throw a JavaScript error and produce nothing. The underlying functions referenced a variable that was never available in that file. Both functions now work correctly and produce richer output because they pull from the full cast data (which includes appearance, vibe, and voice details) rather than the stripped-down registry.

**The Profile room crashed on first load.**
Opening the Profile tab threw a JavaScript error before anything could render, because a state variable was declared in the wrong place in the file. The room could not display at all. The declaration has been moved to the correct position — the room now loads and works as intended.

**The Gemini fallback was using the wrong AI model.**
When Anthropic was unavailable and North fell back to Gemini, it was calling an older model (`gemini-1.5-flash`) instead of the current one (`gemini-2.0-flash`). The Setup room's test button used the correct model, but the actual fallback did not. Both now use `gemini-2.0-flash`.

**The "Test Gemini Key" button in Setup always said "No key."**
Even with a valid Gemini API key properly saved, the test function was looking in the wrong place for the key and always reported it as missing. The function now reads from the correct location. Testing your Gemini key in Setup will now correctly confirm whether the key works.

**Long call sheets could corrupt the copy and reforge buttons in Setup.**
The Call Sheet History panel in Setup built copy and reforge buttons by embedding prompt text directly into HTML attributes. Prompts containing apostrophes, quotes, or special character sequences could silently break these buttons. The buttons now use a safe index-based lookup that works correctly regardless of what characters appear in the prompt.

---

### Nothing Else Changed

Version 1.3.0 features are all intact: North's Notes, Crew Share, Weekly Brief, Platform Quick-Pick, Digest Remix, Export Week, 7-Day Forecast, Best-of-Week, and all 13 rooms.

---

### Upgrade Notes

No action required. This is a client-side JS release — deploy with `firebase deploy` and do a hard refresh (`Ctrl+Shift+R`) to clear any cached module versions.

If the Gemini test in Setup was previously showing "No key" despite having a key saved, re-enter and re-save the key after this update to confirm it registers correctly.
