# 또박 또박 Design System

## 0. Research Log

- Video reference: Instagram reel `DIyYENwPAPW` sampled as a 38-second portrait interaction reference. Its useful grammar is a camera backdrop, receding road, brick word-wall, prominent microphone action, and an in-place success reveal.
- Generated visual references: `/Users/seojeong-il/.codex/generated_images/01a182fa-8873-7ef0-a956-5c612354d539/exec-ecd30b50-442e-477e-a514-8d809fa0bf92.png` (success) and `exec-2515399d-c30b-4c6b-b5d4-e19d8db164fc.png` (listening). Adopted their cream progress panel, terracotta wall, charcoal road, leaf-green success, and generous single-action composition.
- Embedded design references: the supplied video plus the two generated game-screen studies above. No brand system was copied.
- Lazyweb and StyleGallery: skipped; this is a single-screen educational game whose concrete video and generated state studies already specify the needed spatial grammar.
- Image use: the studies are visual references only. The product is rendered with live HTML/CSS/SVG rather than a screenshot background.

## 1. Atmosphere & Identity

An outdoor pronunciation playground: calm enough for a learner to repeat a word without pressure, but tactile enough that a correct answer feels physical. The signature is the *word wall*: a large clay-brick obstacle on a small receding road that cracks open only when pronunciation succeeds.

## 2. Color

| Role | Token | Value | Usage |
|---|---|---:|---|
| Sky | `--sky-top` | `#8FC9F2` | Upper scene atmosphere |
| Sky light | `--sky-bottom` | `#DDF2F2` | Horizon atmosphere |
| Cream | `--cream` | `#FFF9E9` | Panels, microphone surface |
| Cream shade | `--cream-shade` | `#F1E8D4` | Inset and button depth |
| Ink | `--ink` | `#312B28` | Primary copy and icons |
| Muted ink | `--ink-muted` | `#685D55` | Supporting copy |
| Brick light | `--brick-light` | `#D97B59` | Brick highlights |
| Brick | `--brick` | `#B94F38` | Wall material |
| Brick dark | `--brick-dark` | `#8C342A` | Wall depth |
| Road | `--road` | `#3B3D42` | Road base |
| Leaf | `--leaf` | `#63B76B` | Plants, positive ambience |
| Success | `--success` | `#3BBF5B` | Correct-answer glyph and progress |
| Coral | `--coral` | `#FF866F` | Listening signal and retry copy |
| White | `--white` | `#FFFFFF` | High-contrast word face |

Color is semantic: terracotta means the current obstacle, coral means active listening or a retry, and green means success only. No colored outline communicates selection; focus uses `--ink` with a cream offset.

## 3. Typography

- Primary: `"Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif`
- Display: `"Black Han Sans", "Noto Sans KR", sans-serif`
- Display: `clamp(3rem, 14vw, 5.5rem)`, 400, 0.92 line-height, target word
- H1: `clamp(1.75rem, 7vw, 2.5rem)`, 700, 1.16 line-height, complete state
- Body: `1rem`, 600, 1.5 line-height, instructions and controls
- Caption: `0.8125rem`, 700, 1.4 line-height, progress and status

## 4. Spacing & Layout

- Base unit: `4px`.
- `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`.
- The app has one scroll owner: the document. The game canvas is `min-height: 100dvh` and centered at a portrait-friendly max width of `560px`.
- The progress panel sits in the top safe area. The word wall occupies the visual lower third. The primary microphone action is anchored above the safe-area bottom and never overlaps a text control.

## 5. Components

### Progress panel
- **Structure**: progress text, five dots, one instructional sentence, optional camera button.
- **States**: ready, listening, success, retry, completed.
- **Accessibility**: text progress and a native `button`; instructions never rely on color alone.
- **Motion**: a dot fills with `opacity` and `transform`; reduced motion changes opacity only.

### Word wall
- **Structure**: brick wall, target word, success badge, decor plants.
- **States**: ready, listening, success, retreating for next word.
- **Accessibility**: target word remains text in the DOM, inside a labelled game region.
- **Motion**: correct answer triggers a short transform/opacity crack-away followed by the next wall; reduced motion cross-fades.

### Microphone action
- **Structure**: native circular button, inline microphone SVG, label, optional listening arcs.
- **States**: ready, listening, unavailable, retry, success cooldown.
- **Accessibility**: 64px minimum hit target, descriptive dynamic `aria-label`, keyboard reachable, visible focus, polite status output.
- **Motion**: press scales to `0.94`; listening arcs use opacity and transform; reduced motion uses an opacity pulse.

### Completion panel
- **Structure**: live heading, summary, restart button.
- **States**: hidden, open.
- **Accessibility**: first focus lands on restart, background game controls become inert, restart is fully keyboard reachable.
- **Motion**: opacity/transform entrance; reduced motion is opacity only.

## 6. Motion & Interaction

| Token | Value | Usage |
|---|---|---|
| `--ease-emphasis` | `cubic-bezier(.16, 1, .3, 1)` | Wall and completion transition |
| `--duration-micro` | `150ms` | Button press and dots |
| `--duration-standard` | `280ms` | Listening/retry surface updates |
| `--duration-emphasis` | `560ms` | Successful wall break |

The microphone adopts the interaction reference's press behavior: immediate scale feedback and an in-place state label. It does not use a decorative ripple. Correct pronunciation has one feedback sequence: check appears, wall retreats, a new word arrives. With reduced motion, all spatial movement is replaced by a cross-fade while the wording and live-region status remain identical.

## 7. Depth & Surface

Depth strategy: mixed, with tonal layers for panels and soft shadows for touchable physical objects. The cream panel uses an outer white highlight, soft umber shadow, and a cream inset. The wall uses a warm gradient plus a repeating brick joint texture. Radius tokens: `--radius-panel: 28px`, `--radius-control: 999px`, `--radius-small: 12px`.

## 8. Accessibility Constraints & Accepted Debt

- WCAG target: 2.2 AA. Body/text contrast targets 4.5:1; interactive controls have keyboard focus; status changes are announced; motion respects `prefers-reduced-motion`.
- Personas: a Korean learner using a keyboard, a learner who cannot grant camera permission, a learner using a screen reader, and a learner sensitive to movement.
- Adaptive requirements: camera remains optional; a camera denial never blocks pronunciation; speech-recognition unavailability gives a plain-language message; no sound is required to understand success.
- Accepted debt: Web Speech API availability and recognition accuracy vary by browser and network. The screen reports this limitation rather than pretending every browser can score speech locally.
