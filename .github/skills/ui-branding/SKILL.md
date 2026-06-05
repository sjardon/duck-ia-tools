---
name: ui-branding
description: >
  Enforces the visual branding conventions of this React + Tailwind SaaS project (Duck Advisor).
  Use this skill whenever creating, editing, or reviewing UI components to ensure
  they match the established color palette, typography, spacing, shape language,
  and interaction patterns of the existing codebase.
argument-hint: '[component name or description]'
---

# UI Branding Skill

## Purpose

Duck Advisor design system: Next.js 15 + Tailwind CSS 4 + shadcn/ui (New York style). Palette: Mallard Teal `#006B7D`, Golden Yellow `#F5A623`, Cream `#FFF8E7`, Deep Navy `#003D47`, Light Teal `#4ECDC4`. Font: Geist. This skill prevents visual drift when adding components or pages.

---

## Color Rules

- Primary actions/headings: `bg-[#006B7D]` / `text-[#006B7D]`. Hover: `hover:bg-[#005568]`.
- Accent highlights/logo: `bg-[#F5A623]` / `fill-[#F5A623]`. Hover: `hover:bg-[#e09615]`.
- Marketing page backgrounds: `bg-[#FFF8E7]`. Body text/sidebar/footer: `bg-[#003D47]` / `text-[#003D47]`.
- Secondary interactive: `#4ECDC4`. Hover borders: `hover:border-[#4ECDC4]`. Gradient endpoint: `to-[#4ECDC4]`.
- Secondary text: `text-[#003D47]/70`. Muted/captions: `text-[#003D47]/50`. Accent timestamps: `text-xs text-[#4ECDC4]`.
- Subtle backgrounds: `bg-[#4ECDC4]/10`, `bg-[#006B7D]/10`. Borders: `border-[#4ECDC4]/30` (default), `border-[#4ECDC4]/20` (subtle).
- CTA gradient: `bg-gradient-to-r from-[#006B7D] to-[#4ECDC4]`. Hover: `hover:from-[#005568] hover:to-[#3db8af]`.
- Dark section bg: `bg-gradient-to-br from-[#006B7D] to-[#003D47]`.
- Destructive: always `variant="destructive"` — never hardcode red. Exception: `border-red-200` for the Danger Zone card only.
- Never introduce hex colors outside this palette. Never use raw `opacity-70` on text — use the `/opacity` color modifier.
- Do not add dark mode variants; `@custom-variant dark` is declared but intentionally unused.

---

## Typography Rules

- Font: Geist via `next/font/google`, applied as `font-sans antialiased` on `<body>`. Never override in component className.
- H1 (dashboard): `text-3xl font-bold text-[#006B7D]`.
- H1 (landing): `text-4xl md:text-5xl font-bold text-[#006B7D]`.
- H1 (auth, gradient): `bg-clip-text text-transparent bg-gradient-to-r from-[#006B7D] to-[#4ECDC4]`.
- H2 (section): `text-4xl md:text-5xl font-bold text-[#006B7D] mb-6 text-balance`.
- H3 (marketing card): `text-xl font-bold text-[#006B7D]`. H3 (dashboard): `font-semibold text-[#003D47]`.
- Labels: `text-sm font-medium text-[#003D47] block mb-2`. Body descriptions: `text-[#003D47]/70`.
- Weights: `font-medium`, `font-semibold`, `font-bold` only. Never `font-black` or `font-light`.
- Prefer `text-balance` on headings, `text-pretty` on paragraphs, `leading-relaxed` on multi-line card copy.

---

## Spacing & Layout Rules

- Single-column pages: `max-w-4xl mx-auto`. Landing: `container mx-auto px-4`. Max grid: `max-w-7xl`.
- Card padding: `p-6` (standard), `p-8` (auth/prominent). Landing sections: `py-24`. Forms: `space-y-4`.
- Gaps: button icon `gap-2`, nav items `gap-3`, compact card grids `gap-6`, section card grids `gap-8`.
- Grids: `grid md:grid-cols-2 lg:grid-cols-3 gap-8` (3-col), `grid md:grid-cols-2 gap-8` (2-col), `grid md:grid-cols-3 gap-8` (pricing).
- Prefer `gap-*` over individual margins in flex/grid layouts.

---

## Shape & Border Rules

- Buttons/inputs: `rounded-md`. Standard cards: `rounded-xl`. Auth/hero cards: `rounded-2xl`.
- Logos/avatars/badges/pills: `rounded-full`. Sidebar nav items + small icon containers: `rounded-lg`.
- Card border at rest: `border bg-white`. Brand accent: `border-[#4ECDC4]/20` → `hover:border-[#4ECDC4]`.
- Featured/popular cards: `border-2 border-[#F5A623]`. CTA outline buttons: `border-2`. Never use `border-gray-*`.

## Elevation & Shadow Rules

- Cards at rest: `shadow-sm`. Interactive hover: `hover:shadow-lg`. Auth/hero cards: `shadow-2xl`. Popular pricing: `shadow-xl`.
- Dropdowns/popovers: `shadow-md`. Inputs: `shadow-xs` (shadcn default, do not override).
- Layered model: xs→sm→md→lg→xl→2xl. Never skip more than one level. Never use `shadow-none` on interactive elements.

---

## Component Patterns

### Buttons

