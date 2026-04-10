# LT CFP Candidate 1

## Framing

Provocation: "You think ruby.wasm works on mobile. You're wrong — here's proof, and here's the fix."

One insight: mobile browsers actively fight WebAssembly in three specific, undocumented ways.
One reveal: each bug has a precise, short fix once you know the root cause.
One conclusion: ruby.wasm IS viable for community outreach — but only after you've hit these walls.

Demo: live iPhone on stage via iOS Handoff, running the actual booth game.

---

## Title (≤60 chars)

```
Your ruby.wasm Doesn't Work on Mobile. Here's Why.
```

Char count: 51 ✓

---

## Abstract (≤1000 chars — target ~600)

You ship a ruby.wasm app. It works on your MacBook. You bring it to a conference booth, hand it
to a stranger on their iPhone — it crashes. The next person's Android freezes with no error. A
third player comes back from a break and their quiz progress is gone. I hit all three at SITCON
2026, running a Ruby quiz game powered by Ruby 4.0 WASM in-browser, designed to introduce Ruby
to people who had never written a line of it. Each failure has a root cause and a fix under 10
lines. I'll show you all three.

---

Char count: ~420 ✓ (under 1000)

---

## Details (review committee — technical deep-dive, no limit)

### What we built

GitHub: https://github.com/rubytaiwan/sitcon2026-booth

A Jekyll static site deployed at `sitcon2026-booth.ruby.tw` for the Ruby Taiwan booth at SITCON
2026. Players type Ruby one-liners into an in-browser editor; Ruby 4.0 WASM executes them live
and shows the output. 10 questions, difficulty gradient, completion scorecard — no install, no
account, just open on your phone. The intent: let total strangers write and run real Ruby in
under a minute.

### Bug 1 — iOS Safari 18.x asyncify call stack overflow

**Symptom**: `RangeError: Maximum call stack size exceeded` thrown inside the WASM binary
on the very first user eval, iOS Safari 18.x only. Desktop Safari and iOS Chrome: fine.

**Root cause**: Ruby WASM is compiled with Asyncify (a Binaryen transformation that lets WASM
suspend/resume for async I/O). The first `eval` that triggers a lazy `require` of a stdlib
module — e.g. `stringio`, `strscan` — pushes the Asyncify-instrumented stack past Safari's
limit. The module loading itself is what blows the stack, not the user's code.

**Fix** (two parts):
```javascript
// 1. Warm-up during initRuby() — force lazy stdlib into memory now, not later
try { rubyVM.eval('require "stringio"; require "strscan"'); } catch(_) {}

// 2. In runRuby() — catch overflow, retry after one macrotask break
try {
  result = rubyVM.eval(code).toString();
} catch (e) {
  if (e instanceof RangeError || e.message?.includes('call stack')) {
    await new Promise(r => setTimeout(r, 50)); // let JS engine unwind the Asyncify frames
    result = rubyVM.eval(code).toString();
  }
}
```

The warm-up means the lazy-require never happens during user eval (shallower stack).
The 50ms macrotask break lets the JS engine fully unwind Asyncify's continuation frames
before the retry, which succeeds even when warm-up alone is insufficient.

### Bug 2 — Android Chrome/Firefox silent WASM streaming compile hang

**Symptom**: Loading spinner runs forever. `WebAssembly.compileStreaming` never resolves,
never rejects. No console error. The 31 MB `.wasm` binary just disappears into the void.

**Root cause**: `compileStreaming` requires the server to stream the response with the correct
MIME type (`application/wasm`) before the full download completes. Some Android browser/OS
combinations cancel or stall the streaming pipe silently. GitHub Pages serves the MIME type
correctly, but the client-side streaming path still fails on a subset of Android devices.

**Fix**: fallback to the non-streaming compile path on error:
```javascript
let module;
try {
  module = await WebAssembly.compileStreaming(fetch(wasmUrl));
} catch (_) {
  // Android browsers sometimes silently fail streaming compile — fall back
  const buf = await (await fetch(wasmUrl)).arrayBuffer();
  module = await WebAssembly.compile(buf);
}
```

`arrayBuffer → compile` is universally supported and has no streaming dependency.
We also added a two-step progress indicator (`1/2 compiling… → 2/2 init…`) so users know
the page is alive during the 31 MB download.

### Bug 3 — iOS Safari page eviction (mid-session state wipe)

**Symptom**: Player switches to LINE mid-quiz — or mid-form — comes back, and the page
restarts from scratch. Happened across iOS versions; we never pinned down a specific release.
iOS Safari evicts background tabs from memory and triggers a full reload when revisited.

**Fix**: serialize quiz state to `sessionStorage` after every state transition:
```javascript
function saveState() {
  sessionStorage.setItem('quizState', JSON.stringify({
    questionIndex, score, questions  // questions = [{defIndex, raw}] — rebuild-safe
  }));
}
// On init(), before starting fresh:
const saved = sessionStorage.getItem('quizState');
if (saved) restoreFrom(JSON.parse(saved));
```

The key detail: we store `{defIndex, raw}` pairs (indices into the task bank + the
generated secret value) rather than the full rendered HTML, so questions can be faithfully
reconstructed after a reload without storing potentially large DOM content.
State is cleared when the player reaches the proof phase (game complete).

### Community value

None of these bugs appear in the ruby.wasm documentation. Anyone building a similar
educational or outreach tool — and the community-booth use case is highly replicable —
will hit all three without warning. This talk gives them the exact fixes before they hit the wall.

The broader message: ruby.wasm is production-ready for community outreach (no server, no
install, runs on any phone), but mobile WebAssembly support in 2026 still has sharp edges
that only appear under real conference conditions.

---

## Pitch (review committee)

Most ruby.wasm talks focus on capability ("look what you can run in the browser"). This talk
covers the other half: what breaks in a real mobile deployment, the specific root causes,
and fixes short enough to type on stage.

The system is real: it ran at SITCON 2026, Taiwan's largest student tech conference (~1,000
attendees). Players were non-Rubyists — students who had never written Ruby — which means the
game had to be rock-solid across every phone they handed us. The bugs above all appeared on
actual booth hardware, not in a dev environment.

I'm a Ruby Taiwan community member who helps run the Ruby booth at Taiwanese developer
conferences. I can live-demo the game from an iPhone on stage via iOS Handoff, showing the
exact `compileStreaming` fallback progress indicator and the sessionStorage restore in action.

---

## Bio (≤500 chars)

Ruby Taiwan community member. I help run the Ruby booth at Taiwanese developer conferences,
introducing Ruby to students who have never written a line of it. I built the SITCON 2026
booth challenge game — a ruby.wasm quiz where strangers run real Ruby on their phone — and
fixed three mobile browser bugs on conference day, some while the booth was still running.

---

Char count: ~410 ✓ (under 500)

---

## Language

English

---

## Suggested slide structure (5 min)

- 0:00 — Hook: "your wasm works on your Mac. Does it work on this?" (show phone)
- 0:30 — What we built: game demo live on iPhone via Handoff (30 sec)
- 1:00 — Bug 1: iOS Safari asyncify stack overflow → warm-up + retry fix
- 2:00 — Bug 2: Android silent streaming compile → arrayBuffer fallback
- 3:00 — Bug 3: iOS page eviction → sessionStorage snapshot
- 4:00 — Conclusion: ruby.wasm is ready, but bring your fallbacks
- 4:30 — QR code to the live site / repo
