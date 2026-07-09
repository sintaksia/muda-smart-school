# Design System — Banking / Fintech (Jago-inspired)

Give this whole file to Claude Code as the source of truth. Don't deviate from
the tokens below — consistency across every screen is the point.

## 0. Design intent (read before building)

- Calm, trustworthy, high-clarity fintech UI. Confident white space, not dense.
- Deep indigo (#32368C) is the _identity_ color — used for primary actions,
  nav, headers, key numbers. Teal (#088987) is the _secondary/live_ color —
  used for positive states, secondary actions, highlights, links inside dark
  surfaces.
- Avoid the generic "AI app" tells: no purple→pink gradients, no glassmorphism,
  no glowing blurred blobs behind cards, no giant soft `shadow-2xl` on every
  element, no all-corners-fully-rounded (`rounded-full`) buttons everywhere.
- Instead: flat or very subtle gradients (same-hue, low-contrast only),
  1px hairline borders as the primary separator (shadows are secondary and
  restrained), consistent 16–20px card radius (not pill-shaped), and real
  content hierarchy through type weight/size, not color noise.

---

## 1. Color tokens

### Brand

| Token                 | Hex       | Use                                                            |
| --------------------- | --------- | -------------------------------------------------------------- |
| `--color-primary`     | `#32368C` | Primary buttons, active nav, headings on light bg, brand marks |
| `--color-primary-600` | `#3D42A6` | Hover state of primary                                         |
| `--color-primary-700` | `#282C70` | Pressed/active state, dark headers                             |
| `--color-primary-100` | `#E5E6F5` | Tinted backgrounds, selected chips                             |
| `--color-primary-50`  | `#F3F3FB` | Faint section backgrounds                                      |
| `--color-teal`        | `#088987` | Secondary actions, positive/live indicators, links             |
| `--color-teal-600`    | `#0AA3A0` | Hover state of teal                                            |
| `--color-teal-700`    | `#066866` | Pressed teal                                                   |
| `--color-teal-100`    | `#DFF3F2` | Success/positive tinted backgrounds, badges                    |

### Neutrals (do not use pure gray-500 defaults — these are warmed slightly toward the indigo hue so the palette feels unified)

| Token                    | Hex       | Use                                     |
| ------------------------ | --------- | --------------------------------------- |
| `--color-white`          | `#FFFFFF` | Card surfaces, primary background       |
| `--color-surface`        | `#F7F7FB` | App background (very faint indigo tint) |
| `--color-border`         | `#E4E4EE` | Hairline card/input borders             |
| `--color-border-strong`  | `#CBCBDE` | Dividers that need more presence        |
| `--color-text-primary`   | `#1B1C33` | Headings, primary text                  |
| `--color-text-secondary` | `#5B5D75` | Body/secondary text                     |
| `--color-text-muted`     | `#8B8DA3` | Placeholder, captions, timestamps       |

### Semantic (derived, not arbitrary — keep the family unified)

| Token             | Hex       | Use                                                   |
| ----------------- | --------- | ----------------------------------------------------- |
| `--color-success` | `#088987` | Reuse brand teal — success = teal, not a random green |
| `--color-warning` | `#C97A2B` | Warnings (warm amber, muted — not neon yellow)        |
| `--color-danger`  | `#C4433D` | Errors, destructive actions                           |
| `--color-info`    | `#32368C` | Info = brand primary                                  |

Never introduce a hue outside this list without a stated reason. No default
Tailwind `blue-500` / `purple-500` / `indigo-500` — those clash with the brand
indigo and are the #1 "this looks AI-generated" tell.

---

## 2. Typography — Inter

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

Use `font-feature-settings: 'tnum' 1;` (tabular numbers) on any element
showing balances, amounts, or numeric tables — this alone makes financial UI
feel considered instead of default.

| Role                                 | Size | Weight | Line-height | Letter-spacing    |
| ------------------------------------ | ---- | ------ | ----------- | ----------------- |
| Display (balance, hero number)       | 36px | 800    | 1.1         | -0.02em           |
| H1 (page title)                      | 28px | 700    | 1.2         | -0.01em           |
| H2 (section title)                   | 20px | 700    | 1.3         | -0.01em           |
| H3 (card title)                      | 16px | 600    | 1.4         | 0                 |
| Body                                 | 14px | 400    | 1.55        | 0                 |
| Body strong                          | 14px | 600    | 1.55        | 0                 |
| Caption / meta                       | 12px | 500    | 1.4         | 0.01em            |
| Micro label (eyebrow, uppercase tag) | 11px | 600    | 1.2         | 0.06em, uppercase |

Rules:

- Never use font-weight 300 or below — reads as fragile on financial data.
- Headings use `--color-text-primary`, never brand color directly on body
  copy (reserve brand color for interactive/emphasis elements only).

---

## 3. Spacing & radius scale

Use an 4px base scale, applied consistently — don't invent one-off values.

```
--space-1: 4px   --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 20px  --space-6: 24px  --space-7: 32px  --space-8: 40px
--space-9: 48px  --space-10: 64px
```

Radius — this is the signature consistency rule for the whole system:

```
--radius-sm: 10px   /* inputs, chips, small buttons */
--radius-md: 16px   /* standard cards */
--radius-lg: 20px   /* hero/feature cards, modals */
--radius-full: 999px /* avatars, status dots, pill badges ONLY — never buttons/cards */
```

Never mix radius values within the same visual tier. If one transaction-list
card uses 16px, every transaction-list card uses 16px.

---

## 4. Elevation (restrained — hairline first, shadow second)

Prefer a 1px border over a shadow. Only add shadow when a card floats above
another surface (modals, dropdowns) or on hover.

```css
--border-card: 1px solid var(--color-border);

--shadow-xs: 0 1px 2px rgba(27, 28, 51, 0.04);
--shadow-sm: 0 2px 8px rgba(27, 28, 51, 0.06);
--shadow-md: 0 8px 24px rgba(27, 28, 51, 0.1); /* modals, popovers only */
--shadow-hover: 0 4px 14px rgba(50, 54, 140, 0.12); /* interactive card hover */
```

Do not use `shadow-2xl`, blurred colored glows, or double-shadow stacking.

---

## 5. Card component (the core building block)

```css
.card {
  background: var(--color-white);
  border: var(--border-card);
  border-radius: var(--radius-md);
  padding: var(--space-5) var(--space-5);
  transition:
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.card:hover {
  /* only if the card is interactive/clickable */
  box-shadow: var(--shadow-hover);
  border-color: var(--color-border-strong);
}

.card--primary {
  /* e.g. account balance hero card */
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-700) 100%
  );
  color: var(--color-white);
  border: none;
}

.card--outline-teal {
  /* promo / highlight card, used sparingly */
  background: var(--color-teal-100);
  border: 1px solid rgba(8, 137, 135, 0.25);
  color: var(--color-text-primary);
}
```

Card content rules:

- One clear header row: icon or eyebrow label + title, optional right-aligned
  action/chevron.
- Amounts always right-aligned in list rows, tabular-nums, weight 600.
- Max 1 shadow tier per card. Never stack a gradient AND a shadow AND a border
  on the same card — pick one elevation method.
- Icons: use a single consistent icon set (e.g. Lucide) at 20px, stroke-width
  1.75 — not mixed emoji + icon-font + svg.

---

## 6. Buttons

| Variant          | Background                                      | Text                     | Border                | Radius        |
| ---------------- | ----------------------------------------------- | ------------------------ | --------------------- | ------------- |
| Primary          | `--color-primary` (hover `-600`, active `-700`) | white                    | none                  | `--radius-sm` |
| Secondary (teal) | `--color-teal` (hover `-600`)                   | white                    | none                  | `--radius-sm` |
| Outline          | transparent                                     | `--color-primary`        | 1px `--color-primary` | `--radius-sm` |
| Ghost            | transparent                                     | `--color-text-secondary` | none                  | `--radius-sm` |
| Destructive      | `--color-danger`                                | white                    | none                  | `--radius-sm` |

Height: 44px default (touch-friendly), 36px compact. Padding-x: 20px.
Font: 14px/600. No `rounded-full` pill buttons — this is the single most
common "AI slop" tell in fintech mockups; keep the 10px radius consistent
with inputs.

---

## 7. Motion

- 120–180ms ease-out for hover/press states only.
- Page-level transitions: one subtle fade+8px slide on route change, nothing
  more.
- No bouncing, no scale-pulse loaders, no shimmering rainbow skeletons —
  use a flat `--color-primary-50` pulse for skeleton loaders.

---

## 8. What to explicitly avoid

- Purple-to-pink or purple-to-blue decorative gradients anywhere except the
  single `.card--primary` hero treatment above.
- Glassmorphism / frosted blur panels.
- Emoji as icons in production UI.
- Centered-everything layouts — align to a real grid, left-align body text.
- Mixing multiple accent hues "for variety" — every non-neutral color used
  must map back to a token in Section 1.

---

## 9. Tailwind config (drop-in)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#32368C",
          50: "#F3F3FB",
          100: "#E5E6F5",
          600: "#3D42A6",
          700: "#282C70",
        },
        teal: {
          DEFAULT: "#088987",
          100: "#DFF3F2",
          600: "#0AA3A0",
          700: "#066866",
        },
        surface: "#F7F7FB",
        border: { DEFAULT: "#E4E4EE", strong: "#CBCBDE" },
        text: { primary: "#1B1C33", secondary: "#5B5D75", muted: "#8B8DA3" },
        success: "#088987",
        warning: "#C97A2B",
        danger: "#C4433D",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      borderRadius: { sm: "10px", md: "16px", lg: "20px" },
      boxShadow: {
        xs: "0 1px 2px rgba(27,28,51,0.04)",
        sm: "0 2px 8px rgba(27,28,51,0.06)",
        md: "0 8px 24px rgba(27,28,51,0.10)",
        hover: "0 4px 14px rgba(50,54,140,0.12)",
      },
    },
  },
};
```