```tsx
// Primary
<Button className="bg-[#006B7D] text-white hover:bg-[#005568]">Action</Button>
// Gradient CTA
<Button className="bg-gradient-to-r from-[#006B7D] to-[#4ECDC4] hover:from-[#005568] hover:to-[#3db8af] text-white">CTA</Button>
// Yellow accent
<Button className="bg-[#F5A623] hover:bg-[#e09615] text-white">Get Started</Button>
// Ghost
<Button variant="ghost" className="text-[#006B7D] hover:bg-[#4ECDC4]/20">Cancel</Button>
// Outline (light bg)
<Button variant="outline" className="border-2 border-[#006B7D] text-[#006B7D] hover:bg-[#006B7D] hover:text-white bg-transparent">Learn More</Button>
// Outline (dark bg)
<Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#006B7D] bg-transparent">Secondary</Button>
// Destructive
<Button variant="destructive">Delete</Button>
```

- Hero CTAs: `size="lg" px-8`. Compact: `size="sm"`. Icon-only: `size="icon"`. Always use `<Button>` — never raw `<button>`.

### Cards

```tsx
// Standard dashboard
<div className="bg-white rounded-xl shadow-sm border p-6">...</div>
// Interactive (chat list item)
<div className="bg-white rounded-xl border hover:border-[#4ECDC4] hover:shadow-lg transition-all cursor-pointer p-4">...</div>
// Auth / prominent
<div className="bg-white rounded-2xl shadow-2xl p-8">...</div>
// Landing feature (shadcn base)
<Card className="border-2 border-transparent hover:border-[#4ECDC4]/30 transition-all duration-300 hover:shadow-lg">
  <CardContent className="p-8">...</CardContent>
</Card>
```

- Use shadcn `<Card>` for dashboard/settings. Raw `<div>` only for chat items or tightly controlled layouts.

### Form Inputs

```tsx
<div>
  <Label htmlFor="f" className="block text-sm font-medium text-[#003D47] mb-2">
    Field
  </Label>
  <Input id="f" className="border-[#4ECDC4]/30 focus-visible:border-[#006B7D]" />
</div>
```

- Always use shadcn `<Input>` and `<Label>`. Form wrapper: `space-y-4`. Label above input with `mb-2`.

### Badges

```tsx
<Badge className="bg-[#006B7D] text-white">Active</Badge>
<Badge variant="outline">Status</Badge>
// Accent info pill
<div className="inline-flex items-center gap-2 bg-[#4ECDC4]/20 text-[#4ECDC4] px-4 py-2 rounded-full text-sm font-medium">
  <Icon className="w-4 h-4" /><span>Label</span>
</div>
```

- Always `rounded-full`. Use accent pill pattern for informational labels on landing pages.

### Navigation (Sidebar)

- Background: `bg-[#003D47]`. Active item: `bg-[#006B7D] rounded-lg text-white`. Inactive: `text-white/70 hover:bg-white/5 rounded-lg transition-colors`.
- Nav items: `flex items-center gap-3 px-3 py-2`. Icon size: `w-5 h-5`.
- Logo: `<div className="w-10 h-10 bg-[#006B7D] rounded-full flex items-center justify-center">` + `<svg className="w-6 h-6 fill-[#F5A623]">`.
- Wordmark: `text-xl font-bold`. Wrap lockup in `<Link href="/" className="flex items-center gap-3">`.

### Modals / Overlays

- Always use shadcn `<Dialog>` — no custom modal implementations.
- Surface: `bg-white rounded-2xl shadow-2xl p-8` (follows auth card conventions).

---

## Iconography Rules

- Always use **Lucide React**. No Heroicons, FontAwesome, or inline SVG (duck logo SVG path is the only exception).
- Sizes: button `w-4 h-4`, nav `w-5 h-5`, large `w-6 h-6`.
- Icon containers: `w-10 h-10 rounded-full` (≤40px), `w-14 h-14 rounded-xl` (≥48px).
- Colors: `text-white` on dark/teal bg, `text-[#4ECDC4]` for accent icons, `text-[#006B7D]` on white.

## Interaction & Motion Rules

- All interactive elements must include `transition-all` or `transition-colors` plus an explicit `duration-*`. Never use `transition` alone.
- Component transitions: `duration-200`. Section/layout transitions: `duration-300`.
- Interactive cards: always pair `hover:shadow-lg` with `hover:border-[#4ECDC4]` — never one without the other.
- Icon containers in interactive cards: add `group` to parent, `group-hover:scale-110 transition-transform` to the icon container.
- Loading states: `animate-pulse`. Focus rings: rely on shadcn `focus-visible:ring-[3px]` — never override.

## Logo & Brand Lockup Rules

- Duck logo: `<div className="w-10 h-10 bg-[#006B7D] rounded-full flex items-center justify-center">` containing `<svg className="w-6 h-6 fill-[#F5A623]">`.
- Wordmark always follows: `<span className="text-xl font-bold">Duck Advisor</span>`.
- Never render the duck SVG outside a teal `rounded-full` container. Never change duck fill from `#F5A623`.

---

## ⚠️ Branding Gaps & Conflicts

1. **No modal precedent**: No `<Dialog>` exists yet. First implementation sets the canonical pattern — follow auth card conventions.
2. **Dark mode undeclared**: `@custom-variant dark` declared but unused. Remove or document before any dark mode work begins.
3. **Inconsistent H3 color**: `text-[#006B7D]` (marketing) vs `text-[#003D47]` (dashboard) — both intentional per context, apply consistently.
4. **Toast pattern missing**: `sonner` is a dependency but no position/brand color override is defined yet.
5. **`border-2` vs `border`**: Marketing/emphasis cards use `border-2`; functional dashboard cards use `border`. Rule: match context.
6. **`text-balance`/`text-pretty`**: Currently landing-page-only. Decide if global adoption is desired.
7. **Icon container shape**: `rounded-full` (≤40px) vs `rounded-xl` (≥48px) — apply consistently by container size.
