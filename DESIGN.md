# Three Origin — Vibrant Streetwear Urban

## Direction
Neon-soaked urban streetwear aesthetic. Deep charcoal foundation with electric cyan, hot magenta, and lime green accents. Premium, bold, high-contrast. Designed for energy and memorability.

## Tone & Differentiation
**Tone:** Bold maximalism. Streetwear-inspired, audacious, unapologetically colorful.  
**Differentiation:** Neon accents pop against dark charcoal; interactive elements glow on hover; premium typography (BricolageGrotesque heavy, Satoshi clean).

## Palette

| Token | OKLCH | Hex (approx) | Usage |
|-------|-------|------|-------|
| Background | 0.15 0 0 | #1a1a1a | Base dark charcoal |
| Foreground | 0.95 0 0 | #f2f2f2 | Off-white text |
| Primary (Cyan) | 0.60 0.20 200 | #00d9ff | CTAs, highlights, hover states |
| Secondary (Magenta) | 0.55 0.22 315 | #ff0099 | Accent buttons, badges |
| Accent (Lime) | 0.75 0.18 120 | #b3ff00 | Success, active states |
| Muted | 0.35 0 0 | #4d4d4d | Cards, secondary text |
| Destructive (Red) | 0.60 0.25 30 | #ff3333 | Errors, warnings |

## Typography
**Display:** BricolageGrotesque (heavy weight, 700–800) — hero, headings, CTAs  
**Body:** Satoshi (regular weight, 400–500) — body text, descriptions  
**Mono:** System monospace for code/technical content

## Structural Zones

| Zone | Background | Border | Detail |
|------|------------|--------|--------|
| Header/Nav | Muted (dark grey) | Primary cyan, 1px | High contrast, sticky on scroll |
| Hero | Gradient charcoal→purple | None | Neon cyan/magenta text overlay, glow effects |
| Content Cards | Card (deep charcoal) | Muted border, subtle | Soft shadows, hover lift effect |
| Product Grid | Background | None | Grid gap consistent, individual card borders |
| CTA Buttons | Primary (cyan) or Secondary (magenta) | None | Rounded corners, drop shadow on hover, bold typography |
| Footer | Sidebar (very dark) | Primary border, top | Legal links, contact info in muted text |

## Spacing & Rhythm
- **Density:** Tight on mobile, relaxed on desktop (`sm:`, `md:` breakpoints)
- **Gap:** 16px (cards), 24px (sections), 8px (inline elements)
- **Padding:** 16px card interior, 24px section padding

## Components & Patterns
- **Buttons:** Always neon — Primary (cyan) for main actions, Secondary (magenta) for secondary. Bold fonts. Hover: glow shadow effect.
- **Cards:** Dark charcoal with 1px muted border. Hover: lift (translate-y-1) + primary glow.
- **Product Images:** Full-width, 16:9 aspect ratio, borders inherit card styling.
- **Inputs:** Dark grey with cyan focus ring. Placeholder text in muted.

## Motion & Animation
- **Transitions:** All interactive elements use `transition-neon` (300ms ease-in-out).
- **Hover states:** Glow effect (shadow-primary/50 or shadow-secondary/50), slight lift on cards.
- **Loading:** Pulse animation on async elements.

## Constraints
- Mobile-first responsive design.
- Minimum contrast ratio 4.5:1 (AA) on all text.
- No auto-playing video or animation > 5s.
- Functional accessibility (keyboard nav, screen readers).

## Signature Detail
Neon hover glow on interactive elements (buttons, cards, links) — cyan shadows for primary actions, magenta shadows for secondary. This creates a premium, energetic feel reminiscent of high-end streetwear and urban retail spaces.

